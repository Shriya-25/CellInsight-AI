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

    # Expand the crop outward to include surrounding context
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

import cv2

def assess_image_quality(image: Image.Image):
    """
    Computes a simple quality score based on blur (Laplacian variance) 
    and brightness (average pixel intensity).
    Returns (quality_score, status, reasons, penalty)
    """
    # Convert PIL Image to OpenCV BGR format
    open_cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    gray = cv2.cvtColor(open_cv_image, cv2.COLOR_BGR2GRAY)
    
    # 1. Blur check
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    is_blurry = laplacian_var < 100
    
    # 2. Brightness check
    avg_brightness = np.mean(gray)
    is_too_dark = avg_brightness < 50
    is_too_bright = avg_brightness > 200
    
    reasons = []
    penalty = 0.0
    
    if is_blurry:
        reasons.append(f"Image is out of focus (variance: {laplacian_var:.1f})")
        penalty += 0.4
    if is_too_dark:
        reasons.append(f"Image is underexposed (brightness: {avg_brightness:.1f})")
        penalty += 0.3
    if is_too_bright:
        reasons.append(f"Image is overexposed (brightness: {avg_brightness:.1f})")
        penalty += 0.3
        
    quality_score = max(0.0, 1.0 - penalty)
    
    if penalty >= 0.4:
        status = "Poor"
    elif penalty > 0:
        status = "Fair"
    else:
        status = "Good"
        
    return quality_score, status, reasons, penalty

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

    # Assess quality before full inference
    quality_score, quality_status, quality_reasons, img_penalty = assess_image_quality(image)

    results = detector.predict(image, verbose=False)[0]

    counts = {"WBC": 0, "RBC": 0, "Platelets": 0}
    wbc_subtype_counts = {name: 0 for name in WBC_SUBTYPES}
    detections = []

    for box in results.boxes:
        cls_id = int(box.cls[0])
        cls_name = DETECTOR_CLASSES[cls_id]
        det_conf = float(box.conf[0])
        x1, y1, x2, y2 = [float(v) for v in box.xyxy[0]]

        counts[cls_name] = counts.get(cls_name, 0) + 1

        detection = {
            "class": cls_name,
            "detectionConfidence": round(det_conf, 3),
            "box": {"x1": x1, "y1": y1, "x2": x2, "y2": y2},
        }

        # PRD Review Priority Logic Setup
        cls_conf = 1.0
        class_ambiguity = 0.0

        if cls_name == "WBC":
            subtype, cls_conf = classify_wbc_crop(image, (x1, y1, x2, y2))
            detection["subtype"] = subtype
            detection["subtypeConfidence"] = round(cls_conf, 3)
            wbc_subtype_counts[subtype] += 1
            
            # Identify abnormal/uncertain classes (PRD section 9.3)
            if subtype in ['myeloblast', 'erythroblast', 'basophil']:
                class_ambiguity = 1.0
            
            # Compute review priority according to PRD formula
            # review_priority = 0.40*(1-class_conf) + 0.25*(1-det_conf) + 0.20*quality_penalty + 0.15*ambiguity
            rp = 0.40 * (1.0 - cls_conf) + 0.25 * (1.0 - det_conf) + 0.20 * img_penalty + 0.15 * class_ambiguity
            detection["reviewPriority"] = round(rp, 3)
        else:
            # RBC or Platelets: Only detection confidence and image penalty apply
            rp = 0.25 * (1.0 - det_conf) + 0.20 * img_penalty
            detection["reviewPriority"] = round(rp, 3)

        detections.append(detection)

    total_cells = sum(counts.values())

    return {
        "qualityScore": round(quality_score, 2),
        "qualityStatus": quality_status,
        "qualityReasons": quality_reasons,
        "totalCells": total_cells,
        "rbcCount": counts["RBC"],
        "wbcCount": counts["WBC"],
        "plateletCount": counts["Platelets"],
        "wbcSubtypes": wbc_subtype_counts,
        "detections": detections,
    }