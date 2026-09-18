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

// ─── Report Preview Modal ──────────────────────────────────────────────────────
const ReportModal = ({ report, onClose }) => {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!report) return null;

  const isPending = report.status === 'Pending Approval';

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
              <span className="material-symbols-outlined text-[20px]">lab_profile</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Clinical Laboratory Report — {report.id}</h2>
              <p className="text-[11px] text-slate-500 font-medium">Specimen Accession: S-{report.caseId.replace('CS-', '')}-EDTA</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0d9488] hover:bg-teal-700 rounded-lg transition shadow-sm"
              onClick={() => window.print()}
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">print</span>
              Print / Export PDF
            </button>
            <button
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              onClick={onClose}
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5 bg-white">
          {/* Status Banner */}
          <div className={`p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${isPending ? 'bg-sky-50 text-sky-700 border border-sky-200/60' : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'}`}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">{isPending ? 'pending_actions' : 'verified'}</span>
              <span className="text-xs font-semibold">{isPending ? 'Pending Pathologist Verification • Version 1.0 (Draft Sign-off)' : `Approved • ${report.version} — Verified & Signed`}</span>
            </div>
            <span className="font-mono text-[11px] text-slate-500">Generated: {report.date}, 14:30 IST</span>
          </div>

          {/* Patient & Case Info */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/70">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Patient Details</div>
                <p className="text-base font-bold text-slate-900">{report.patient}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
                  <span>ID: <strong className="text-slate-700 font-mono">{report.patientId}</strong></span>
                  <span>•</span><span>32 yrs / Male</span>
                  <span>•</span><span>Blood Group: <strong className="text-slate-700">B+</strong></span>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Case & Specimen Specs</div>
                <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-500">
                  <div>Case ID: <span className="text-slate-800 font-mono font-semibold">{report.caseId}</span></div>
                  <div>Sample ID: <span className="text-slate-800 font-mono">S-{report.caseId.replace('CS-', '')}</span></div>
                  <div>Specimen: <span className="text-slate-800">Whole Blood K2-EDTA</span></div>
                  <div>Stain: <span className="text-slate-800">Wright-Giemsa</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Acquisition Metrics */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200/80 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                <span className="material-symbols-outlined text-[22px]">biotech</span>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Acquisition Metrics</div>
                <p className="text-sm font-semibold text-slate-900">5 High-Power Fields (HPF) Analyzed</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Image Quality:</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>Optimal / Good Quality (Diagnostic Grade)
              </span>
            </div>
          </div>

          {/* Cytology & WBC Differential */}
          <div className="space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verified Quantitative Cytology & WBC Differential</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[['Total Nucleated Scanned','482'],['RBC Morphology Count','389'],['WBC Total Analyzed','78'],['Platelet Aggregates','15']].map(([k,v]) => (
                <div key={k} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                  <div className="text-[11px] text-slate-500 font-medium leading-tight">{k}</div>
                  <div className="text-xl font-bold text-slate-900 font-mono mt-1">{v}</div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-3">
              {[
                { label: 'Segmented Neutrophils', pct: 42, ref: '40–70%', alert: null, color: 'bg-teal-600' },
                { label: 'Lymphocytes', pct: 18, ref: '20–40%', alert: null, color: 'bg-teal-600' },
                { label: 'Monocytes', pct: 8, ref: '2–8%', alert: null, color: 'bg-teal-600' },
                { label: 'Eosinophils', pct: 6, ref: '1–4%', alert: 'High', color: 'bg-sky-500' },
                { label: 'Basophils', pct: 2, ref: '0.5–1%', alert: null, color: 'bg-teal-600' },
                { label: 'Myeloblasts / Atypical', pct: 2, ref: '0%', alert: 'Alert', color: 'bg-rose-500', error: true },
              ].map(row => (
                <div key={row.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={`font-medium flex items-center gap-1.5 ${row.error ? 'text-rose-600' : 'text-slate-800'}`}>
                      {row.label}
                      {row.alert && <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${row.error ? 'bg-rose-50 text-rose-600 border border-rose-200/60' : 'bg-sky-50 text-sky-600 border border-sky-200/60'}`}>[{row.alert}]</span>}
                    </span>
                    <span className={`font-mono ${row.error ? 'text-rose-600 font-semibold' : 'text-slate-700'}`}>{row.pct}% (Ref: {row.ref})</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full ${row.color} rounded-full`} style={{ width: `${row.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnostic Findings */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verified Diagnostic Findings & Review Summary</div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-700 leading-relaxed">
              <strong>Morphological Evaluation:</strong> Mild anisocytosis and polychromasia observed in peripheral blood film. Presence of 2 atypical mononuclear blast-like cells in Field 3 flagged for definitive pathologist microscopic confirmation.
            </div>
          </div>

          {/* Reviewer Sign-off */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-white border border-slate-200/80 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">EV</div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reviewing Pathologist</div>
                <p className="text-sm font-semibold text-slate-900">Dr. Evelyn Vance, MD</p>
                <p className="text-[11px] text-slate-500">Chief Pathologist / Lab Director</p>
              </div>
            </div>
            {isPending ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-200/60">
                <span className="material-symbols-outlined text-[15px]">lock_clock</span>Awaiting final electronic PIN verification
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60">
                <span className="material-symbols-outlined text-[15px]">verified</span>Signed & Approved
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 text-[11px] text-slate-500 leading-relaxed">
            <strong>DISCLAIMER:</strong> CellInsight Lab is an assistive diagnostic decision-support system. AI classifications require manual validation and sign-off by a certified clinical hematopathologist prior to EMR transmission.
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="font-mono text-[11px] text-slate-400">Doc Hash: SHA256:7f9a2b...90d</span>
          <button
            className="px-4 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg transition shadow-sm"
            onClick={onClose}
            type="button"
          >Close Preview</button>
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
