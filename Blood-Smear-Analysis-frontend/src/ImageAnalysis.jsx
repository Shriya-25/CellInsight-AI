import React, { useState } from 'react';
import jsPDF from "jspdf";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const initialAnalysis = {
  totalCells: 0,
  rbcCount: 0,
  wbcCount: 0,
  plateletCount: 0,
  wbcSubtypes: {},
  blastPercentage: 0,
  reliabilityNote: null,
  status: "No sample analysed yet",
  risk: "—",
};

const SUBTYPE_LABELS = {
  basophil: "Basophil",
  erythroblast: "Erythroblast",
  monocyte: "Monocyte",
  myeloblast: "Myeloblast (AML indicator)",
  seg_neutrophil: "Segmented Neutrophil",
};

export default function ImageAnalysis({ token }) {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [error, setError] = useState("");

  async function analyseSample(event) {
    event.preventDefault();
    if (!file) {
      setError("Choose a blood smear image first.");
      return;
    }

    setError("");
    setIsAnalysing(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(`${API_URL}/api/analysis`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });
      
      if (response.status === 401 || response.status === 403) {
        window.dispatchEvent(new Event('cellinsight_auth_error'));
        throw new Error('Authentication expired. Please log in again.');
      }
      
      if (!response.ok) throw new Error("Analysis request failed");
      const result = await response.json();
      setAnalysis(result);
    } catch {
      setError(
        "The analysis service is unavailable. Confirm that the API server is running.",
      );
    } finally {
      setIsAnalysing(false);
    }
  }

  function downloadReport() {
    const doc = new jsPDF();
    const pageWidth = 210;
    const marginX = 15;
    const contentWidth = pageWidth - marginX * 2;
    let y = 0;

    // Determine risk color
    const riskColor = analysis.risk?.includes("High")
      ? [220, 38, 38] // red
      : analysis.risk?.includes("Elevated")
        ? [217, 119, 6] // amber
        : [22, 163, 74]; // green

    // ---- Header banner ----
    doc.setFillColor(15, 23, 42); // dark navy
    doc.rect(0, 0, pageWidth, 32, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont(undefined, "bold");
    doc.text("CellInsight", marginX, 16);
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.setTextColor(180, 200, 220);
    doc.text("AI-Assisted Blood Smear Analysis Report", marginX, 23);
    doc.text(new Date().toLocaleString(), pageWidth - marginX, 23, {
      align: "right",
    });
    y = 42;

    // ---- Status + risk badge ----
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text(analysis.status, marginX, y);

    const badgeText = `Risk: ${analysis.risk}`;
    doc.setFontSize(9);
    doc.setFont(undefined, "bold");
    const badgeWidth = doc.getTextWidth(badgeText) + 8;
    doc.setFillColor(...riskColor);
    doc.roundedRect(
      pageWidth - marginX - badgeWidth,
      y - 6,
      badgeWidth,
      8,
      2,
      2,
      "F",
    );
    doc.setTextColor(255, 255, 255);
    doc.text(badgeText, pageWidth - marginX - badgeWidth / 2, y - 0.5, {
      align: "center",
    });
    y += 12;

    // ---- Cell counts card ----
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(marginX, y, contentWidth, 26, 3, 3, "FD");
    const counts = [
      ["Total Cells", analysis.totalCells],
      ["RBCs", analysis.rbcCount],
      ["WBCs", analysis.wbcCount],
      ["Platelets", analysis.plateletCount],
    ];
    const colWidth = contentWidth / counts.length;
    counts.forEach(([label, value], i) => {
      const x = marginX + colWidth * i + colWidth / 2;
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.setFont(undefined, "normal");
      doc.text(label.toUpperCase(), x, y + 9, { align: "center" });
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(16);
      doc.setFont(undefined, "bold");
      doc.text(String(value), x, y + 19, { align: "center" });
    });
    y += 36;

    // ---- WBC subtype table ----
    const subtypeEntries = Object.entries(analysis.wbcSubtypes || {}).filter(
      ([, count]) => count > 0,
    );
    if (subtypeEntries.length > 0) {
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.setFont(undefined, "bold");
      doc.text("WBC Subtype Breakdown", marginX, y);
      y += 6;

      subtypeEntries.forEach(([subtype, count], i) => {
        const isFlagged = subtype === "myeloblast";
        const rowY = y + i * 9;
        doc.setFillColor(
          isFlagged ? 254 : 249,
          isFlagged ? 242 : 250,
          isFlagged ? 242 : 251,
        );
        doc.rect(marginX, rowY, contentWidth, 8, "F");
        doc.setFontSize(9.5);
        doc.setFont(undefined, isFlagged ? "bold" : "normal");
        doc.setTextColor(
          isFlagged ? 185 : 51,
          isFlagged ? 28 : 65,
          isFlagged ? 28 : 85,
        );
        doc.text(SUBTYPE_LABELS[subtype] || subtype, marginX + 4, rowY + 5.5);
        doc.text(String(count), pageWidth - marginX - 4, rowY + 5.5, {
          align: "right",
        });
      });
      y += subtypeEntries.length * 9 + 8;
    }

    // ---- Blast cell analysis ----
    if (analysis.blastPercentage !== undefined) {
      doc.setDrawColor(...riskColor);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(marginX, y, contentWidth, 22, 3, 3, "D");
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.setFont(undefined, "bold");
      doc.text("Blast Cell Analysis", marginX + 5, y + 8);
      doc.setFontSize(9.5);
      doc.setFont(undefined, "normal");
      doc.text(
        `Myeloblast percentage of WBCs: ${analysis.blastPercentage}%`,
        marginX + 5,
        y + 15,
      );
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(
        "WHO diagnostic criterion for AML: >=20% myeloblasts",
        marginX + 5,
        y + 20,
      );
      y += 30;
    }

    // ---- Reliability note ----
    if (analysis.reliabilityNote) {
      doc.setFillColor(255, 251, 235);
      const wrapped = doc.splitTextToSize(
        analysis.reliabilityNote,
        contentWidth - 10,
      );
      const boxHeight = wrapped.length * 5 + 8;
      doc.roundedRect(marginX, y, contentWidth, boxHeight, 3, 3, "F");
      doc.setTextColor(146, 64, 14);
      doc.setFontSize(8.5);
      doc.setFont(undefined, "bold");
      doc.text("RELIABILITY NOTE", marginX + 4, y + 6);
      doc.setFont(undefined, "normal");
      doc.text(wrapped, marginX + 4, y + 11);
      y += boxHeight + 8;
    }

    // ---- Footer ----
    doc.setDrawColor(226, 232, 240);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 6;
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.setFont(undefined, "normal");
    const disclaimer = doc.splitTextToSize(
      "Counts are image-level estimates generated by an automated research prototype for project demonstration only. This report does not constitute a medical diagnosis. Clinical decisions require qualified laboratory and physician review.",
      contentWidth,
    );
    doc.text(disclaimer, marginX, y);

    const filename = `CellInsight_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
  }

  const hasResult = analysis.totalCells > 0;

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto space-y-space-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-sm border-b border-surface-container-high">
        <h1 className="font-headline-lg text-display-lg tracking-tight text-on-surface font-bold">Image Analysis</h1>
      </div>
      
      <section className="workspace">
        <form className="upload-card" onSubmit={analyseSample}>
          <div>
            <p className="eyebrow">NEW ANALYSIS</p>
            <h2 className="font-headline-sm font-semibold">Upload a blood smear</h2>
            <p className="muted text-body-sm">PNG, JPG, or TIFF images.</p>
          </div>
          <label className="file-picker">
            <input
              type="file"
              accept="image/png,image/jpeg,image/tiff"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
            <span>{file ? file.name : "Choose image"}</span>
            <small>
              {file ? `${Math.round(file.size / 1024)} KB` : "No file selected"}
            </small>
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={isAnalysing} className="px-4 py-2 rounded-xl bg-primary text-on-primary font-medium hover:bg-primary-container transition-colors disabled:opacity-50">
            {isAnalysing ? "Analysing sample…" : "Run analysis"}
          </button>
        </form>

        <section className="results-card">
          <div className="results-heading">
            <div>
              <p className="eyebrow">LATEST RESULT</p>
              <h2 className="font-headline-sm font-semibold">{analysis.status}</h2>
            </div>
            <span className="risk">Risk: {analysis.risk}</span>
          </div>
          <div className="metrics">
            <Metric label="Detected cells" value={analysis.totalCells} />
            <Metric label="RBCs" value={analysis.rbcCount} />
            <Metric label="WBCs" value={analysis.wbcCount} />
            <Metric label="Platelets" value={analysis.plateletCount} />
          </div>

          {analysis.wbcCount > 0 && analysis.wbcSubtypes && (
            <div className="subtypes">
              <p className="eyebrow">WBC SUBTYPE BREAKDOWN</p>
              <div className="subtype-list">
                {Object.entries(analysis.wbcSubtypes)
                  .filter(([, count]) => count > 0)
                  .map(([subtype, count]) => (
                    <div
                      key={subtype}
                      className={`subtype-row ${subtype === "myeloblast" ? "flagged" : ""}`}
                    >
                      <span>{SUBTYPE_LABELS[subtype] || subtype}</span>
                      <strong>{count}</strong>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {analysis.reliabilityNote && (
            <p className="reliability-note">{analysis.reliabilityNote}</p>
          )}

          <p className="disclaimer">
            Counts are image-level estimates for project demonstration only.
            Clinical decisions require qualified laboratory review.
          </p>

          {hasResult && (
            <button
              type="button"
              className="download-report mt-4 px-4 py-2 bg-on-surface text-surface rounded-xl font-medium"
              onClick={downloadReport}
            >
              Download report (PDF)
            </button>
          )}
        </section>
      </section>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span className="text-secondary font-medium text-body-sm">{label}</span>
      <strong className="text-xl font-bold">{value.toLocaleString()}</strong>
    </div>
  );
}
