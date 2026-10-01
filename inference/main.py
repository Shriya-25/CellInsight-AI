import io
import numpy as np
import cv2

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import tensorflow as tf


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(title="HemaVision Inference Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3001",
        "http://localhost:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# LOAD MODELS ONCE AT STARTUP
# ============================================================

detector = YOLO("best.pt")

DETECTOR_CLASSES = detector.names
# Expected:
# {0: "WBC", 1: "RBC", 2: "Platelets"}

classifier = tf.keras.models.load_model(
    "wbc_classifier_v3_finetuned.keras"
)

print("Loaded detector: best.pt")
print("Loaded classifier: wbc_classifier_v3_finetuned.keras")
print(classifier.summary())


# ============================================================
# WBC CLASSIFIER CONFIGURATION
# ============================================================

WBC_SUBTYPES = [
    "basophil",
    "erythroblast",
    "monocyte",
    "myeloblast",
    "seg_neutrophil",
]

CLASSIFIER_INPUT_SIZE = (224, 224)


# ============================================================
# WBC CLASSIFICATION
# ============================================================

def classify_wbc_crop(
    original_image: Image.Image,
    box
):
    """
    Crop one detected WBC, add surrounding context,
    resize it and classify using EfficientNet.
    """

    x1, y1, x2, y2 = box

    box_w = x2 - x1
    box_h = y2 - y1

    # Expand crop outward to include surrounding context
    padding_factor = 1.5

    pad_x = box_w * padding_factor
    pad_y = box_h * padding_factor

    padded_x1 = max(0, x1 - pad_x)
    padded_y1 = max(0, y1 - pad_y)

    padded_x2 = min(
        original_image.width,
        x2 + pad_x
    )

    padded_y2 = min(
        original_image.height,
        y2 + pad_y
    )

    context_crop = original_image.crop(
        (
            padded_x1,
            padded_y1,
            padded_x2,
            padded_y2,
        )
    )

    # Resize for EfficientNet
    resized = context_crop.resize(
        CLASSIFIER_INPUT_SIZE
    )

    # Convert to NumPy
    array = tf.keras.utils.img_to_array(
        resized
    )

    # EfficientNet preprocessing
    array = tf.keras.applications.efficientnet.preprocess_input(
        array
    )

    # Add batch dimension
    array = np.expand_dims(
        array,
        axis=0
    )

    # Classify
    predictions = classifier.predict(
        array,
        verbose=0
    )[0]

    predicted_idx = int(
        np.argmax(predictions)
    )

    confidence = float(
        predictions[predicted_idx]
    )

    return (
        WBC_SUBTYPES[predicted_idx],
        confidence,
    )


# ============================================================
# IMAGE QUALITY ASSESSMENT
# ============================================================

def assess_image_quality(image: Image.Image):
    """
    Assess microscopy image quality using:

    1. Laplacian variance for focus/sharpness
    2. Average brightness

    The thresholds are intentionally more tolerant
    than the previous implementation because blood-smear
    microscopy images can naturally have soft backgrounds.

    Returns:
        quality_score
        quality_status
        quality_reasons
        penalty
    """

    # --------------------------------------------------------
    # Convert PIL image -> OpenCV BGR
    # --------------------------------------------------------

    open_cv_image = cv2.cvtColor(
        np.array(image),
        cv2.COLOR_RGB2BGR
    )

    # Convert to grayscale
    gray = cv2.cvtColor(
        open_cv_image,
        cv2.COLOR_BGR2GRAY
    )

    # --------------------------------------------------------
    # 1. FOCUS / BLUR CHECK
    # --------------------------------------------------------

    laplacian_var = cv2.Laplacian(
        gray,
        cv2.CV_64F
    ).var()

    # More tolerant threshold for microscopy images
    is_blurry = laplacian_var < 40

    # --------------------------------------------------------
    # 2. BRIGHTNESS CHECK
    # --------------------------------------------------------

    avg_brightness = float(
        np.mean(gray)
    )

    # More tolerant brightness limits
    is_too_dark = avg_brightness < 35
    is_too_bright = avg_brightness > 220

    # --------------------------------------------------------
    # DEBUG OUTPUT
    # --------------------------------------------------------

    print(
        f"[QUALITY] Focus score: {laplacian_var:.2f}"
    )

    print(
        f"[QUALITY] Brightness: {avg_brightness:.2f}"
    )

    # --------------------------------------------------------
    # QUALITY REASONS
    # --------------------------------------------------------

    reasons = []

    penalty = 0.0

    # Blur
    if is_blurry:

        reasons.append(
            f"Image may be out of focus "
            f"(focus score: {laplacian_var:.1f})"
        )

        penalty += 0.4

    # Too dark
    if is_too_dark:

        reasons.append(
            f"Image is underexposed "
            f"(brightness: {avg_brightness:.1f})"
        )

        penalty += 0.3

    # Too bright
    if is_too_bright:

        reasons.append(
            f"Image is overexposed "
            f"(brightness: {avg_brightness:.1f})"
        )

        penalty += 0.3

    # --------------------------------------------------------
    # QUALITY SCORE
    # --------------------------------------------------------

    quality_score = max(
        0.0,
        1.0 - penalty
    )

    # --------------------------------------------------------
    # QUALITY STATUS
    # --------------------------------------------------------

    if penalty >= 0.4:

        status = "Poor"

    elif penalty > 0:

        status = "Fair"

    else:

        status = "Good"

    return (
        quality_score,
        status,
        reasons,
        penalty,
    )


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "ok"
    }


# ============================================================
# IMAGE PREDICTION
# ============================================================

@app.post("/predict")
async def predict(
    file: UploadFile = File(...)
):

    # --------------------------------------------------------
    # Validate file type
    # --------------------------------------------------------

    if not file.content_type:

        raise HTTPException(
            status_code=400,
            detail="File type could not be determined"
        )

    if not file.content_type.startswith("image/"):

        raise HTTPException(
            status_code=400,
            detail="File must be an image"
        )

    # --------------------------------------------------------
    # Read uploaded image
    # --------------------------------------------------------

    contents = await file.read()

    try:

        image = Image.open(
            io.BytesIO(contents)
        ).convert("RGB")

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Could not read image"
        )

    # --------------------------------------------------------
    # IMAGE QUALITY ASSESSMENT
    # --------------------------------------------------------

    quality_score, quality_status, quality_reasons, img_penalty = (
        assess_image_quality(image)
    )

    # --------------------------------------------------------
    # YOLO DETECTION
    # --------------------------------------------------------

    results = detector.predict(
        image,
        verbose=False
    )[0]

    # --------------------------------------------------------
    # INITIAL COUNTS
    # --------------------------------------------------------

    counts = {
        "WBC": 0,
        "RBC": 0,
        "Platelets": 0,
    }

    wbc_subtype_counts = {
        name: 0
        for name in WBC_SUBTYPES
    }

    detections = []

    # --------------------------------------------------------
    # PROCESS DETECTIONS
    # --------------------------------------------------------

    for box in results.boxes:

        # Class ID
        cls_id = int(
            box.cls[0]
        )

        # Class name
        cls_name = DETECTOR_CLASSES[
            cls_id
        ]

        # Detection confidence
        det_conf = float(
            box.conf[0]
        )

        # Bounding box
        x1, y1, x2, y2 = [
            float(v)
            for v in box.xyxy[0]
        ]

        # ----------------------------------------------------
        # Update count
        # ----------------------------------------------------

        counts[cls_name] = (
            counts.get(cls_name, 0) + 1
        )

        # ----------------------------------------------------
        # Detection object
        # ----------------------------------------------------

        detection = {

            "class": cls_name,

            "detectionConfidence": round(
                det_conf,
                3
            ),

            "box": {
                "x1": x1,
                "y1": y1,
                "x2": x2,
                "y2": y2,
            },
        }

        # ----------------------------------------------------
        # REVIEW PRIORITY SETUP
        # ----------------------------------------------------

        cls_conf = 1.0
        class_ambiguity = 0.0

        # ====================================================
        # WBC
        # ====================================================

        if cls_name == "WBC":

            subtype, cls_conf = classify_wbc_crop(
                image,
                (x1, y1, x2, y2)
            )

            # Store subtype
            detection["subtype"] = subtype

            # Store subtype confidence
            detection["subtypeConfidence"] = round(
                cls_conf,
                3
            )

            # Update subtype count
            wbc_subtype_counts[subtype] += 1

            # ------------------------------------------------
            # Abnormal / uncertain subtype
            # ------------------------------------------------

            if subtype in [
                "myeloblast",
                "erythroblast",
                "basophil",
            ]:

                class_ambiguity = 1.0

            # ------------------------------------------------
            # Review priority
            #
            # rp =
            # 0.40 * (1 - class confidence)
            # + 0.25 * (1 - detection confidence)
            # + 0.20 * quality penalty
            # + 0.15 * ambiguity
            # ------------------------------------------------

            rp = (
                0.40 * (1.0 - cls_conf)
                + 0.25 * (1.0 - det_conf)
                + 0.20 * img_penalty
                + 0.15 * class_ambiguity
            )

            detection["reviewPriority"] = round(
                rp,
                3
            )

        # ====================================================
        # RBC / PLATELETS
        # ====================================================

        else:

            # ------------------------------------------------
            # Review priority
            #
            # rp =
            # 0.25 * (1 - detection confidence)
            # + 0.20 * quality penalty
            # ------------------------------------------------

            rp = (
                0.25 * (1.0 - det_conf)
                + 0.20 * img_penalty
            )

            detection["reviewPriority"] = round(
                rp,
                3
            )

        # ----------------------------------------------------
        # Add detection
        # ----------------------------------------------------

        detections.append(
            detection
        )

    # --------------------------------------------------------
    # TOTAL CELL COUNT
    # --------------------------------------------------------

    total_cells = sum(
        counts.values()
    )

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {

        "qualityScore": round(
            quality_score,
            2
        ),

        "qualityStatus": quality_status,

        "qualityReasons": quality_reasons,

        "totalCells": total_cells,

        "rbcCount": counts["RBC"],

        "wbcCount": counts["WBC"],

        "plateletCount": counts["Platelets"],

        "wbcSubtypes": wbc_subtype_counts,

        "detections": detections,
    }