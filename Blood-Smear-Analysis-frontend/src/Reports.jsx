import React, { useState, useRef, useEffect } from 'react';

// ─── Custom themed select (matching Patients/Cases style) ──────────────────────
const CustomSelect = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div className="relative" ref={containerRef}>
      <div
        className="h-7 bg-transparent pl-1 pr-6 text-xs font-medium text-slate-700 cursor-pointer flex items-center min-w-[100px]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{options.find(o => o.value === value)?.label || value}</span>
        <svg className={`w-3.5 h-3.5 text-slate-500 absolute right-1 top-1/2 -translate-y-1/2 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 min-w-[150px] bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 overflow-hidden">
          {options.map(opt => (
            <div
              key={opt.value}
              className={`px-3 py-1.5 text-xs cursor-pointer transition-colors ${value === opt.value ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
            >{opt.label}</div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Report Preview Modal (Clinical Template) ─────────────────────────────────
const ReportModal = ({ report, onClose }) => {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!report) return null;

  // Per-report data derived from the report object
  const sampleId  = `S-${report.caseId.replace('CS-', '')}`;
  const reportNum = report.id;
  const caseId    = report.caseId;

  // Static clinical data (in a real system this would come from an API)
  const patientMeta = {
    age: '32 Years / Male',
    referredBy: 'Dr. S. Kulkarni',
    sampleType: 'Peripheral Blood Smear',
    collectionDate: `${report.date}, 10:22 AM`,
    reportDate: `${report.date}, 04:55 PM`,
  };

  const analysisSummary = [
    { label: 'No. of Images Analysed', value: '3' },
    { label: 'Image Quality',           value: 'Good' },
    { label: 'AI Model Version',        value: 'YOLOv8 + EfficientNet v1.2' },
    { label: 'Analysis Time',           value: '2.8 seconds' },
  ];

  const cellCounts = [
    { param: 'Red Blood Cells (RBC)',   count: 148, pct: '78.7', ref: '—' },
    { param: 'White Blood Cells (WBC)', count: 12,  pct: '6.4',  ref: '—' },
    { param: 'Platelets',               count: 28,  pct: '14.9', ref: '—' },
  ];

  const wbcDiff = [
    { type: 'Neutrophils',  count: 5, pct: '41.7' },
    { type: 'Lymphocytes',  count: 3, pct: '25.0' },
    { type: 'Monocytes',    count: 2, pct: '16.7' },
    { type: 'Eosinophils',  count: 1, pct: '8.3'  },
    { type: 'Basophils',    count: 1, pct: '8.3'  },
  ];

  const reviewSummary = [
    { label: 'Cells Accepted',          value: 174 },
    { label: 'Cells Modified',          value: 10  },
    { label: 'Cells Marked Unknown',    value: 4   },
    { label: 'Cells Flagged for Review',value: 2   },
  ];

  const remarks = [
    'Overall smear quality is good.',
    'Normal RBC morphology observed.',
    'WBC count appears within expected range.',
    'Platelet count is adequate.',
    'No significant abnormal morphology detected.',
    'Please correlate with clinical findings and other laboratory parameters.',
  ];

  const thCls  = 'border border-slate-300 px-3 py-2 text-left text-[11px] font-bold text-slate-700 bg-slate-100 uppercase tracking-wide';
  const tdCls  = 'border border-slate-300 px-3 py-2 text-xs text-slate-700';
  const secHdr = 'bg-slate-100 border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide';

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:backdrop-blur-none"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col overflow-hidden border border-slate-300 rounded-lg print:shadow-none print:max-h-none print:border-none print:rounded-none print:w-full print:max-w-full">

        {/* ── Modal chrome: Print + Close ────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200 shrink-0 print:hidden">
          <span className="text-xs font-semibold text-slate-600">Report Preview — {reportNum}</span>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0d9488] hover:bg-teal-700 rounded-lg transition shadow-sm"
              onClick={() => window.print()}
              type="button"
            >
              <span className="material-symbols-outlined text-[14px]">print</span>Print / Export PDF
            </button>
            <button
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              onClick={onClose}
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </div>

        {/* ── Printable clinical document ─────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 bg-white print:overflow-visible print:h-full" style={{ fontFamily: "'Calibri', 'Arial', sans-serif" }}>
          <div className="px-8 py-6 space-y-0 mx-auto print:px-0 print:py-0" style={{ fontSize: '12px', color: '#1e293b', width: '100%', maxWidth: '210mm' }}>

            {/* ── LAB LETTERHEAD ─────────────────────────────────────────── */}
            <div className="flex items-start justify-between pb-4 border-b-2 border-slate-800 mb-0">
              <div className="flex items-start gap-4">
                {/* Microscope icon */}
                <div className="w-14 h-14 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[48px] text-slate-700">biotech</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 leading-tight" style={{ fontFamily: 'Arial, sans-serif' }}>
                    CellInsight Diagnostic Laboratory
                  </h1>
                  <p className="text-[11px] text-slate-500 italic">Accurate Diagnosis. Better Care.</p>
                  <p className="text-[11px] text-slate-600 mt-1">123 Shivajinagar, Pune, Maharashtra - 411005</p>
                  <p className="text-[11px] text-slate-600">+91 98765 43210 &nbsp;|&nbsp; lab@cellinsightlab.com &nbsp;|&nbsp; www.cellinsightlab.com</p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-4">
                <table className="text-[11px] text-slate-700">
                  <tbody>
                    {[
                      ['Sample ID',      sampleId],
                      ['Case ID',        caseId],
                      ['Report Date',    patientMeta.reportDate],
                      ['Report Version', report.version || 'v1'],
                    ].map(([k, v]) => (
                      <tr key={k}>
                        <td className="pr-2 font-medium text-slate-500 whitespace-nowrap">{k}</td>
                        <td className="pr-1 text-slate-500">:</td>
                        <td className="font-semibold text-slate-800 whitespace-nowrap">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-3 text-right">
                  <div className="inline-block bg-slate-800 text-white px-2.5 py-1 rounded text-[10px] font-bold leading-tight text-right">
                    <div>Powered by <span className="text-teal-300">CellInsight</span></div>
                    <div className="font-normal opacity-80">AI-Assisted Analysis Platform</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── REPORT TITLE ────────────────────────────────────────────── */}
            <div className="py-3 border-b border-slate-300">
              <h2 className="text-base font-bold text-slate-900 tracking-wide uppercase" style={{ fontFamily: 'Arial, sans-serif', letterSpacing: '0.03em' }}>
                Peripheral Blood Smear Analysis Report
              </h2>
            </div>

            {/* ── PATIENT INFORMATION ─────────────────────────────────────── */}
            <div className="mt-3">
              <div className={secHdr}>Patient Information</div>
              <div className="border border-slate-300 border-t-0 px-3 py-3 grid grid-cols-2 gap-x-8 gap-y-1.5">
                <div>
                  {[
                    ['Patient ID',   report.patientId],
                    ['Patient Name', report.patient],
                    ['Age / Sex',    patientMeta.age],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-2 text-[11px] py-0.5">
                      <span className="w-24 text-slate-500 shrink-0">{k}</span>
                      <span className="text-slate-400 shrink-0">:</span>
                      <span className="font-medium text-slate-800">{v}</span>
                    </div>
                  ))}
                </div>
                <div>
                  {[
                    ['Referred By',      patientMeta.referredBy],
                    ['Sample Type',      patientMeta.sampleType],
                    ['Collection Date',  patientMeta.collectionDate],
                    ['Report Date',      patientMeta.reportDate],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-2 text-[11px] py-0.5">
                      <span className="w-28 text-slate-500 shrink-0">{k}</span>
                      <span className="text-slate-400 shrink-0">:</span>
                      <span className="font-medium text-slate-800">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── ANALYSIS SUMMARY ────────────────────────────────────────── */}
            <div className="mt-4">
              <div className={secHdr}>Analysis Summary</div>
              <div className="border border-slate-300 border-t-0 px-3 py-2.5 space-y-1">
                {analysisSummary.map(({ label, value }) => (
                  <div key={label} className="flex gap-2 text-[11px]">
                    <span className="w-44 text-slate-500 shrink-0">{label}</span>
                    <span className="text-slate-400 shrink-0">:</span>
                    <span className="font-medium text-slate-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── CELL COUNT SUMMARY TABLE ─────────────────────────────────── */}
            <div className="mt-4">
              <div className={secHdr}>Cell Count Summary (AI + Verified)</div>
              <table className="w-full border-collapse border border-slate-300 border-t-0">
                <thead>
                  <tr>
                    <th className={thCls}>Parameter</th>
                    <th className={`${thCls} text-center`}>Count (per field)</th>
                    <th className={`${thCls} text-center`}>Percentage (%)</th>
                    <th className={`${thCls} text-center`}>Reference Range*</th>
                  </tr>
                </thead>
                <tbody>
                  {cellCounts.map((row, i) => (
                    <tr key={row.param} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                      <td className={tdCls}>{row.param}</td>
                      <td className={`${tdCls} text-center`}>{row.count}</td>
                      <td className={`${tdCls} text-center`}>{row.pct}</td>
                      <td className={`${tdCls} text-center`}>{row.ref}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── WBC DIFFERENTIAL COUNT TABLE ────────────────────────────── */}
            <div className="mt-4">
              <div className={secHdr}>WBC Differential Count</div>
              <table className="w-full border-collapse border border-slate-300 border-t-0">
                <thead>
                  <tr>
                    <th className={thCls}>Cell Type</th>
                    <th className={`${thCls} text-center`}>Count</th>
                    <th className={`${thCls} text-center`}>Percentage (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {wbcDiff.map((row, i) => (
                    <tr key={row.type} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                      <td className={tdCls}>{row.type}</td>
                      <td className={`${tdCls} text-center`}>{row.count}</td>
                      <td className={`${tdCls} text-center`}>{row.pct}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── REVIEW SUMMARY ───────────────────────────────────────────── */}
            <div className="mt-4">
              <div className={secHdr}>Review Summary</div>
              <div className="border border-slate-300 border-t-0 px-3 py-2.5 space-y-1">
                {reviewSummary.map(({ label, value }) => (
                  <div key={label} className="flex gap-2 text-[11px]">
                    <span className="w-44 text-slate-500 shrink-0">{label}</span>
                    <span className="text-slate-400 shrink-0">:</span>
                    <span className="font-semibold text-slate-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── REMARKS ─────────────────────────────────────────────────── */}
            <div className="mt-4">
              <div className={secHdr}>Remarks</div>
              <div className="border border-slate-300 border-t-0 px-4 py-3">
                <ul className="list-disc list-outside ml-4 space-y-1">
                  {remarks.map((r, i) => (
                    <li key={i} className="text-[11px] text-slate-700">{r}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── SIGN-OFF + DISCLAIMER ────────────────────────────────────── */}
            <div className="mt-6 grid grid-cols-2 gap-8 items-start border-t border-slate-200 pt-5">
              {/* Signature */}
              <div>
                <p className="text-[11px] font-bold text-slate-700 mb-3">Reviewed &amp; Approved By</p>
                <div className="mb-2 border-b border-slate-300 pb-1 w-44">
                  <span
                    style={{ fontFamily: "'Caveat', cursive", fontSize: '1.6rem', color: '#1e3a5f', display: 'block', lineHeight: 1.2 }}
                  >
                    Shriya Kulkarni
                  </span>
                </div>
                <p className="text-[11px] font-bold text-slate-800">Dr. Shriya Kulkarni</p>
                <p className="text-[11px] text-slate-600">Pathologist</p>
                <p className="text-[11px] text-slate-600">Reg. No. MH-PATH-45871</p>
              </div>
              {/* Disclaimer */}
              <div className="bg-slate-50 border border-slate-200 rounded p-3">
                <p className="text-[11px] font-bold text-slate-800 mb-1.5">Disclaimer</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  This report is generated by CellInsight, an AI-assisted blood smear analysis system. It is a research prototype intended for laboratory assistance only and is not a standalone diagnostic device. Final interpretation and clinical correlation must be performed by a qualified healthcare professional.
                </p>
              </div>
            </div>

            {/* ── DOCUMENT FOOTER ─────────────────────────────────────────── */}
            <div className="mt-8 pt-3 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-400">
              <span>CellInsight Diagnostic Laboratory</span>
              <span>Page 1 of 1</span>
              <span>Printed on {patientMeta.reportDate}</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

// ─── Reports data ──────────────────────────────────────────────────────────────
const reportsData = [
  { id: 'R-1024', caseId: 'CS-1024', patient: 'Rahul Deshmukh', patientId: 'P-1021', test: 'Blood Smear', status: 'Pending Approval', version: 'v1', date: '06 Sep 2026' },
  { id: 'R-1023', caseId: 'CS-1023', patient: 'Anita Shah',     patientId: 'P-1022', test: 'Blood Smear', status: 'Approved',         version: 'v1', date: '06 Sep 2026' },
  { id: 'R-1021', caseId: 'CS-1021', patient: 'Sneha Kulkarni', patientId: 'P-1024', test: 'CBC + Blood Smear', status: 'Generated',   version: 'v1', date: '05 Sep 2026' },
  { id: 'R-1019', caseId: 'CS-1019', patient: 'Priya Nair',     patientId: 'P-1026', test: 'Blood Smear', status: 'Approved',         version: 'v2', date: '04 Sep 2026' },
  { id: 'R-1018', caseId: 'CS-1018', patient: 'Vikram Malhotra',patientId: 'P-1028', test: 'CBC + Blood Smear', status: 'Approved',   version: 'v1', date: '02 Sep 2026' },
  { id: 'R-1015', caseId: 'CS-1015', patient: 'Deepika Rao',    patientId: 'P-1030', test: 'Blood Smear', status: 'Draft',            version: 'v1', date: '01 Sep 2026' },
];

// ─── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = {
    'Approved':         { cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60', dot: 'bg-emerald-500' },
    'Generated':        { cls: 'bg-sky-50 text-sky-700 border border-sky-200/60',             dot: 'bg-sky-500' },
    'Pending Approval': { cls: 'bg-amber-50 text-amber-700 border border-amber-200/60',       dot: 'bg-amber-500' },
    'Draft':            { cls: 'bg-slate-100 text-slate-600 border border-slate-200/60',      dot: 'bg-slate-400' },
  }[status] || { cls: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
      {status}
    </span>
  );
};

// ─── Main Reports component ────────────────────────────────────────────────────
export default function Reports() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [selectedReport, setSelectedReport] = useState(null);

  const filtered = reportsData.filter(r => {
    const q = searchQuery.toLowerCase();
    const matchQ = !q || r.id.toLowerCase().includes(q) || r.caseId.toLowerCase().includes(q) || r.patient.toLowerCase().includes(q) || r.patientId.toLowerCase().includes(q);
    const matchS = statusFilter === 'All' || r.status === statusFilter;
    return matchQ && matchS;
  });

  const pendingCount = reportsData.filter(r => r.status === 'Pending Approval' || r.status === 'Draft').length;

  const clearFilters = () => { setSearchQuery(''); setStatusFilter('All'); setDateFilter('All'); };

  return (
    <>
      <div className="flex flex-col w-full max-w-7xl mx-auto space-y-6 pb-10">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-semibold text-slate-900 tracking-tight leading-tight">Reports</h1>
            <p className="text-xs text-slate-500 mt-1">View and manage verified blood-smear clinical reports.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-teal-700">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              <span>Laboratory LIMS V4.8</span>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-start justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Reports</div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{reportsData.length}</div>
              <div className="text-[11px] text-slate-400 mt-1 font-medium">Archived & active clinical reports</div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 shadow-sm border border-teal-100">
              <span className="material-symbols-outlined text-[20px]">folder_copy</span>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Reports</div>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-sky-50 text-sky-700 border border-sky-200/60">Awaiting Sign-off</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{pendingCount}</div>
              <div className="text-[11px] text-slate-400 mt-1 font-medium">Cases requiring pathologist verification</div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 shadow-sm border border-sky-100">
              <span className="material-symbols-outlined text-[20px]">pending_actions</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative flex-1">
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
              <input
                className="w-full h-9 pl-9 pr-4 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition"
                placeholder="Search by Report ID, Case ID, Patient Name, or Patient ID..."
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <span className="font-semibold text-slate-500 whitespace-nowrap">STATUS:</span>
                <CustomSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: 'All',              label: 'All Statuses' },
                    { value: 'Approved',         label: 'Approved' },
                    { value: 'Generated',        label: 'Generated' },
                    { value: 'Pending Approval', label: 'Pending Approval' },
                    { value: 'Draft',            label: 'Draft' },
                  ]}
                />
              </div>
              <div className="flex items-center gap-1.5 h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <span className="font-semibold text-slate-500 whitespace-nowrap">DATE:</span>
                <CustomSelect
                  value={dateFilter}
                  onChange={setDateFilter}
                  options={[
                    { value: 'All',   label: 'All Dates' },
                    { value: 'today', label: 'Today' },
                    { value: 'week',  label: 'This Week' },
                    { value: 'month', label: 'This Month' },
                  ]}
                />
              </div>
              <button
                className="h-9 px-3 flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                onClick={clearFilters}
                type="button"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Report ID</th>
                  <th className="py-3.5 px-4">Case ID</th>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Patient ID</th>
                  <th className="py-3.5 px-4">Test Type</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Version</th>
                  <th className="py-3.5 px-4">Generated Date</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-teal-50/30 transition-colors cursor-pointer group"
                    onClick={() => setSelectedReport(r)}
                  >
                    <td className="py-3.5 px-4 font-mono font-semibold text-teal-700 whitespace-nowrap group-hover:underline">{r.id}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">{r.caseId}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">{r.patient}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-block bg-slate-100 text-slate-700 font-semibold font-mono text-[11px] px-2 py-0.5 rounded">{r.patientId}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{r.test}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap"><StatusBadge status={r.status} /></td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">{r.version}</td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{r.date}</td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      <button
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-lg transition"
                        onClick={() => setSelectedReport(r)}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[14px] text-slate-500">visibility</span>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="9" className="py-16 text-center text-slate-500">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3 mx-auto">
                        <span className="material-symbols-outlined text-[24px]">description</span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800">No reports found</h4>
                      <p className="text-xs text-slate-500 mt-1">No reports match your current search or filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="bg-slate-50/70 border-t border-slate-100 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <span className="font-mono font-semibold text-slate-800">{filtered.length}</span> of <span className="font-mono font-semibold text-slate-800">28</span> reports
            </div>
            <div className="flex items-center gap-2">
              <button className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-400 cursor-not-allowed text-xs font-medium" disabled>Previous</button>
              <span className="px-2.5 py-1 bg-teal-600 text-white font-mono rounded text-xs">Page 1 of 6</span>
              <button className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors">Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Preview Modal */}
      {selectedReport && <ReportModal report={selectedReport} onClose={() => setSelectedReport(null)} />}
    </>
  );
}
