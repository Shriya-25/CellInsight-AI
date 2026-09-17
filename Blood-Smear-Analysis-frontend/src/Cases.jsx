import React, { useState } from 'react';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div>
          <h1 className="text-[28px] font-semibold text-on-surface tracking-tight leading-tight">Cases</h1>
          <p className="text-xs text-secondary mt-1">Manage and track blood smear morphological analysis cases.</p>
        </div>
        <div>
          <button 
            className="bg-[#0d9488] hover:bg-primary-container hover:text-white text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors" 
            onClick={() => setIsModalOpen(true)} 
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>+ New Case</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex items-start justify-between border border-slate-200/80">
          <div>
            <div className="text-[11px] font-semibold text-secondary uppercase tracking-wider">Total Cases</div>
            <div className="text-2xl font-bold text-on-surface mt-1 tracking-tight">148</div>
            <div className="text-[11px] text-outline mt-1 font-medium">All registered cases</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-surface-container text-primary flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
            <span className="material-symbols-outlined text-[20px] text-primary">folder_open</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex items-start justify-between border border-slate-200/80">
          <div>
            <div className="text-[11px] font-semibold text-secondary uppercase tracking-wider">Review Required</div>
            <div className="text-2xl font-bold text-[#b45309] mt-1 tracking-tight">12</div>
            <div className="text-[11px] text-[#b45309] mt-1 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] animate-pulse"></span>Cases awaiting expert review
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#fffbeb] text-[#b45309] flex items-center justify-center shrink-0 shadow-sm border border-[#fef3c7]">
            <span className="material-symbols-outlined text-[20px] text-[#b45309]">schedule</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex items-start justify-between border border-slate-200/80">
          <div>
            <div className="text-[11px] font-semibold text-secondary uppercase tracking-wider">AI Processing</div>
            <div className="text-2xl font-bold text-tertiary mt-1 tracking-tight">4</div>
            <div className="text-[11px] text-tertiary mt-1 font-medium">Cases currently being analyzed</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
            <span className="material-symbols-outlined text-[20px] text-tertiary animate-spin">autorenew</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm border border-slate-200/70">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input 
              className="w-full h-9 pl-9 pr-space-md bg-surface-container-low border border-slate-200/50 rounded-lg text-xs text-on-surface placeholder:text-outline focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary outline-none transition-all" 
              placeholder="Search by Case ID, Patient Name, or Patient ID..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-end shrink-0">
            <button 
              className="h-9 px-3 text-xs font-medium text-secondary hover:text-primary hover:bg-surface-container border border-slate-200/80 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm" 
              onClick={resetFilters} 
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>Reset</span>
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 pt-3 mt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 bg-surface-container-low border border-slate-200/50 rounded-lg px-2.5 py-1">
            <span className="text-[11px] font-semibold text-outline uppercase tracking-wider">Status:</span>
            <select 
              className="h-7 bg-transparent border-0 py-0 pl-1 pr-6 text-xs font-medium text-on-surface focus:outline-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="AI Processing">AI Processing</option>
              <option value="Review Required">Review Required</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Verified">Verified</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-low border border-slate-200/50 rounded-lg px-2.5 py-1">
            <span className="text-[11px] font-semibold text-outline uppercase tracking-wider">Test:</span>
            <select 
              className="h-7 bg-transparent border-0 py-0 pl-1 pr-6 text-xs font-medium text-on-surface focus:outline-none cursor-pointer"
              value={testFilter}
              onChange={(e) => setTestFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Blood Smear">Blood Smear</option>
              <option value="CBC + Blood Smear">CBC + Blood Smear</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-low border border-slate-200/50 rounded-lg px-2.5 py-1">
            <span className="text-[11px] font-semibold text-outline uppercase tracking-wider">Priority:</span>
            <select 
              className="h-7 bg-transparent border-0 py-0 pl-1 pr-6 text-xs font-medium text-on-surface focus:outline-none cursor-pointer"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cases Data Table */}
      <div className="bg-surface-container-lowest rounded-lg shadow-sm border border-slate-200/70 overflow-hidden flex flex-col">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-[11px] font-semibold uppercase tracking-wider text-secondary border-b border-slate-100">
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
            <tbody className="divide-y divide-surface-container-low font-body-sm text-body-sm text-on-surface">
              {filteredCases.map(caseItem => (
                <tr key={caseItem.id} className="hover:bg-surface-container-low/70 transition-colors cursor-pointer">
                  <td className="py-3.5 px-4 font-data-mono font-semibold text-primary whitespace-nowrap">
                    <span className="cursor-pointer text-primary hover:underline font-semibold">{caseItem.id}</span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold text-on-surface">{caseItem.patient}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-data-mono text-[11px] px-2 py-0.5 rounded bg-surface-container text-secondary font-semibold">{caseItem.patientId}</span>
                  </td>
                  <td className="py-3.5 px-4 text-secondary whitespace-nowrap">{caseItem.test}</td>
                  <td className="py-3.5 px-4 font-data-mono text-secondary whitespace-nowrap">{caseItem.date}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {caseItem.colorType === 'error' && (
                      <span className="font-medium text-[#be123c] flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#be123c]"></span>{caseItem.finding}</span>
                    )}
                    {caseItem.colorType === 'success' && (
                      <span className="text-secondary flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#047857]"></span>{caseItem.finding}</span>
                    )}
                    {caseItem.colorType === 'processing' && (
                      <span className="text-tertiary italic flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>{caseItem.finding}</span>
                    )}
                    {caseItem.colorType === 'warning' && (
                      <span className="font-medium text-[#b45309] flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#b45309]"></span>{caseItem.finding}</span>
                    )}
                    {caseItem.colorType === 'neutral' && (
                      <span className="text-on-surface flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>{caseItem.finding}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {caseItem.confidence ? (
                      <div className="flex items-center gap-2 w-24">
                        <span className="font-data-mono text-[11px] text-on-surface w-10">{caseItem.confidence}%</span>
                        <div className="w-14 h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <div className={`h-full ${caseItem.colorType === 'error' ? 'bg-primary' : caseItem.colorType === 'success' ? 'bg-[#047857]' : caseItem.colorType === 'warning' ? 'bg-[#d97706]' : 'bg-primary'}`} style={{ width: `${caseItem.confidence}%` }}></div>
                        </div>
                      </div>
                    ) : (
                      <span className="font-data-mono text-[11px] text-outline tracking-widest">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {caseItem.status === 'Review Required' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#fffbeb] text-[#b45309] border border-[#fef3c7]"><span className="material-symbols-outlined text-[12px]">schedule</span>Review Required</span>
                    )}
                    {caseItem.status === 'Verified' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#ecfdf5] text-[#047857] border border-[#d1fae5]"><span className="material-symbols-outlined text-[12px]">check_circle</span>Verified</span>
                    )}
                    {caseItem.status === 'AI Processing' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-surface-container text-tertiary border border-slate-200"><span className="material-symbols-outlined text-[12px] animate-spin">progress_activity</span>AI Processing</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {caseItem.priority === 'High' && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-[#fff1f2] text-[#be123c]">High</span>
                    )}
                    {caseItem.priority === 'Medium' && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-[#fffbeb] text-[#b45309]">Medium</span>
                    )}
                    {caseItem.priority === 'Low' && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-surface-container text-secondary">Low</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan="9" className="py-10 text-center text-secondary">
                    No cases found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table Pagination & Counter */}
        <div className="px-space-md py-space-sm bg-surface-container-low border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-space-sm">
          <div className="text-xs text-secondary">
            Showing <span className="font-data-mono font-semibold text-on-surface">{filteredCases.length}</span> of <span className="font-data-mono font-semibold text-on-surface">148</span> cases
          </div>
          <div className="flex items-center gap-2">
            <button className="px-2.5 py-1 bg-surface-container-lowest border border-slate-200 rounded text-outline cursor-not-allowed text-xs font-medium" disabled>Previous</button>
            <span className="px-2 font-data-mono text-xs text-on-surface">Page 1 of 30</span>
            <button className="px-2.5 py-1 bg-surface-container-lowest border border-slate-200 rounded text-on-surface hover:bg-surface-container text-xs font-medium transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* New Case Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-space-md bg-slate-900/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="bg-surface-container-lowest w-full max-w-2xl rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-gutter-lg py-space-md bg-surface-container-low border-b border-slate-200/50 flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="w-7 h-7 rounded bg-primary text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </div>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Create New Case</h2>
                  <p className="font-label-sm text-label-sm text-secondary">Initiate peripheral blood smear neural analysis</p>
                </div>
              </div>
              <button 
                className="p-1 rounded text-secondary hover:text-on-surface hover:bg-surface-container transition-colors" 
                onClick={() => setIsModalOpen(false)} 
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            {/* Modal Body Form */}
            <div className="p-gutter-lg overflow-y-auto space-y-space-md flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                {/* Patient Selector */}
                <div className="flex flex-col gap-space-xs">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">Patient Selector</label>
                  <div className="relative">
                    <select className="w-full h-9 px-space-md bg-surface-container-low border border-slate-200/80 text-on-surface font-body-sm text-body-sm rounded outline-none focus:bg-surface-container transition-colors">
                      <option>Rahul Deshmukh (P-1021)</option>
                      <option>Anita Shah (P-1022)</option>
                      <option>Rohan Patil (P-1023)</option>
                      <option>Sneha Kulkarni (P-1024)</option>
                      <option>Vikram Sen (P-1025)</option>
                      <option>+ Add New Patient...</option>
                    </select>
                  </div>
                </div>
                {/* Sample ID */}
                <div className="flex flex-col gap-space-xs">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">Sample ID (Barcode / Accession)</label>
                  <input className="w-full h-9 px-space-md bg-surface-container-low border border-slate-200/80 font-data-mono text-body-sm text-on-surface rounded outline-none focus:bg-surface-container transition-colors" type="text" defaultValue="S-1025" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                {/* Test Type Selection */}
                <div className="flex flex-col gap-space-xs">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">Test Specification</label>
                  <div className="flex gap-space-md mt-1">
                    <label className="flex items-center gap-space-xs font-body-sm text-body-sm cursor-pointer text-on-surface">
                      <input defaultChecked className="accent-[#00685f]" name="modal_test_type" type="radio" />
                      <span>Blood Smear (Peripheral)</span>
                    </label>
                    <label className="flex items-center gap-space-xs font-body-sm text-body-sm cursor-pointer text-on-surface">
                      <input className="accent-[#00685f]" name="modal_test_type" type="radio" />
                      <span>CBC + Blood Smear</span>
                    </label>
                  </div>
                </div>
                {/* Priority */}
                <div className="flex flex-col gap-space-xs">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">Clinical Priority</label>
                  <div className="flex gap-space-md mt-1">
                    <label className="flex items-center gap-space-xs font-body-sm text-body-sm cursor-pointer text-on-surface">
                      <input className="accent-[#00685f]" name="modal_priority" type="radio" />
                      <span>High</span>
                    </label>
                    <label className="flex items-center gap-space-xs font-body-sm text-body-sm cursor-pointer text-on-surface">
                      <input defaultChecked className="accent-[#00685f]" name="modal_priority" type="radio" />
                      <span>Medium</span>
                    </label>
                    <label className="flex items-center gap-space-xs font-body-sm text-body-sm cursor-pointer text-on-surface">
                      <input className="accent-[#00685f]" name="modal_priority" type="radio" />
                      <span>Low</span>
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Clinical Notes */}
              <div className="flex flex-col gap-space-xs">
                <label className="font-label-md text-label-md text-on-surface font-semibold">Clinical Referral Notes</label>
                <textarea className="w-full p-space-md bg-surface-container-low border border-slate-200/80 text-on-surface font-body-sm text-body-sm rounded outline-none placeholder:text-outline focus:bg-surface-container transition-colors resize-none" placeholder="e.g., Suspected blast proliferation, follow-up after chemotherapy cycle, rule out thrombocytopenia artifacts..." rows="2"></textarea>
              </div>
              
              {/* Blood Smear Image Upload Area */}
              <div className="flex flex-col gap-space-xs">
                <label className="font-label-md text-label-md text-on-surface font-semibold">Blood Smear Slide Images (Whole-Slide Scan or FOVs)</label>
                <div className="p-space-lg bg-surface-container-low border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container transition-colors">
                  <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary mb-space-xs shadow-sm border border-slate-200">
                    <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
                  </div>
                  <p className="font-body-md text-body-md font-medium text-on-surface">
                    Drag &amp; drop specimen slide images or <span className="text-primary underline">browse</span>
                  </p>
                  <p className="font-label-sm text-label-sm text-secondary mt-1">
                    Supports TIFF, SVS, NDPI, PNG, DICOM · Minimum 100x oil immersion fields recommended
                  </p>
                </div>
              </div>
            </div>
            
            {/* Modal Actions Footer */}
            <div className="px-gutter-lg py-space-md bg-surface-container-low border-t border-slate-200/50 flex items-center justify-end gap-space-md">
              <button 
                className="px-space-md py-1.5 rounded bg-surface-container-lowest border border-slate-200/80 text-secondary font-label-md text-label-md hover:bg-surface-container transition-colors" 
                onClick={() => setIsModalOpen(false)} 
                type="button"
              >
                Cancel
              </button>
              <button 
                className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded bg-[#0d9488] hover:bg-teal-700 text-white font-label-md text-label-md transition-colors shadow-sm" 
                onClick={() => setIsModalOpen(false)} 
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">biotech</span>
                <span>Submit &amp; Initiate AI Analysis</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
