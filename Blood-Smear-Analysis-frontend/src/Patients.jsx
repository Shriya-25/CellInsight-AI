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
        <span className="truncate">{options.find(o => o.value === value)?.label}</span>
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

const FormSelect = ({ value, onChange, options, name, required }) => {
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
      {name && <input type="hidden" name={name} value={value} required={required} />}
      <div 
        className={`w-full h-9 px-3 bg-slate-50 border ${isOpen ? 'border-teal-600 ring-1 ring-teal-600 bg-white' : 'border-slate-200'} rounded-lg ${value === '' ? 'text-slate-500' : 'text-slate-900'} text-xs flex items-center justify-between cursor-pointer transition-all`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{options.find(o => o.value === value)?.label || 'Select'}</span>
        <svg className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg z-[110] py-1">
          {options.map(opt => (
            <div 
              key={opt.value}
              className={`px-3 py-2 text-xs cursor-pointer transition-colors ${value === opt.value ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'} ${opt.value === '' ? 'text-slate-400 italic' : ''}`}
              onClick={() => {
                if(opt.value !== '') {
                  onChange(opt.value);
                  setIsOpen(false);
                }
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

const PatientProfile = ({ patient, onBack, onUpdatePatient, onOpenCase }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});

  const handleEditClick = () => {
    setEditForm({ ...patient });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    onUpdatePatient(editForm);
    setIsEditModalOpen(false);
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto space-y-6 pb-10">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          {/* Breadcrumb navigation */}
          <nav className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <button onClick={onBack} className="hover:text-teal-600 transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">group</span>
              <span>Patients</span>
            </button>
            <span className="text-slate-300 font-mono">/</span>
            <span className="text-slate-900 font-semibold font-mono">{patient.id}</span>
          </nav>
          <div className="flex items-baseline gap-3 mt-1">
            <h1 className="text-[28px] font-semibold text-slate-900 tracking-tight leading-tight">PATIENT PROFILE</h1>
            <span className="px-2.5 py-0.5 rounded bg-teal-50 border border-teal-100 text-teal-700 font-mono text-[11px] font-semibold uppercase tracking-wider">{patient.active ? 'Active Record' : 'Inactive Record'}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Overview of patient demographics, current active case, and diagnostic history.</p>
        </div>
        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0d9488] hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2" type="button">
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>New Case</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Patient Demographics & Baseline Info (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 flex flex-col gap-6">
          {/* Unified Patient Identity Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center text-xl font-bold shrink-0">
                {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-slate-900">{patient.name}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px] font-semibold">{patient.id}</span>
                  <button onClick={handleEditClick} className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors" type="button">
                    <span className="material-symbols-outlined text-[14px]">edit</span>
                    <span>Edit</span>
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Registered {patient.date} • {patient.gender} • {patient.age} yrs</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Blood Group</span>
                <span className="inline-flex items-center justify-center px-2.5 py-1 mt-0.5 rounded border border-rose-200/60 bg-rose-50 text-rose-600 font-mono text-sm font-bold">
                  {patient.blood}
                </span>
              </div>
            </div>
          </div>

          {/* Clean Structured Key-Value Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-6 py-4 border-t border-b border-slate-100">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Full Name</span>
              <span className="text-xs font-semibold text-slate-900">{patient.name}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Patient ID</span>
              <span className="font-mono text-xs font-bold text-teal-700">{patient.id}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Age</span>
              <span className="text-xs font-semibold text-slate-900">{patient.age} yrs</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Gender</span>
              <span className="text-xs font-semibold text-slate-900">{patient.gender}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Weight</span>
              <span className="text-xs font-semibold text-slate-900">{patient.weight}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Contact Number</span>
              <span className="font-mono text-xs font-semibold text-slate-900">{patient.contact}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Address</span>
              <span className="text-xs font-semibold text-slate-900 truncate pr-2" title={patient.address}>{patient.address}</span>
            </div>
          </div>

          {/* Clinical Notes Section */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-slate-400">notes</span>
              <span className="text-xs font-semibold text-slate-900">Clinical Baseline Notes</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-xs flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[16px] text-teal-600 shrink-0 mt-0.5">info</span>
              <p className="leading-relaxed">Routine hematology evaluation. Patient referred for automated smear screening following mild constitutional fatigue.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Current Case Spotlight (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 flex flex-col gap-5 relative overflow-hidden">
          {/* Top Visual Accent Strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#0d9488]"></div>
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                <span className="text-[10px] font-bold tracking-wider uppercase text-teal-700">Active Diagnostic Workflow</span>
              </div>
              <h2 className="text-base font-bold text-slate-900">CURRENT CASE</h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest laboratory specimen under processing</p>
            </div>
            <span className="px-2 py-1 rounded border border-slate-200 bg-slate-50 font-mono text-[10px] font-semibold text-slate-600">
              06 Sep 2026
            </span>
          </div>
          {/* Case Identity Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Case Accession ID</span>
                <span className="font-mono text-sm font-bold text-slate-900">CS-1024</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Sample ID</span>
                <span className="font-mono text-xs font-semibold text-slate-700">S-1024</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200/60 mt-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Test Requested</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="material-symbols-outlined text-[16px] text-teal-600">biotech</span>
                <span className="text-xs font-semibold text-slate-900">Blood Smear (Peripheral Blood Smear)</span>
              </div>
            </div>
          </div>
          {/* Multi-Stage Status Overview */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Workflow Stage Status</span>
            <div className="flex flex-col gap-2">
              {/* Stage 1: AI Analysis */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-teal-600">neurology</span>
                  <span className="text-xs font-semibold text-slate-800">AI Morphology Analysis</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-emerald-200/60 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase">
                  <span className="material-symbols-outlined text-[12px]">check_circle</span>
                  <span>Completed</span>
                </span>
              </div>
              {/* Stage 2: Expert Review */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">clinical_notes</span>
                  <span className="text-xs font-semibold text-slate-800">Expert Pathologist Review</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-amber-200/60 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase">
                  <span className="material-symbols-outlined text-[12px]">schedule</span>
                  <span>Pending</span>
                </span>
              </div>
              {/* Stage 3: Final Report */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">description</span>
                  <span className="text-xs font-semibold text-slate-800">Diagnostic Report</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-200 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase">
                  <span>Not Generated</span>
                </span>
              </div>
            </div>
          </div>
          {/* Hint block */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-teal-50/50 border border-teal-100/50 text-teal-800 text-[11px] leading-relaxed">
            <span className="material-symbols-outlined text-[14px] text-teal-600 shrink-0 mt-0.5">lightbulb</span>
            <p>Full digital smear fields, morphologic tiles, and differential classification are accessible within the Case Workspace.</p>
          </div>
          {/* Primary Action Callout */}
          <div className="pt-2">
            <button className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0d9488] hover:bg-teal-700 text-white text-xs font-semibold transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2" type="button">
              <span>View Case Workspace</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Case History Table */}
      <div className="w-full bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900">CASE HISTORY</h2>
            <p className="text-xs text-slate-500 mt-0.5">Chronological archive of patient laboratory cases and verification outcomes</p>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg self-start sm:self-auto">
            <span>3 Recorded Accessions</span>
          </div>
        </div>
        {/* Historical Table Container */}
        <div className="w-full overflow-x-auto rounded-xl border border-slate-200/70 bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4" scope="col">Date</th>
                <th className="py-3 px-4" scope="col">Case ID</th>
                <th className="py-3 px-4" scope="col">Test Type</th>
                <th className="py-3 px-4" scope="col">Key Finding</th>
                <th className="py-3 px-4" scope="col">Status</th>
                <th className="py-3 px-4 text-right" scope="col">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {[
                { date: '06 Sep 2026', id: 'CS-1024', test: 'Blood Smear', finding: 'Abnormal cell pattern', status: 'Review Required', active: true, caseObj: { id: 'CS-1024', patient: patient.name, patientId: patient.id, test: 'CBC + Blood Smear', date: '06 Sep 2026', finding: 'Abnormal cell pattern', confidence: 94.6, status: 'Review Required', priority: 'High', colorType: 'error' } },
                { date: '02 Aug 2026', id: 'CS-0945', test: 'Blood Smear', finding: 'Mild anisocytosis', status: 'Reviewed', active: false },
                { date: '10 Jul 2026', id: 'CS-0891', test: 'CBC', finding: 'No significant abnormality', status: 'Verified', active: false },
              ].map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">{row.date}</td>
                  <td className={`py-3.5 px-4 font-mono font-semibold whitespace-nowrap ${row.active ? 'text-teal-700' : 'text-slate-900'}`}>{row.id}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700">{row.test}</td>
                  <td className="py-3.5 px-4 text-slate-600">{row.finding}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {row.active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200/60">
                        <span className="material-symbols-outlined text-[12px]">schedule</span>
                        <span>{row.status}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        <span className="material-symbols-outlined text-[12px]">{row.status === 'Verified' ? 'verified' : 'done_all'}</span>
                        <span>{row.status}</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    {row.active ? (
                      <button
                        onClick={() => onOpenCase && onOpenCase(row.caseObj)}
                        className="inline-flex items-center gap-1 text-teal-600 font-semibold hover:underline text-xs"
                        type="button"
                      >
                        <span>View Case</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </button>
                    ) : (
                      <button className="inline-flex items-center gap-1 text-slate-500 hover:text-teal-600 font-semibold transition-colors text-xs" type="button">
                        <span>View Report</span>
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Patient Modal */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 z-[100] backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-200 ${isEditModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsEditModalOpen(false);
        }}
      >
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden transform transition-all duration-200 ${isEditModalOpen ? 'scale-100' : 'scale-95'}`}>
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-900">Edit Patient Details</h2>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">{editForm.id}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Update clinical laboratory patient record</p>
            </div>
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors" 
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
            </button>
          </div>
          
          <form onSubmit={handleEditSubmit} className="px-6 pb-6 pt-4 space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Patient ID</label>
                <input className="w-full h-9 px-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono text-xs cursor-not-allowed" disabled type="text" value={editForm.id || ''} />
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name <span className="text-rose-500">*</span></label>
                <input 
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600" 
                  required type="text" 
                  value={editForm.name || ''} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})} 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Age (Yrs) <span className="text-rose-500">*</span></label>
                <input 
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600" 
                  max="120" min="0" required type="number" 
                  value={parseInt(editForm.age) || ''} 
                  onChange={e => setEditForm({...editForm, age: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Gender <span className="text-rose-500">*</span></label>
                <FormSelect 
                  value={editForm.gender || ''} 
                  onChange={val => setEditForm({...editForm, gender: val})}
                  required={true}
                  options={[
                    { value: '', label: 'Select' },
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' }
                  ]} 
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Blood <span className="text-rose-500">*</span></label>
                <FormSelect 
                  value={editForm.blood || ''} 
                  onChange={val => setEditForm({...editForm, blood: val})}
                  required={true}
                  options={[
                    { value: '', label: 'Select' },
                    { value: 'A+', label: 'A+' },
                    { value: 'A-', label: 'A-' },
                    { value: 'B+', label: 'B+' },
                    { value: 'B-', label: 'B-' },
                    { value: 'AB+', label: 'AB+' },
                    { value: 'AB-', label: 'AB-' },
                    { value: 'O+', label: 'O+' },
                    { value: 'O-', label: 'O-' }
                  ]} 
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Weight</label>
                <input 
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600" 
                  type="text" 
                  value={editForm.weight || ''} 
                  onChange={e => setEditForm({...editForm, weight: e.target.value})} 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Contact Number <span className="text-rose-500">*</span></label>
                <input 
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600" 
                  required type="tel" 
                  value={editForm.contact || ''} 
                  onChange={e => setEditForm({...editForm, contact: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Email <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input 
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600" 
                  type="email" 
                  value={editForm.email || ''} 
                  onChange={e => setEditForm({...editForm, email: e.target.value})} 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Address</label>
              <textarea 
                className="w-full min-h-[60px] p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 resize-y" 
                value={editForm.address || ''} 
                onChange={e => setEditForm({...editForm, address: e.target.value})} 
              ></textarea>
            </div>
            
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 mt-4">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors" 
                type="button"
              >
                Cancel
              </button>
              <button 
                className="px-5 py-2 bg-[#0d9488] hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 flex items-center gap-1.5" 
                type="submit"
              >
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodFilter, setBloodFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [caseStatusFilter, setCaseStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', desc: '' });
  
  const [formGender, setFormGender] = useState('');
  const [formBloodGroup, setFormBloodGroup] = useState('');

  const [patients, setPatients] = useState([
    {
      id: 'P-1021', name: 'Rahul Deshmukh', age: '32', gender: 'Male', blood: 'B+',
      weight: '68 kg', address: 'Pune, MH', contact: '+91 98765 43210',
      cases: '3 Cases', active: true, date: '06 Jul 2026'
    },
    {
      id: 'P-1022', name: 'Anita Shah', age: '35', gender: 'Female', blood: 'O+',
      weight: '54 kg', address: 'Mumbai, MH', contact: '+91 97654 32142',
      cases: '2 Cases', active: true, date: '12 Jul 2026'
    },
    {
      id: 'P-1023', name: 'Rohan Patil', age: '28', gender: 'Male', blood: 'A+',
      weight: '72 kg', address: 'Thane, MH', contact: '+91 99876 54318',
      cases: '1 Case', active: true, date: '18 Aug 2026'
    },
    {
      id: 'P-1024', name: 'Sneha Kulkarni', age: '51', gender: 'Female', blood: 'AB+',
      weight: '61 kg', address: 'Nashik, MH', contact: '+91 96543 21664',
      cases: '4 Cases', active: true, date: '21 Jun 2026'
    },
    {
      id: 'P-1025', name: 'Arjun Deshmukh', age: '46', gender: 'Male', blood: 'A-',
      weight: '76 kg', address: 'Nagpur, MH', contact: '+91 98765 43275',
      cases: '2 Cases', active: true, date: '28 Aug 2026'
    },
    {
      id: 'P-1026', name: 'Priya Nair', age: '29', gender: 'Female', blood: 'O-',
      weight: '58 kg', address: 'Pune, MH', contact: '+91 98234 56789',
      cases: '2 Cases', active: true, date: '02 Sep 2026'
    },
    {
      id: 'P-1027', name: 'Vikram Sen', age: '62', gender: 'Male', blood: 'AB-',
      weight: '81 kg', address: 'Navi Mumbai, MH', contact: '+91 97123 45678',
      cases: '5 Cases', active: true, date: '14 Sep 2026'
    }
  ]);

  const updatePatient = (updatedPatient) => {
    setPatients(patients.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    setSelectedPatient(updatedPatient);
    
    // Show toast for feedback
    setToastMessage({ title: 'Patient Updated', desc: `${updatedPatient.name}'s information has been successfully updated.` });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleRowClick = (patient) => {
    setSelectedPatient(patient);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setBloodFilter('ALL');
    setGenderFilter('ALL');
    setCaseStatusFilter('ALL');
    setDateFilter('ALL');
  };

  const handleNewPatientSubmit = (e) => {
    e.preventDefault();
    
    const name = e.target.formFullName.value.trim();
    const age = e.target.formAge.value.trim();
    const gender = e.target.formGender.value;
    const blood = e.target.formBloodGroup.value;
    const contact = e.target.formContact.value.trim();
    const weight = e.target.formWeight.value.trim();
    const address = e.target.formAddress.value.trim();
    
    const newPatient = {
      id: 'P-1028',
      name,
      age,
      gender,
      blood,
      weight: weight ? weight + ' kg' : '-',
      address: address || '-',
      contact,
      cases: '0 Cases',
      active: false,
      date: 'Today'
    };

    setPatients([newPatient, ...patients]);
    setIsModalOpen(false);
    
    // Reset form state
    setFormGender('');
    setFormBloodGroup('');
    
    setToastMessage({ title: 'Patient Record Created', desc: 'P-1028 (' + name + ') registered successfully.' });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3800);
  };

  const filteredPatients = patients.filter(p => {
    const query = searchQuery.toLowerCase();
    const matchesQuery = !query || p.id.toLowerCase().includes(query) || p.name.toLowerCase().includes(query) || p.contact.toLowerCase().includes(query);
    const matchesBlood = bloodFilter === 'ALL' || p.blood === bloodFilter;
    const matchesGender = genderFilter === 'ALL' || p.gender === genderFilter;
    
    let matchesCase = true;
    if (caseStatusFilter === 'ACTIVE') matchesCase = p.active;
    if (caseStatusFilter === 'NO_ACTIVE') matchesCase = !p.active;
    
    return matchesQuery && matchesBlood && matchesGender && matchesCase;
  });

  if (selectedPatient) {
    return <PatientProfile 
      patient={selectedPatient} 
      onBack={() => setSelectedPatient(null)} 
      onUpdatePatient={updatePatient}
      onOpenCase={(caseObj) => {
        sessionStorage.setItem('cellinsight_open_case', JSON.stringify(caseObj));
        window.dispatchEvent(new CustomEvent('cellinsight_navigate', { detail: { view: 'cases', openCase: caseObj } }));
      }}
    />;
  }


  return (
    <div className="space-y-6 flex-1 max-w-7xl w-full mx-auto pb-10">
      {/* 1. Page Title & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold text-slate-900 tracking-tight leading-tight">Patients</h1>
          <p className="text-xs text-slate-500 mt-1">Manage patient records and access associated cases.</p>
        </div>
        <div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#0d9488] hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2" 
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>
            <span>+ New Patient</span>
          </button>
        </div>
      </div>

      {/* 2. Summary Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Patients</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">1,248</div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">All registered patients</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100 shadow-sm">
            <svg className="w-4 h-4 text-teal-600" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Patients</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">86</div>
            <div className="text-[11px] text-teal-600 mt-1 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
              Patients with active cases
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm">
            <svg className="w-4 h-4 text-emerald-600" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Registered Today</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">12</div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">New patient records today</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100 shadow-sm">
            <svg className="w-4 h-4 text-sky-600" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect height="18" rx="2" width="18" x="3" y="4"></rect><path d="M3 10h18"></path><path d="M10 14h4"></path><path d="M12 12v4"></path></svg>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Cases</div>
            <div className="text-2xl font-bold text-amber-600 mt-1 tracking-tight">18</div>
            <div className="text-[11px] text-amber-600/80 mt-1 font-medium">Cases awaiting review</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 shadow-sm">
            <svg className="w-4 h-4 text-amber-600" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect height="4" rx="1" width="8" x="8" y="2"></rect><path d="M12 11v4"></path><path d="M12 15h2"></path></svg>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar Card */}
      <div className="bg-white rounded-xl border border-slate-200/70 p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition-all" 
              placeholder="Search by patient name, ID, phone number, city, or case ID..." 
              type="text" 
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
              onClick={clearFilters}
              className="h-9 px-3 text-xs font-medium text-slate-600 hover:text-teal-700 hover:bg-slate-50 border border-slate-200/80 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm" 
              type="button"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18"></path><path d="M7 12h10"></path><path d="M10 18h4"></path></svg>
              <span>Clear Filters</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 bg-slate-50/80 border border-slate-200/80 rounded-lg px-2.5 py-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Blood:</span>
            <CustomSelect 
              value={bloodFilter} 
              onChange={setBloodFilter} 
              options={[
                { value: 'ALL', label: 'All Groups' },
                { value: 'A+', label: 'A+' },
                { value: 'A-', label: 'A-' },
                { value: 'B+', label: 'B+' },
                { value: 'B-', label: 'B-' },
                { value: 'AB+', label: 'AB+' },
                { value: 'AB-', label: 'AB-' },
                { value: 'O+', label: 'O+' },
                { value: 'O-', label: 'O-' }
              ]} 
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-50/80 border border-slate-200/80 rounded-lg px-2.5 py-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Gender:</span>
            <CustomSelect 
              value={genderFilter} 
              onChange={setGenderFilter} 
              options={[
                { value: 'ALL', label: 'All Genders' },
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' }
              ]} 
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-50/80 border border-slate-200/80 rounded-lg px-2.5 py-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Case Status:</span>
            <CustomSelect 
              value={caseStatusFilter} 
              onChange={setCaseStatusFilter} 
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'ACTIVE', label: 'Active Case' },
                { value: 'NO_ACTIVE', label: 'No Active Case' }
              ]} 
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-50/80 border border-slate-200/80 rounded-lg px-2.5 py-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Registered:</span>
            <CustomSelect 
              value={dateFilter} 
              onChange={setDateFilter} 
              options={[
                { value: 'ALL', label: 'All Time' },
                { value: 'TODAY', label: 'Today' },
                { value: 'WEEK', label: 'This Week' },
                { value: 'MONTH', label: 'This Month' }
              ]} 
            />
          </div>
        </div>
      </div>

      {/* 4. Patient Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/70 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Patient ID</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Patient Name</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Age</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Gender</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Blood</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Weight</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Address</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Contact</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Cases</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredPatients.map(patient => (
                <tr 
                  key={patient.id}
                  onClick={() => handleRowClick(patient)}
                  className="hover:bg-teal-50/30 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-mono font-semibold text-teal-700 whitespace-nowrap">{patient.id}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">{patient.name}</td>
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{patient.age} yrs</td>
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{patient.gender}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-block bg-slate-100 text-slate-700 font-semibold font-mono text-[11px] px-2 py-0.5 rounded">{patient.blood}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">{patient.weight}</td>
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap truncate max-w-[140px]">{patient.address}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">{patient.contact}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-slate-800">{patient.cases}</span>
                      {patient.active && (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-semibold px-1.5 py-0.5 rounded">Active</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">{patient.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredPatients.length === 0 && (
          <div className="py-16 px-6 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="17" x2="22" y1="8" y2="13"></line><line x1="22" x2="17" y1="8" y2="13"></line></svg>
            </div>
            <h4 className="text-sm font-semibold text-slate-800">No patients found matching your search</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">There are no records matching the specified criteria. Try resetting the query or removing filters.</p>
            <button 
              onClick={clearFilters}
              className="mt-4 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors" 
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
              <span>Clear search and filters</span>
            </button>
          </div>
        )}

        {/* Table Footer / Pagination */}
        <div className="bg-slate-50/70 border-t border-slate-100 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-mono font-semibold text-slate-800">{filteredPatients.length}</span> of <span className="font-mono font-semibold text-slate-800">1,248</span> registered patients
          </div>
          <div className="flex items-center gap-2">
            <button className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-400 cursor-not-allowed text-xs font-medium" disabled>Previous</button>
            <span className="px-2 font-mono text-xs text-slate-700">Page 1 of 179</span>
            <button className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* New Patient Modal */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 z-[100] backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-200 ${isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsModalOpen(false);
        }}
      >
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden transform transition-all duration-200 ${isModalOpen ? 'scale-100' : 'scale-95'}`}>
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-900">Register New Patient</h2>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">Auto ID: P-1028</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Create clinical laboratory patient record</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors" 
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
            </button>
          </div>
          
          <form onSubmit={handleNewPatientSubmit} className="px-6 pb-6 pt-4 space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Patient ID</label>
                <input className="w-full h-9 px-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono text-xs cursor-not-allowed" disabled type="text" value="P-1028" />
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name <span className="text-rose-500">*</span></label>
                <input name="formFullName" className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600" required type="text" />
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Age (Yrs) <span className="text-rose-500">*</span></label>
                <input name="formAge" className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600" max="120" min="0" required type="number" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Gender <span className="text-rose-500">*</span></label>
                <FormSelect 
                  name="formGender" 
                  value={formGender} 
                  onChange={setFormGender}
                  required={true}
                  options={[
                    { value: '', label: 'Select' },
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' }
                  ]} 
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Blood <span className="text-rose-500">*</span></label>
                <FormSelect 
                  name="formBloodGroup" 
                  value={formBloodGroup} 
                  onChange={setFormBloodGroup}
                  required={true}
                  options={[
                    { value: '', label: 'Select' },
                    { value: 'A+', label: 'A+' },
                    { value: 'A-', label: 'A-' },
                    { value: 'B+', label: 'B+' },
                    { value: 'B-', label: 'B-' },
                    { value: 'AB+', label: 'AB+' },
                    { value: 'AB-', label: 'AB-' },
                    { value: 'O+', label: 'O+' },
                    { value: 'O-', label: 'O-' }
                  ]} 
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Weight (kg)</label>
                <input name="formWeight" className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600" max="300" min="1" type="number" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Contact Number <span className="text-rose-500">*</span></label>
                <input name="formContact" className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600" required type="tel" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Email <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input name="formEmail" className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600" type="email" />
              </div>
            </div>
            
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Residential Address / City</label>
              <input name="formAddress" className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600" type="text" />
            </div>
            
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Clinical Notes <span className="text-slate-400 font-normal">(Optional)</span></label>
              <textarea name="formNotes" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600" rows="2"></textarea>
            </div>
            
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors" 
                type="button"
              >
                Cancel
              </button>
              <button className="px-4 py-2 rounded-lg bg-[#0d9488] hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5" type="submit">
                <svg className="w-3.5 h-3.5" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Create Patient Record</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast Notification */}
      <div className={`fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-3 text-xs transform transition-all duration-300 ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
        </div>
        <div>
          <div className="font-semibold">{toastMessage.title}</div>
          <div className="text-slate-400 text-[11px]">{toastMessage.desc}</div>
        </div>
      </div>
    </div>
  );
}
