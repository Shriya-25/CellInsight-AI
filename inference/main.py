import io
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import tensorflow as tf

app = FastAPI(title="HemaVision Inference Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load both models once at startup
detector = YOLO("best.pt")
DETECTOR_CLASSES = detector.names  # {0: 'WBC', 1: 'RBC', 2: 'Platelets'}

classifier = tf.keras.models.load_model("wbc_classifier_v3_finetuned.keras")
print("Loaded classifier from: wbc_classifier_v2.keras")
print(classifier.summary())
# Must match the alphabetical order Keras used during training
WBC_SUBTYPES = ['basophil', 'erythroblast', 'monocyte', 'myeloblast', 'seg_neutrophil']
CLASSIFIER_INPUT_SIZE = (224, 224)


def classify_wbc_crop(original_image: Image.Image, box):
    x1, y1, x2, y2 = box
    box_w = x2 - x1
    box_h = y2 - y1

    padding_factor = 1.5
    pad_x = box_w * padding_factor
    pad_y = box_h * padding_factor

    padded_x1 = max(0, x1 - pad_x)
    padded_y1 = max(0, y1 - pad_y)
    padded_x2 = min(original_image.width, x2 + pad_x)
    padded_y2 = min(original_image.height, y2 + pad_y)

    context_crop = original_image.crop((padded_x1, padded_y1, padded_x2, padded_y2))

    resized = context_crop.resize(CLASSIFIER_INPUT_SIZE)
    array = tf.keras.utils.img_to_array(resized)
    array = tf.keras.applications.efficientnet.preprocess_input(array)
    array = np.expand_dims(array, axis=0)

    predictions = classifier.predict(array, verbose=0)[0]
    predicted_idx = int(np.argmax(predictions))
    confidence = float(predictions[predicted_idx])

    return WBC_SUBTYPES[predicted_idx], confidence
    x1, y1, x2, y2 = box
    box_w = x2 - x1
    box_h = y2 - y1

    # Expand the crop outward to include surrounding context (matches Kaggle framing)
    padding_factor = 1.5  # expand by 150% on each side
    pad_x = box_w * padding_factor
    pad_y = box_h * padding_factor

    padded_x1 = max(0, x1 - pad_x)
    padded_y1 = max(0, y1 - pad_y)
    padded_x2 = min(original_image.width, x2 + pad_x)
    padded_y2 = min(original_image.height, y2 + pad_y)

    context_crop = original_image.crop((padded_x1, padded_y1, padded_x2, padded_y2))

    resized = context_crop.resize(CLASSIFIER_INPUT_SIZE)
    array = tf.keras.utils.img_to_array(resized)
    array = tf.keras.applications.efficientnet.preprocess_input(array)
    array = np.expand_dims(array, axis=0)

    predictions = classifier.predict(array, verbose=0)[0]
    predicted_idx = int(np.argmax(predictions))
    confidence = float(predictions[predicted_idx])

    return WBC_SUBTYPES[predicted_idx], confidence


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read image")

    results = detector.predict(image, verbose=False)[0]

    counts = {"WBC": 0, "RBC": 0, "Platelets": 0}
    wbc_subtype_counts = {name: 0 for name in WBC_SUBTYPES}
    detections = []

    for box in results.boxes:
        cls_id = int(box.cls[0])
        cls_name = DETECTOR_CLASSES[cls_id]
        confidence = float(box.conf[0])
        x1, y1, x2, y2 = [float(v) for v in box.xyxy[0]]

        counts[cls_name] = counts.get(cls_name, 0) + 1

        detection = {
            "class": cls_name,
            "confidence": round(confidence, 3),
            "box": {"x1": x1, "y1": y1, "x2": x2, "y2": y2},
        }

        # Only WBCs get sent to the subtype classifier
        if cls_name == "WBC":
            subtype, subtype_confidence = classify_wbc_crop(image, (x1, y1, x2, y2))
            detection["subtype"] = subtype
            detection["subtypeConfidence"] = round(subtype_confidence, 3)
            wbc_subtype_counts[subtype] += 1

        detections.append(detection)

    total_cells = sum(counts.values())

    return {
        "totalCells": total_cells,
        "rbcCount": counts["RBC"],
        "wbcCount": counts["WBC"],
        "plateletCount": counts["Platelets"],
        "wbcSubtypes": wbc_subtype_counts,
        "detections": detections,
    }