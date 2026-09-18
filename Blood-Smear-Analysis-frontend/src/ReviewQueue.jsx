import React, { useState, useRef, useEffect } from 'react';

const CustomSelect = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div className="relative" ref={containerRef}>
      <div
        className="h-7 bg-transparent pl-1 pr-6 text-xs font-medium text-slate-700 cursor-pointer flex items-center min-w-[90px]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{options.find(o => o.value === value)?.label || value}</span>
        <svg className={`w-3.5 h-3.5 text-slate-500 absolute right-1 top-1/2 -translate-y-1/2 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 min-w-[130px] bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 overflow-hidden">
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

const queueData = [
  { id: 'CS-1024', patient: 'Rahul Deshmukh', patientId: 'P-1021', test: 'CBC + Blood Smear', finding: 'Abnormal cell pattern', confidence: 94.6, priority: 'High', waiting: '2h 14m', status: 'Review Required' },
  { id: 'CS-1021', patient: 'Sneha Kulkarni', patientId: 'P-1024', test: 'CBC + Blood Smear', finding: 'Possible cell anomaly', confidence: 88.1, priority: 'High', waiting: '1h 42m', status: 'Review Required' },
  { id: 'CS-1019', patient: 'Priya Nair', patientId: 'P-1026', test: 'Blood Smear', finding: 'Low-confidence classification', confidence: 81.3, priority: 'Medium', waiting: '48m', status: 'In Review' },
  { id: 'CS-1018', patient: 'Neha Kulkarni', patientId: 'P-1027', test: 'Blood Smear', finding: 'Possible morphological anomaly', confidence: 79.8, priority: 'Medium', waiting: '35m', status: 'Review Required' },
  { id: 'CS-1017', patient: 'Amit Sharma', patientId: 'P-1028', test: 'Blood Smear', finding: 'Borderline WBC count', confidence: 76.2, priority: 'Low', waiting: '22m', status: 'Review Required' },
  { id: 'CS-1015', patient: 'Deepika Rao', patientId: 'P-1030', test: 'CBC + Blood Smear', finding: 'Suspected blast cells', confidence: 91.0, priority: 'High', waiting: '3h 5m', status: 'In Review' },
];

export default function ReviewQueue() {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [testFilter, setTestFilter] = useState('All');

  const filtered = queueData.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchQ = !q || c.id.toLowerCase().includes(q) || c.patient.toLowerCase().includes(q) || c.patientId.toLowerCase().includes(q);
    const matchP = priorityFilter === 'All' || c.priority === priorityFilter;
    const matchS = statusFilter === 'All' || c.status === statusFilter;
    const matchT = testFilter === 'All' || c.test === testFilter;
    return matchQ && matchP && matchS && matchT;
  });

  const highPriority = queueData.filter(c => c.priority === 'High').length;
  const inReview = queueData.filter(c => c.status === 'In Review').length;

  const clearFilters = () => {
    setSearchQuery('');
    setPriorityFilter('All');
    setStatusFilter('All');
    setTestFilter('All');
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold text-slate-900 tracking-tight leading-tight">Review Queue</h1>
          <p className="text-xs text-slate-500 mt-1">Cases requiring expert review or pathologist sign-off.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Review</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{queueData.length}</div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">All registered review cases</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 shadow-sm border border-teal-100">
            <span className="material-symbols-outlined text-[20px]">pending_actions</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">High Priority</div>
            <div className="text-2xl font-bold text-rose-600 mt-1 tracking-tight">{highPriority}</div>
            <div className="text-[11px] text-rose-600/80 mt-1 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse inline-block"></span>STAT — Immediate sign-off required
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 shadow-sm border border-rose-100">
            <span className="material-symbols-outlined text-[20px]">priority_high</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">In Review</div>
            <div className="text-2xl font-bold text-sky-600 mt-1 tracking-tight">{inReview}</div>
            <div className="text-[11px] text-sky-600/80 mt-1 font-medium">Currently being reviewed by pathologist</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 shadow-sm border border-sky-100">
            <span className="material-symbols-outlined text-[20px]">rate_review</span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" x2="16.65" y1="21" y2="16.65"></line></svg>
            <input
              className="w-full h-9 pl-9 pr-4 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition"
              placeholder="Search by Case ID, Patient Name, or Patient ID..."
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <span className="font-semibold text-slate-500 whitespace-nowrap">PRIORITY:</span>
              <CustomSelect
                value={priorityFilter}
                onChange={setPriorityFilter}
                options={[
                  { value: 'All', label: 'All Priorities' },
                  { value: 'High', label: 'High' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Low', label: 'Low' },
                ]}
              />
            </div>
            <div className="flex items-center gap-1.5 h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <span className="font-semibold text-slate-500 whitespace-nowrap">STATUS:</span>
              <CustomSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'All', label: 'All Statuses' },
                  { value: 'Review Required', label: 'Review Required' },
                  { value: 'In Review', label: 'In Review' },
                ]}
              />
            </div>
            <div className="flex items-center gap-1.5 h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <span className="font-semibold text-slate-500 whitespace-nowrap">TEST:</span>
              <CustomSelect
                value={testFilter}
                onChange={setTestFilter}
                options={[
                  { value: 'All', label: 'All Tests' },
                  { value: 'Blood Smear', label: 'Blood Smear' },
                  { value: 'CBC + Blood Smear', label: 'CBC + Blood Smear' },
                ]}
              />
            </div>
            <button
              className="h-9 px-3 flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
              onClick={clearFilters}
              type="button"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Case ID</th>
                <th className="py-3.5 px-4">Patient</th>
                <th className="py-3.5 px-4">Patient ID</th>
                <th className="py-3.5 px-4">Test Type</th>
                <th className="py-3.5 px-4">AI Finding</th>
                <th className="py-3.5 px-4">Confidence</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Waiting</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-teal-50/30 transition-colors group">
                  <td className="py-3.5 px-4 font-mono font-semibold text-teal-700 whitespace-nowrap">{c.id}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">{c.patient}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-block bg-slate-100 text-slate-700 font-semibold font-mono text-[11px] px-2 py-0.5 rounded">{c.patientId}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{c.test}</td>
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{c.finding}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 w-28">
                      <span className="font-mono text-xs text-slate-800 font-medium w-10">{c.confidence}%</span>
                      <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${c.confidence >= 90 ? 'bg-teal-600' : c.confidence >= 80 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${c.confidence}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {c.priority === 'High' && <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-rose-50 text-rose-700 border border-rose-200/60">High</span>}
                    {c.priority === 'Medium' && <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-50 text-amber-700 border border-amber-200/60">Medium</span>}
                    {c.priority === 'Low' && <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 text-slate-600 border border-slate-200/60">Low</span>}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">{c.waiting}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {c.status === 'In Review' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/60">
                        <span className="material-symbols-outlined text-[12px]">rate_review</span>In Review
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                        <span className="material-symbols-outlined text-[12px]">schedule</span>Review Required
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0d9488] hover:bg-teal-700 rounded-lg transition shadow-sm"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[14px]">rate_review</span>
                      Review
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="10" className="py-16 px-6 text-center text-slate-500">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3 mx-auto">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path><rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect><path d="m9 14 2 2 4-4"></path></svg>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800">No cases found</h4>
                    <p className="text-xs text-slate-500 mt-1">No cases match your current filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50/70 border-t border-slate-100 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-mono font-semibold text-slate-800">{filtered.length}</span> of <span className="font-mono font-semibold text-slate-800">{queueData.length}</span> pending cases
          </div>
          <div className="flex items-center gap-2">
            <button className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-400 cursor-not-allowed text-xs font-medium" disabled>Previous</button>
            <span className="px-2 font-mono text-xs text-slate-700">Page 1 of 3</span>
            <button className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
