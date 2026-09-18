import React, { useState, useRef, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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

const FormSelect = ({ value, onChange, options }) => {
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
        className={`w-full h-9 px-3 bg-slate-50 border ${isOpen ? 'border-teal-600 ring-1 ring-teal-600 bg-white' : 'border-slate-200'} rounded-lg text-slate-900 text-xs flex items-center justify-between cursor-pointer transition-all`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{options.find(o => o.value === value)?.label || value}</span>
        <svg className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg z-[110] py-1">
          {options.map(opt => (
            <div 
              key={opt.value}
              className={`px-3 py-2 text-xs cursor-pointer transition-colors ${value === opt.value ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'} ${opt.value === 'new' ? 'text-teal-600 font-medium border-t border-slate-100 mt-1' : ''}`}
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

const CaseDetails = ({ caseData, onBack }) => {
  const token = localStorage.getItem('token');
  const fileInputRef = useRef(null);
  const [analyses, setAnalyses] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (caseData._id) {
      fetch(`${API_URL}/api/cases/${caseData._id}/analyses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setAnalyses(data))
      .catch(err => console.error(err));
    }
  }, [caseData._id, token]);

  const handleUploadImage = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    const formData = new FormData();
    formData.append('image', selectedFile);
    
    try {
      const res = await fetch(`${API_URL}/api/cases/${caseData._id}/images`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.status === 401 || res.status === 403) {
        window.dispatchEvent(new Event('cellinsight_auth_error'));
        throw new Error('Authentication expired. Please log in again.');
      }
      if(res.ok) {
        alert("Image uploaded successfully");
      } else {
        const errText = await res.text();
        alert(`Upload failed: ${errText}`);
      }
    } catch(err) {
      alert(`Upload exception: ${err.message}`);
    }
  };

  const handleRunAnalysis = async () => {
    try {
      const res = await fetch(`${API_URL}/api/cases/${caseData._id}/analyze`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 403) {
        window.dispatchEvent(new Event('cellinsight_auth_error'));
        throw new Error('Authentication expired. Please log in again.');
      }
      if(res.ok) {
        alert("Analysis triggered successfully. Cases will update.");
      } else {
        const errText = await res.text();
        alert(`Analysis failed: ${errText}`);
      }
    } catch(err) {
      alert(`Analysis exception: ${err.message}`);
    }
  };

  return (
    <div className="flex-1 max-w-[1536px] w-full mx-auto space-y-5 pb-10">
      {/* Breadcrumbs & Header Actions Row */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            <button onClick={onBack} className="hover:text-slate-600 transition-colors">Cases</button>
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
            <span className="text-slate-700 font-semibold">{caseData.id}</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Case Details</h1>
          <p className="text-xs text-slate-500 mt-0.5">View analysis results, review status, and manage case workflow.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-700 bg-white border border-teal-600 rounded-lg hover:bg-teal-50/50 transition shadow-sm">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            Edit Case
          </button>
          <button 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition shadow-sm"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Delete
          </button>
          <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition shadow-sm">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            Generate Report
          </button>
        </div>
      </section>

      {/* Patient & Case Info Banner */}
      <section className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-center">
          <div className="xl:col-span-4 flex flex-col justify-between border-b xl:border-b-0 xl:border-r border-slate-100 pr-4 pb-4 xl:pb-0">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl font-bold text-slate-900">{caseData.id}</span>
                {caseData.status === 'Review Required' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-600 border border-amber-200/60">Review Required</span>
                )}
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                  caseData.priority === 'High' ? 'bg-rose-50 text-rose-600 border-rose-200/60' :
                  caseData.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-200/60' :
                  'bg-slate-100 text-slate-600 border-slate-200/60'
                }`}>{caseData.priority} Priority</span>
              </div>
              <div className="mt-2.5 space-y-1 text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span>Sample ID: <strong className="text-slate-700 font-semibold">{caseData.id.replace('CS', 'S')}</strong></span>
                  <span>Test: <strong className="text-slate-700 font-semibold">{caseData.test}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>Created: <span className="text-slate-600 font-medium">{caseData.date}, 10:24 AM</span></span>
                  <span>Updated: <span className="text-slate-600 font-medium">{caseData.date}, 2:15 PM</span></span>
                </div>
              </div>
            </div>
          </div>
          <div className="xl:col-span-4 flex items-center gap-4 border-b xl:border-b-0 xl:border-r border-slate-100 pr-4 pb-4 xl:pb-0">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold shrink-0">
              {caseData.patient.charAt(0)}
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Patient Name</span>
                <span className="font-bold text-slate-800">{caseData.patient}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Patient ID</span>
                <span className="px-2 py-0.5 text-[11px] font-semibold text-blue-600 bg-blue-50 rounded">{caseData.patientId}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Age / Gender</span>
                <span className="font-medium text-slate-700">32 yrs / Male</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Blood Group</span>
                <span className="px-1.5 py-0.5 text-[11px] font-semibold text-slate-700 bg-slate-100 rounded">B+</span>
              </div>
            </div>
          </div>
          <div className="xl:col-span-4 flex flex-col justify-between h-full space-y-2 text-xs">
            <div className="space-y-1.5">
              <div className="flex items-start gap-2"><span className="text-slate-400 shrink-0">Contact</span><span className="font-medium text-slate-700">+91 98765 43210</span></div>
              <div className="flex items-start gap-2"><span className="text-slate-400 shrink-0">Address</span><span className="font-medium text-slate-700">Pune, Maharashtra</span></div>
              <div className="flex items-start gap-2"><span className="text-slate-400 shrink-0">Clinical Notes</span><span className="font-medium text-slate-700">Routine hematology evaluation.</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Stepper */}
      <section className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-5 h-5 rounded bg-teal-50 text-teal-700 flex items-center justify-center">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect height="18" rx="2" width="18" x="3" y="3"></rect><path d="M9 12l2 2 4-4"></path></svg>
          </div>
          <h2 className="text-sm font-bold text-slate-800">Case Workflow Status</h2>
        </div>
        <div className="relative flex items-center justify-between max-w-4xl mx-auto px-4">
          <div className="absolute left-10 right-10 top-3 h-[2px] -translate-y-1/2 bg-slate-200 z-0">
            <div className="h-full bg-emerald-500 w-[60%]"></div>
          </div>
          {[
            { label: 'Image Upload', sub: '5 images', done: true },
            { label: 'Quality Check', sub: 'Good quality', done: true },
            { label: 'AI Analysis', sub: `${caseData.date}`, done: true },
            { label: 'Expert Review', sub: null, active: true },
            { label: 'Verification', sub: 'Pending', done: false },
            { label: 'Report', sub: 'Not Generated', done: false },
          ].map((step, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center text-center">
              {step.done ? (
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-white shadow-sm">
                  <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              ) : step.active ? (
                <div className="w-6 h-6 rounded-full bg-white border-2 border-slate-700 flex items-center justify-center ring-4 ring-white shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span>
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-white border-2 border-slate-300 ring-4 ring-white"></div>
              )}
              <span className={`mt-2 text-xs font-semibold ${step.done || step.active ? 'text-slate-800' : 'text-slate-500'}`}>{step.label}</span>
              {step.active ? (
                <span className="mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200/60">Pending</span>
              ) : (
                <span className={`text-[11px] font-medium ${step.done ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>{step.done ? 'Completed' : step.sub}</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Middle Triple-Card Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <article className="lg:col-span-6 bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-teal-50 text-teal-700 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect height="18" rx="2" ry="2" width="18" x="3" y="3"></rect><circle cx="9" cy="9" r="2"></circle><path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Blood Smear Images</h3>
                  <p className="text-[11px] text-slate-400 font-medium">5 fields uploaded</p>
                </div>
              </div>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50/60 hover:bg-teal-100/50 rounded-lg transition">View All Images</button>
            </div>
            <div className="grid grid-cols-5 gap-2.5 my-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-full aspect-square rounded-lg border border-slate-200 overflow-hidden p-1 bg-purple-50">
                    <div className="w-full h-full rounded-md bg-[#F4E6ED] relative overflow-hidden flex items-center justify-center">
                      <div className="absolute w-6 h-6 rounded-full bg-purple-600/60 blur-[0.5px]"></div>
                      <div className="w-5 h-5 rounded-full bg-purple-900/70 border border-purple-300/40"></div>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-slate-600 mt-1.5">Field {i+1}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</span>
              <span className="text-slate-600 font-medium">4 fields accepted <span className="text-slate-300 mx-1.5">|</span> 1 field needs review</span>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleUploadImage} />
            <button onClick={() => fileInputRef.current.click()} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-700 bg-white border border-teal-600 rounded-lg hover:bg-teal-50 transition">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>
              Add Image
            </button>
            <button onClick={handleRunAnalysis} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-teal-600 border border-teal-600 rounded-lg hover:bg-teal-700 transition">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
              Run Analysis
            </button>
          </div>
        </article>

        <article className="lg:col-span-3 bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-teal-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              <h3 className="text-xs font-bold text-slate-800">AI Analysis Summary</h3>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200/60">Completed</span>
          </div>
          <div className="space-y-1 text-xs border-b border-slate-100 pb-2.5">
            {[['Total Cells','482'],['RBC','389'],['WBC','78'],['Platelets','15']].map(([k,v]) => (
              <div key={k} className="flex justify-between py-0.5"><span className="text-slate-500 font-medium">{k}</span><span className="text-slate-900 font-bold">{v}</span></div>
            ))}
          </div>
          <div className="mt-2.5">
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">WBC Differential</h4>
            <div className="space-y-1 text-xs">
              {[['Neutrophils','42'],['Lymphocytes','18'],['Monocytes','8'],['Eosinophils','6'],['Basophils','2'],['Myeloblasts','2']].map(([k,v]) => (
                <div key={k} className="flex justify-between py-0.5"><span className="text-slate-500 font-medium">{k}</span><span className="text-slate-800 font-medium">{v}</span></div>
              ))}
            </div>
          </div>
        </article>

        <article className="lg:col-span-3 bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800">AI Findings</h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5"></span><span className="text-slate-600 font-medium">{caseData.finding}</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5"></span><span className="text-slate-600 font-medium">Possible morphological anomaly</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5"></span><span className="text-slate-600 font-medium">Low-confidence classification in some cells</span></li>
            </ul>
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Confidence Score</span>
              <div className="text-base font-bold text-slate-900 my-1.5">{caseData.confidence ? `${caseData.confidence}%` : 'Processing...'}</div>
              {caseData.confidence && (
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-600 rounded-full" style={{width:`${caseData.confidence}%`}}></div>
                </div>
              )}
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60 text-[11px] text-slate-500 leading-relaxed">
              AI results are assistive and require expert verification.
            </div>
          </div>
          <div className="pt-3">
            <button className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-white border border-teal-600 rounded-lg hover:bg-teal-50 transition">
              View Full Analysis
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </article>
      </section>

      {/* Bottom Triple-Card Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <article className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-teal-50 text-teal-700 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <h3 className="text-sm font-bold text-slate-800">Expert Review</h3>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200/60 rounded-full">Pending</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-slate-400">Status</span><span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-600">Pending</span></div>
              <div className="flex items-center gap-2"><span className="text-slate-400">Reviewer</span><span className="text-slate-700">Not Assigned</span></div>
              <div className="flex items-start gap-2"><span className="text-slate-400 shrink-0">Notes</span><span className="text-slate-600">No review completed yet.</span></div>
            </div>
          </div>
          <div className="pt-4">
            <button className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition shadow-sm">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>
              Start Review
            </button>
          </div>
        </article>

        <article className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-teal-50 text-teal-700 flex items-center justify-center">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              </div>
              <h3 className="text-sm font-bold text-slate-800">Reports</h3>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-slate-400">Latest Report</span><span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500">Not Generated</span></div>
              <div className="flex items-center gap-2"><span className="text-slate-400">Version</span><span className="text-slate-700">—</span></div>
              <div className="flex items-center gap-2"><span className="text-slate-400">Generated On</span><span className="text-slate-700">—</span></div>
            </div>
          </div>
          <div className="pt-4">
            <button className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100/80 hover:bg-slate-200 border border-slate-200/80 rounded-lg transition shadow-sm">
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              Generate Report
            </button>
          </div>
        </article>

        <article className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-teal-50 text-teal-700 flex items-center justify-center">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <h3 className="text-sm font-bold text-slate-800">Recent Activity</h3>
            </div>
          </div>
          <div className="space-y-3 mt-2 relative">
            <div className="absolute left-1 top-2 bottom-2 w-0.5 bg-slate-100"></div>
            {[
              { color: 'bg-teal-600', time: `${caseData.date}, 2:15 PM`, label: 'AI analysis completed' },
              { color: 'bg-teal-600', time: `${caseData.date}, 11:20 AM`, label: 'Images uploaded (5 fields)' },
              { color: 'bg-blue-600', time: `${caseData.date}, 10:24 AM`, label: 'Case created' },
            ].map((item, i) => (
              <div key={i} className="relative flex items-start gap-3 pl-0 text-xs">
                <span className={`w-2.5 h-2.5 rounded-full ${item.color} ring-2 ring-white shrink-0 mt-1 z-10`}></span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-1">
                  <span className="text-slate-500 font-medium">{item.time}</span>
                  <span className="text-slate-800 font-semibold">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex items-center gap-3 text-rose-600 mb-4">
                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">warning</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Delete Case?</h3>
              </div>
              <p className="text-sm text-slate-600">
                Are you sure you want to permanently delete case <span className="font-semibold">{caseData.id}</span>? 
                This will also permanently delete all associated images, slide data, and AI analysis results. 
                This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    const res = await fetch(`${API_URL}/api/cases/${caseData._id}`, {
                      method: 'DELETE',
                      headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                      onBack();
                      window.location.reload();
                    } else {
                      alert("Failed to delete case.");
                    }
                  } catch(err) {
                    alert(err.message);
                  } finally {
                    setIsDeleting(false);
                    setIsDeleteModalOpen(false);
                  }
                }}
                disabled={isDeleting}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-rose-600 border border-transparent rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-70"
              >
                {isDeleting ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    Deleting...
                  </>
                ) : (
                  'Delete Case'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Cases({ initialCase }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [testFilter, setTestFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPatient, setModalPatient] = useState('');
  const [modalTestType, setModalTestType] = useState('Blood Smear (Peripheral)');
  const [modalPriority, setModalPriority] = useState('Medium');
  const [modalSampleId, setModalSampleId] = useState('');
  const [modalImageFile, setModalImageFile] = useState(null);
  const [selectedCase, setSelectedCase] = useState(initialCase || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef(null);
  const modalFileInputRef = useRef(null);

  const handleOpenModal = () => {
    const nextIdNum = cases.length > 0 ? Math.max(...cases.map(c => parseInt(c.id.replace(/[^0-9]/g, '')) || 0)) + 1 : 100;
    setModalSampleId(`S-${nextIdNum}`);
    if (patients.length > 0) setModalPatient(patients[0].value);
    setModalTestType('Blood Smear (Peripheral)');
    setModalPriority('Medium');
    setModalImageFile(null);
    if (formRef.current) formRef.current.reset();
    setIsModalOpen(true);
  };
  
  const [cases, setCases] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  const fetchCasesAndPatients = async () => {
    try {
      setLoading(true);
      const [casesRes, patientsRes] = await Promise.all([
        fetch(`${API_URL}/api/cases`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/subjects`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (casesRes.status === 401 || casesRes.status === 403 || patientsRes.status === 401 || patientsRes.status === 403) {
        window.dispatchEvent(new Event('cellinsight_auth_error'));
        throw new Error('Authentication expired. Please log in again.');
      }
      
      if (casesRes.ok && patientsRes.ok) {
        const casesData = await casesRes.json();
        const patientsData = await patientsRes.json();
        
        const formattedCases = casesData.map(c => ({
          _id: c._id,
          id: c.caseId || c._id.slice(-6).toUpperCase(),
          patient: c.subjectId?.name || 'Unknown',
          patientId: c.subjectId?.patientIdentifier || '-',
          test: c.test || 'Blood Smear',
          date: new Date(c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          finding: c.finding || '-',
          confidence: c.confidence,
          status: c.status === 'draft' ? 'Draft' : c.status === 'review_pending' ? 'Review Required' : c.status === 'verified' ? 'Verified' : 'AI Processing',
          priority: c.priority || 'Medium',
          colorType: c.colorType || 'neutral'
        }));
        setCases(formattedCases);
        
        const formattedPatients = patientsData.map(p => ({
          value: p._id,
          label: `${p.name} (${p.patientIdentifier})`
        }));
        setPatients(formattedPatients);
        if (formattedPatients.length > 0 && !modalPatient) {
          setModalPatient(formattedPatients[0].value);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCase) setSelectedCase(initialCase);
  }, [initialCase]);

  useEffect(() => {
    fetchCasesAndPatients();
  }, []);

  const handleCreateCase = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/cases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subjectId: modalPatient,
          caseId: modalSampleId,
          test: modalTestType,
          priority: modalPriority,
          status: 'draft'
        })
      });
      if (response.status === 401 || response.status === 403) {
        window.dispatchEvent(new Event('cellinsight_auth_error'));
        throw new Error('Authentication expired. Please log in again.');
      }
      if (!response.ok) throw new Error('Failed to create case');
      
      const newCase = await response.json();
      
      if (modalImageFile) {
        const formData = new FormData();
        formData.append('image', modalImageFile);
        
        const uploadRes = await fetch(`${API_URL}/api/cases/${newCase._id}/images`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        
        if (uploadRes.ok) {
          // Trigger analysis
          await fetch(`${API_URL}/api/cases/${newCase._id}/analyze`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } else {
          alert('Case created but image upload failed.');
        }
      }

      await fetchCasesAndPatients();
      setIsModalOpen(false);
    } catch(err) {
      alert(`Case creation error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (selectedCase) {
    return <CaseDetails caseData={selectedCase} onBack={() => setSelectedCase(null)} />;
  }

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
            onClick={handleOpenModal} 
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path><line x1="12" y1="10" x2="12" y2="16"></line><line x1="9" y1="13" x2="15" y2="13"></line></svg>
            <span>+ New Case</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Cases</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{cases.length}</div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">All registered cases</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 shadow-sm border border-teal-100">
            <span className="material-symbols-outlined text-[20px]">folder_open</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Review Required</div>
            <div className="text-2xl font-bold text-amber-600 mt-1 tracking-tight">{cases.filter(c => c.status === 'Review Required').length}</div>
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
            <div className="text-2xl font-bold text-sky-600 mt-1 tracking-tight">{cases.filter(c => c.status === 'AI Processing').length}</div>
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
                <tr key={caseItem.id} className="hover:bg-teal-50/30 transition-colors cursor-pointer group" onClick={() => setSelectedCase(caseItem)}>
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
            Showing <span className="font-mono font-semibold text-slate-800">{filteredCases.length}</span> of <span className="font-mono font-semibold text-slate-800">{cases.length}</span> cases
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
        className={`fixed inset-0 bg-slate-900/40 z-[100] backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-200 ${isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
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
          <form ref={formRef} className="px-6 pb-6 pt-4 space-y-4 text-xs" onSubmit={handleCreateCase}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Patient Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Patient Selector <span className="text-rose-500">*</span></label>
                <FormSelect 
                  value={modalPatient} 
                  onChange={setModalPatient} 
                  options={patients.length > 0 ? patients : [{ value: '', label: 'Loading patients...' }]} 
                />
              </div>
              {/* Sample ID */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Sample ID (Barcode / Accession) <span className="text-rose-500">*</span></label>
                <input required readOnly className="w-full h-9 px-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono text-xs cursor-not-allowed focus:outline-none" type="text" value={modalSampleId} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Test Type Selection */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Test Specification</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 hover:text-slate-900">
                    <input 
                      checked={modalTestType === 'Blood Smear (Peripheral)'} 
                      onChange={() => setModalTestType('Blood Smear (Peripheral)')} 
                      className="accent-teal-600" name="modal_test_type" type="radio" 
                    />
                    <span>Blood Smear (Peripheral)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 hover:text-slate-900">
                    <input 
                      checked={modalTestType === 'CBC + Blood Smear'} 
                      onChange={() => setModalTestType('CBC + Blood Smear')} 
                      className="accent-teal-600" name="modal_test_type" type="radio" 
                    />
                    <span>CBC + Blood Smear</span>
                  </label>
                </div>
              </div>
              {/* Priority */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Clinical Priority</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 hover:text-slate-900">
                    <input 
                      checked={modalPriority === 'High'} 
                      onChange={() => setModalPriority('High')} 
                      className="accent-teal-600" name="modal_priority" type="radio" 
                    />
                    <span>High</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 hover:text-slate-900">
                    <input 
                      checked={modalPriority === 'Medium'} 
                      onChange={() => setModalPriority('Medium')} 
                      className="accent-teal-600" name="modal_priority" type="radio" 
                    />
                    <span>Medium</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 hover:text-slate-900">
                    <input 
                      checked={modalPriority === 'Low'} 
                      onChange={() => setModalPriority('Low')} 
                      className="accent-teal-600" name="modal_priority" type="radio" 
                    />
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
              <input 
                type="file" 
                ref={modalFileInputRef} 
                className="hidden" 
                onChange={(e) => setModalImageFile(e.target.files[0])} 
              />
              <div 
                className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => modalFileInputRef.current.click()}
              >
                {modalImageFile ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 mb-3 shadow-sm border border-teal-200">
                      <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    </div>
                    <p className="font-semibold text-teal-700">{modalImageFile.name}</p>
                    <p className="text-slate-500 mt-1">{(modalImageFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-teal-600 mb-3 shadow-sm border border-slate-200">
                      <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
                    </div>
                    <p className="font-semibold text-slate-800">
                      Drag &amp; drop specimen slide images or <span className="text-teal-600 hover:underline">browse</span>
                    </p>
                    <p className="text-slate-500 mt-1">
                      Supports TIFF, SVS, NDPI, PNG, DICOM · Minimum 100x oil immersion fields recommended
                    </p>
                  </>
                )}
              </div>
            </div>
            
            {/* Modal Actions Footer */}
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button 
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors" 
                onClick={() => setIsModalOpen(false)} 
                type="button"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                className={`px-4 py-2 rounded-lg bg-[#0d9488] hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`} 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">biotech</span>
                    <span>Submit &amp; Initiate AI Analysis</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
