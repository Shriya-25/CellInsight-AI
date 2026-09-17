import React, { useState, useRef, useEffect } from 'react';

const CustomSelect = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div 
        className="h-7 bg-transparent py-0 pl-1 pr-6 text-xs font-medium text-slate-700 cursor-pointer flex items-center min-w-[80px]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{options.find(o => o.value === value)?.label || value}</span>
        <svg className={`w-3.5 h-3.5 text-slate-500 absolute right-1 top-1/2 -translate-y-1/2 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 min-w-[120px] bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 overflow-hidden">
          {options.map(opt => (
            <div 
              key={opt.value}
              className={`px-3 py-1.5 text-xs cursor-pointer transition-colors ${value === opt.value ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Cases() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [testFilter, setTestFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cases = [
    { id: 'CS-1024', patient: 'Rahul Deshmukh', patientId: 'P-1021', test: 'CBC + Blood Smear', date: '06 Sep 2026', finding: 'Abnormal cell pattern', confidence: 94.6, status: 'Review Required', priority: 'High', colorType: 'error' },
    { id: 'CS-1023', patient: 'Anita Shah', patientId: 'P-1022', test: 'Blood Smear', date: '06 Sep 2026', finding: 'No significant abnormality', confidence: 96.2, status: 'Verified', priority: 'Low', colorType: 'success' },
    { id: 'CS-1022', patient: 'Rohan Patil', patientId: 'P-1023', test: 'Blood Smear', date: '06 Sep 2026', finding: 'Cell classification in progress', confidence: null, status: 'AI Processing', priority: 'Medium', colorType: 'processing' },
    { id: 'CS-1021', patient: 'Sneha Kulkarni', patientId: 'P-1024', test: 'CBC + Blood Smear', date: '05 Sep 2026', finding: 'Possible cell anomaly', confidence: 88.1, status: 'Review Required', priority: 'High', colorType: 'warning' },
    { id: 'CS-1020', patient: 'Vikram Sen', patientId: 'P-1025', test: 'Blood Smear', date: '05 Sep 2026', finding: 'Mild anisocytosis', confidence: 92.4, status: 'Verified', priority: 'Low', colorType: 'neutral' }
  ];

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setTestFilter('All');
    setPriorityFilter('All');
  };

  const filteredCases = cases.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchQuery = !q || c.id.toLowerCase().includes(q) || c.patient.toLowerCase().includes(q) || c.patientId.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchTest = testFilter === 'All' || c.test === testFilter;
    const matchPriority = priorityFilter === 'All' || c.priority === priorityFilter;
    return matchQuery && matchStatus && matchTest && matchPriority;
  });

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto space-y-6 pb-10">
      {/* Top View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold text-slate-900 tracking-tight leading-tight">Cases</h1>
          <p className="text-xs text-slate-500 mt-1">Manage and track blood smear morphological analysis cases.</p>
        </div>
        <div>
          <button 
            className="bg-[#0d9488] hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2" 
            onClick={() => setIsModalOpen(true)} 
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>
            <span>+ New Case</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Cases</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">148</div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">All registered cases</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 shadow-sm border border-teal-100">
            <span className="material-symbols-outlined text-[20px]">folder_open</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Review Required</div>
            <div className="text-2xl font-bold text-amber-600 mt-1 tracking-tight">12</div>
            <div className="text-[11px] text-amber-600/80 mt-1 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>Cases awaiting expert review
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-sm border border-amber-100">
            <span className="material-symbols-outlined text-[20px]">schedule</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">AI Processing</div>
            <div className="text-2xl font-bold text-sky-600 mt-1 tracking-tight">4</div>
            <div className="text-[11px] text-sky-600/80 mt-1 font-medium">Cases currently being analyzed</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 shadow-sm border border-sky-100">
            <span className="material-symbols-outlined text-[20px] animate-spin">autorenew</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-xl border border-slate-200/70 p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
            <input 
              className="w-full h-9 pl-9 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition-all" 
              placeholder="Search by Case ID, Patient Name, or Patient ID..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" 
                type="button"
              >
                <svg className="w-3.5 h-3.5" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
              </button>
            )}
          </div>
          <div className="flex items-center justify-end shrink-0">
            <button 
              className="h-9 px-3 text-xs font-medium text-slate-600 hover:text-teal-700 hover:bg-slate-50 border border-slate-200/80 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm" 
              onClick={resetFilters} 
              type="button"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18"></path><path d="M7 12h10"></path><path d="M10 18h4"></path></svg>
              <span>Clear Filters</span>
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 bg-slate-50/80 border border-slate-200/80 rounded-lg px-2.5 py-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status:</span>
            <CustomSelect 
              value={statusFilter} 
              onChange={setStatusFilter} 
              options={[
                { value: 'All', label: 'All Statuses' },
                { value: 'AI Processing', label: 'AI Processing' },
                { value: 'Review Required', label: 'Review Required' },
                { value: 'Reviewed', label: 'Reviewed' },
                { value: 'Verified', label: 'Verified' }
              ]} 
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-50/80 border border-slate-200/80 rounded-lg px-2.5 py-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Test:</span>
            <CustomSelect 
              value={testFilter} 
              onChange={setTestFilter} 
              options={[
                { value: 'All', label: 'All Tests' },
                { value: 'Blood Smear', label: 'Blood Smear' },
                { value: 'CBC + Blood Smear', label: 'CBC + Blood Smear' }
              ]} 
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-50/80 border border-slate-200/80 rounded-lg px-2.5 py-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Priority:</span>
            <CustomSelect 
              value={priorityFilter} 
              onChange={setPriorityFilter} 
              options={[
                { value: 'All', label: 'All Priorities' },
                { value: 'High', label: 'High' },
                { value: 'Medium', label: 'Medium' },
                { value: 'Low', label: 'Low' }
              ]} 
            />
          </div>
        </div>
      </div>

      {/* Cases Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/70 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Case ID</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Patient</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Patient ID</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Test Type</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Date</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">AI Finding</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Confidence</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Status</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredCases.map(caseItem => (
                <tr key={caseItem.id} className="hover:bg-teal-50/30 transition-colors cursor-pointer group">
                  <td className="py-3.5 px-4 font-mono font-semibold text-teal-700 whitespace-nowrap">
                    {caseItem.id}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                    {caseItem.patient}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-block bg-slate-100 text-slate-700 font-semibold font-mono text-[11px] px-2 py-0.5 rounded">{caseItem.patientId}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{caseItem.test}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">{caseItem.date}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                    {caseItem.finding}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {caseItem.confidence ? (
                      <div className="flex items-center gap-2 w-24">
                        <span className="font-mono text-xs text-slate-800 font-medium w-10">{caseItem.confidence}%</span>
                        <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${caseItem.colorType === 'error' ? 'bg-teal-600' : caseItem.colorType === 'success' ? 'bg-emerald-500' : caseItem.colorType === 'warning' ? 'bg-amber-500' : 'bg-teal-600'}`} style={{ width: `${caseItem.confidence}%` }}></div>
                        </div>
                      </div>
                    ) : (
                      <span className="font-mono text-[11px] text-slate-400 tracking-widest">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {caseItem.status === 'Review Required' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60"><span className="material-symbols-outlined text-[12px]">schedule</span>Review Required</span>
                    )}
                    {caseItem.status === 'Verified' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60"><span className="material-symbols-outlined text-[12px]">check_circle</span>Verified</span>
                    )}
                    {caseItem.status === 'AI Processing' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-sky-700 border border-slate-200/60"><span className="material-symbols-outlined text-[12px] animate-spin">progress_activity</span>AI Processing</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {caseItem.priority === 'High' && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-rose-50 text-rose-700 border border-rose-200/60">High</span>
                    )}
                    {caseItem.priority === 'Medium' && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-50 text-amber-700 border border-amber-200/60">Medium</span>
                    )}
                    {caseItem.priority === 'Low' && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 text-slate-600 border border-slate-200/60">Low</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan="9" className="py-16 px-6 text-center text-slate-500">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3 mx-auto">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="17" x2="22" y1="8" y2="13"></line><line x1="22" x2="17" y1="8" y2="13"></line></svg>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800">No cases found matching your search</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">There are no records matching the specified criteria. Try resetting the query or removing filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table Pagination & Counter */}
        <div className="bg-slate-50/70 border-t border-slate-100 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-mono font-semibold text-slate-800">{filteredCases.length}</span> of <span className="font-mono font-semibold text-slate-800">148</span> cases
          </div>
          <div className="flex items-center gap-2">
            <button className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-400 cursor-not-allowed text-xs font-medium" disabled>Previous</button>
            <span className="px-2 font-mono text-xs text-slate-700">Page 1 of 30</span>
            <button className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* New Case Modal */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 z-50 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-200 ${isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsModalOpen(false);
        }}
      >
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden transform transition-all duration-200 ${isModalOpen ? 'scale-100' : 'scale-95'}`}>
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-900">Create New Case</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Initiate peripheral blood smear neural analysis</p>
            </div>
            <button 
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors" 
              onClick={() => setIsModalOpen(false)} 
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
            </button>
          </div>
          
          {/* Modal Body Form */}
          <form className="px-6 pb-6 pt-4 space-y-4 text-xs" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Patient Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Patient Selector <span className="text-rose-500">*</span></label>
                <select required className="w-full h-9 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600" defaultValue="Rahul Deshmukh (P-1021)">
                  <option value="Rahul Deshmukh (P-1021)">Rahul Deshmukh (P-1021)</option>
                  <option value="Anita Shah (P-1022)">Anita Shah (P-1022)</option>
                  <option value="Rohan Patil (P-1023)">Rohan Patil (P-1023)</option>
                  <option value="Sneha Kulkarni (P-1024)">Sneha Kulkarni (P-1024)</option>
                  <option value="Vikram Sen (P-1025)">Vikram Sen (P-1025)</option>
                  <option value="new">+ Add New Patient...</option>
                </select>
              </div>
              {/* Sample ID */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Sample ID (Barcode / Accession) <span className="text-rose-500">*</span></label>
                <input required className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600" type="text" defaultValue="S-1025" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Test Type Selection */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Test Specification</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 hover:text-slate-900">
                    <input defaultChecked className="accent-teal-600" name="modal_test_type" type="radio" />
                    <span>Blood Smear (Peripheral)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 hover:text-slate-900">
                    <input className="accent-teal-600" name="modal_test_type" type="radio" />
                    <span>CBC + Blood Smear</span>
                  </label>
                </div>
              </div>
              {/* Priority */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Clinical Priority</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 hover:text-slate-900">
                    <input className="accent-teal-600" name="modal_priority" type="radio" />
                    <span>High</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 hover:text-slate-900">
                    <input defaultChecked className="accent-teal-600" name="modal_priority" type="radio" />
                    <span>Medium</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 hover:text-slate-900">
                    <input className="accent-teal-600" name="modal_priority" type="radio" />
                    <span>Low</span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Clinical Notes */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Clinical Referral Notes <span className="text-slate-400 font-normal">(Optional)</span></label>
              <textarea className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 resize-none" placeholder="e.g., Suspected blast proliferation, follow-up after chemotherapy cycle, rule out thrombocytopenia artifacts..." rows="2"></textarea>
            </div>
            
            {/* Blood Smear Image Upload Area */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Blood Smear Slide Images (Whole-Slide Scan or FOVs)</label>
              <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 transition-colors">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-teal-600 mb-3 shadow-sm border border-slate-200">
                  <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
                </div>
                <p className="font-semibold text-slate-800">
                  Drag &amp; drop specimen slide images or <span className="text-teal-600 hover:underline">browse</span>
                </p>
                <p className="text-slate-500 mt-1">
                  Supports TIFF, SVS, NDPI, PNG, DICOM · Minimum 100x oil immersion fields recommended
                </p>
              </div>
            </div>
            
            {/* Modal Actions Footer */}
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button 
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors" 
                onClick={() => setIsModalOpen(false)} 
                type="button"
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 rounded-lg bg-[#0d9488] hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5" 
                type="submit"
              >
                <span className="material-symbols-outlined text-[16px]">biotech</span>
                <span>Submit &amp; Initiate AI Analysis</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
