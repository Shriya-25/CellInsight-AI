import "dotenv/config";
import cors from "cors";
import express from "express";
import multer from "multer";

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});
const port = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", service: "blood-smear-api" });
});

const INFERENCE_URL = process.env.INFERENCE_URL || "http://localhost:8000";

app.post("/api/analysis", upload.single("image"), async (request, response) => {
  if (!request.file)
    return response.status(400).json({ error: "An image file is required." });

  try {
    const formData = new FormData();
    const blob = new Blob([request.file.buffer], {
      type: request.file.mimetype,
    });
    formData.append("file", blob, request.file.originalname);

    const inferenceResponse = await fetch(`${INFERENCE_URL}/predict`, {
      method: "POST",
      body: formData,
    });

    if (!inferenceResponse.ok) {
      const errorBody = await inferenceResponse.text();
      console.error("Inference service error:", errorBody);
      return response
        .status(502)
        .json({ error: "Inference service failed to process the image." });
    }

    const result = await inferenceResponse.json();

    // Simple placeholder decision-support logic. Replace with real thresholds later.
    const status = "Screening complete";
    const risk = result.wbcCount > 20 ? "Review suggested" : "Normal range";

    response.json({ ...result, status, risk });
  } catch (error) {
    console.error("Failed to reach inference service:", error);
    response.status(502).json({
      error:
        "Could not reach the inference service. Is it running on port 8000?",
    });
  }
});

app.use((error, _request, response, _next) => {
  if (error instanceof multer.MulterError)
    return response.status(400).json({ error: error.message });
  console.error(error);
  return response.status(500).json({ error: "Unexpected server error." });
});

app.listen(port, () =>
  console.log(`Blood smear API listening at http://localhost:${port}`),
);
