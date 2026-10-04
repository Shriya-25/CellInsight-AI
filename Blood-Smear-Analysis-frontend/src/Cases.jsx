import React, { useState, useRef, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const formatConfidence = (val) => {
  if (val === undefined || val === null) return null;
  return Math.round(val * (val <= 1 ? 100 : 1));
};

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

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [cellsToReview, setCellsToReview] = useState([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewForm, setReviewForm] = useState({ reviewStatus: 'accepted', finalLabel: '', comment: '' });
  const [isReviewing, setIsReviewing] = useState(false);
  const [showReviewSuccessModal, setShowReviewSuccessModal] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showReportSuccessModal, setShowReportSuccessModal] = useState(false);

  const [images, setImages] = useState([]);
  const [cells, setCells] = useState([]);
  const [reports, setReports] = useState([]);

  const fetchCaseData = () => {
    if (caseData._id) {
      fetch(`${API_URL}/api/cases/${caseData._id}/analyses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setAnalyses(data))
      .catch(err => console.error(err));

      fetch(`${API_URL}/api/cases/${caseData._id}/images`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setImages(data))
      .catch(err => console.error(err));

      fetch(`${API_URL}/api/cases/${caseData._id}/cells`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setCells(data))
      .catch(err => console.error(err));

      fetch(`${API_URL}/api/reports`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
         const matchingReports = data.filter(r => r.caseId && (r.caseId === caseData.caseId || r.caseId === caseData.id || r.caseId === caseData._id || r.caseId._id === caseData._id));
         setReports(matchingReports.sort((a, b) => new Date(b.date) - new Date(a.date)));
      })
      .catch(err => console.error(err));
    }
  };

  useEffect(() => {
    fetchCaseData();
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
        fetchCaseData(); // Refresh images after upload
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
        fetchCaseData(); // Refresh analyses
      } else {
        const errText = await res.text();
        alert(`Analysis failed: ${errText}`);
      }
    } catch(err) {
      alert(`Analysis exception: ${err.message}`);
    }
  };

  const handleStartReview = async () => {
    try {
      const res = await fetch(`${API_URL}/api/cases/${caseData._id}/cells`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const rawData = await res.json();
        const data = rawData.filter(c => c.reviewPriority > 0.3 && c.reviewStatus === 'pending'); // Only review low confidence cells that are still pending
        
        if (data.length === 0) {
           alert("No cells require review.");
           window.location.reload();
           return;
        }

        setCellsToReview(data);
        setReviewIndex(0);
        const currentCell = data[0];
        setReviewForm({ 
          reviewStatus: currentCell.reviewStatus === 'pending' ? 'accepted' : currentCell.reviewStatus, 
          finalLabel: currentCell.finalLabel || currentCell.subtype || currentCell.cellType, 
          comment: currentCell.comment || '' 
        });
        setIsReviewModalOpen(true);
      } else {
        alert("Failed to fetch cells for review.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFastApprove = async () => {
    if (!window.confirm("Are you sure you want to approve all AI classifications without manual review?")) return;
    try {
      await fetch(`${API_URL}/api/cases/${caseData._id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'verified' })
      });
      setShowReviewSuccessModal(true);
    } catch (err) {
      console.error(err);
      alert("Failed to approve case.");
    }
  };

  const handleSaveCellReview = async () => {
    const currentCell = cellsToReview[reviewIndex];
    try {
      setIsReviewing(true);
      const res = await fetch(`${API_URL}/api/cells/${currentCell._id}/review`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm)
      });
      if (res.ok) {
        if (reviewIndex < cellsToReview.length - 1) {
          const nextIndex = reviewIndex + 1;
          setReviewIndex(nextIndex);
          const nextCell = cellsToReview[nextIndex];
          setReviewForm({ 
            reviewStatus: nextCell.reviewStatus === 'pending' ? 'accepted' : nextCell.reviewStatus, 
            finalLabel: nextCell.finalLabel || nextCell.subtype || nextCell.cellType, 
            comment: nextCell.comment || '' 
          });
        } else {
          // Last cell, complete the case (Backend handles case status update)
          setIsReviewModalOpen(false);
          setShowReviewSuccessModal(true);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const generatedBy = user ? (user._id || user.id) : null;

      const res = await fetch(`${API_URL}/api/reports`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: caseData._id, generatedBy })
      });
      if (res.ok) {
        fetchCaseData(); // Refetch to update reports state
        setShowReportSuccessModal(true);
      } else {
        alert("Failed to generate report.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const isAnalyzed = analyses.length > 0 && analyses[0].results;
  const computedStatus = caseData.status || (!isAnalyzed ? 'draft' : 'verified');
  const hasReviewFlags = computedStatus === 'review_required';
  
  const isManuallyReviewed = computedStatus === 'verified' && (
    analyses.some(a => a.results?.qualityStatus !== 'Good') ||
    cells.some(c => c.reviewPriority > 0.3)
  );

  const getRecentActivity = () => {
    const activities = [];

    // 1. Case Created
    if (caseData.createdAt) {
      activities.push({
        color: 'bg-blue-600',
        time: new Date(caseData.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
        timestamp: new Date(caseData.createdAt).getTime(),
        label: 'Case created'
      });
    }

    // 2. Microscopy Field Added
    images.forEach((img, index) => {
      if (img.createdAt) {
        activities.push({
          color: 'bg-slate-500',
          time: new Date(img.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
          timestamp: new Date(img.createdAt).getTime(),
          label: `Microscopy Field Added (${index + 1})`
        });
      }
    });

    // 3. AI Analysis Completed
    analyses.forEach((analysis) => {
      if (analysis.createdAt) {
        activities.push({
          color: 'bg-teal-600',
          time: new Date(analysis.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
          timestamp: new Date(analysis.createdAt).getTime(),
          label: 'AI analysis completed'
        });
      }
    });

    // 4. Expert Review Completed
    if (caseData.status === 'verified' && caseData.updatedAt && caseData.updatedAt !== caseData.createdAt) {
        activities.push({
          color: 'bg-emerald-600',
          time: new Date(caseData.updatedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
          timestamp: new Date(caseData.updatedAt).getTime(),
          label: 'Expert Review completed'
        });
    }
    
    // 5. Report Generated
    reports.forEach(report => {
      if (report.createdAt) {
        activities.push({
          color: 'bg-indigo-600',
          time: new Date(report.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
          timestamp: new Date(report.createdAt).getTime(),
          label: 'Report generated'
        });
      }
    });

    return activities.sort((a, b) => b.timestamp - a.timestamp);
  };
  
  const recentActivities = getRecentActivity();

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
          {reports.length > 0 && reports[0].status === 'CURRENT' ? (
            <button 
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition shadow-sm"
              onClick={() => window.dispatchEvent(new CustomEvent('cellinsight_navigate', { detail: { view: 'reports' } }))}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              View Report
            </button>
          ) : (
            <button 
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white rounded-lg transition shadow-sm ${!isAnalyzed ? 'bg-slate-300 cursor-not-allowed' : 'bg-teal-700 hover:bg-teal-800'}`}
              onClick={handleGenerateReport}
              disabled={!isAnalyzed || isGeneratingReport}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              {isGeneratingReport ? 'Generating...' : (reports.length > 0 ? 'Update Report' : 'Generate Report')}
            </button>
          )}
        </div>
      </section>

      {/* Patient & Case Info Banner */}
      <section className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-center">
          <div className="xl:col-span-4 flex flex-col justify-between border-b xl:border-b-0 xl:border-r border-slate-100 pr-4 pb-4 xl:pb-0">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl font-bold text-slate-900">{caseData.id}</span>
                {computedStatus === 'review_required' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-600 border border-amber-200/60">Review Required</span>
                )}
                {computedStatus === 'verified' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/60">Verified</span>
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
                <span className="font-medium text-slate-700">{caseData.patientAge} yrs / {caseData.patientGender}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Blood Group</span>
                <span className="px-1.5 py-0.5 text-[11px] font-semibold text-slate-700 bg-slate-100 rounded">{caseData.patientBlood}</span>
              </div>
            </div>
          </div>
          <div className="xl:col-span-4 flex flex-col justify-between h-full space-y-2 text-xs">
            <div className="space-y-1.5">
              <div className="flex items-start gap-2"><span className="text-slate-400 shrink-0">Contact</span><span className="font-medium text-slate-700">{caseData.patientContact}</span></div>
              <div className="flex items-start gap-2"><span className="text-slate-400 shrink-0">Address</span><span className="font-medium text-slate-700">{caseData.patientAddress}</span></div>
              <div className="flex items-start gap-2"><span className="text-slate-400 shrink-0">Clinical Notes</span><span className="font-medium text-slate-700">{caseData.patientNotes}</span></div>
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
            <div className={`h-full bg-emerald-500 transition-all duration-500 ${computedStatus === 'draft' ? 'w-[20%]' : computedStatus === 'review_required' ? 'w-[60%]' : computedStatus === 'verified' && reports.length === 0 ? 'w-[80%]' : 'w-[100%]'}`}></div>
          </div>
          {[
            { label: 'Field Upload', sub: `${images.length} fields`, done: true },
            { label: 'Quality Check', sub: 'Pending', done: computedStatus !== 'draft', active: computedStatus === 'draft' },
            { label: 'AI Analysis', sub: 'Pending', done: computedStatus !== 'draft', active: computedStatus === 'draft' },
            { label: 'Expert Review', sub: 'Pending', done: computedStatus === 'verified', active: computedStatus === 'review_required' },
            { label: 'Verification', sub: 'Pending', done: computedStatus === 'verified' },
            { label: 'Report', sub: 'Not Generated', done: reports.length > 0 },
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

      {/* Middle Content */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <article className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-teal-50 text-teal-700 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect height="18" rx="2" ry="2" width="18" x="3" y="3"></rect><circle cx="9" cy="9" r="2"></circle><path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Microscopy Fields</h3>
                  <p className="text-[11px] text-slate-400 font-medium">{images.length} / 3 fields uploaded</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2.5 my-3">
              {images.length > 0 ? images.map((img, i) => {
                const isAnalyzed = analyses.some(a => a.imageId === img._id);
                return (
                  <div key={img._id || i} className="flex flex-col items-center">
                    <div className="w-full aspect-square rounded-lg border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center relative">
                      <img src={img.filePath.startsWith('http') ? img.filePath : `${API_URL}${img.filePath}`} alt={`Field ${i+1}`} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-600 mt-1.5 truncate w-full text-center">Field {i+1}</span>
                  </div>
                );
              }) : (
                <div className="col-span-3 py-4 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  No fields uploaded yet.
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-4 h-4 rounded-full ${analyses.length === images.length && images.length > 0 ? 'bg-emerald-500' : 'bg-slate-300'} text-white flex items-center justify-center text-[10px]`}>✓</span>
              <span className="text-slate-600 font-medium">{analyses.length} of {images.length} fields analyzed</span>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleUploadImage} />
            <button onClick={() => fileInputRef.current.click()} disabled={images.length >= 3} className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium ${images.length >= 3 ? 'text-slate-400 bg-slate-100 border-slate-200 cursor-not-allowed' : 'text-teal-700 bg-white border-teal-600 hover:bg-teal-50'} border rounded-lg transition`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>
              Add Field
            </button>
            <button onClick={handleRunAnalysis} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-teal-600 border border-teal-600 rounded-lg hover:bg-teal-700 transition">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
              Run Analysis
            </button>
          </div>
        </article>

        <article className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-teal-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              <h3 className="text-sm font-bold text-slate-800">AI Analysis</h3>
            </div>
            {analyses.length > 0 && analyses[0].results ? (
              <span className="px-2 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200/60">Completed</span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-semibold text-slate-600 bg-slate-50 rounded-full border border-slate-200/60">Pending</span>
            )}
          </div>

          {analyses.length > 0 && analyses[0].results ? (
            <div className="flex-1 flex flex-col gap-4">
              <div className="space-y-1 text-xs">
                {[
                  ['Total Cells', analyses[0].results.totalCells],
                  ['RBC', analyses[0].results.rbcCount],
                  ['WBC', analyses[0].results.wbcCount],
                  ['Platelets', analyses[0].results.plateletCount]
                ].map(([k,v]) => (
                  <div key={k} className="flex justify-between py-0.5"><span className="text-slate-500 font-medium">{k}</span><span className="text-slate-900 font-bold">{v !== undefined ? v : '-'}</span></div>
                ))}
              </div>
              
              <div>
                <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">WBC Differential</h4>
                <div className="space-y-1 text-xs">
                  {analyses[0].results.wbcSubtypes && Object.entries(analyses[0].results.wbcSubtypes).map(([k,v]) => (
                    <div key={k} className="flex justify-between py-0.5"><span className="text-slate-500 font-medium capitalize">{k}</span><span className="text-slate-800 font-medium">{v}</span></div>
                  ))}
                  {(!analyses[0].results.wbcSubtypes || Object.keys(analyses[0].results.wbcSubtypes).length === 0) && (
                    <div className="text-slate-400 italic">No WBC subtypes detected</div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
                <ul className="space-y-2 text-xs">
                  {analyses[0].results.qualityReasons && analyses[0].results.qualityReasons.length > 0 ? (
                    analyses[0].results.qualityReasons.map((reason, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5"></span>
                        <span className="text-slate-600 font-medium">{reason}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5"></span>
                      <span className="text-slate-600 font-medium">Quality looks good. No major anomalies detected.</span>
                    </li>
                  )}
                </ul>

                <div className="mt-1">
                  <span className="text-xs text-slate-500 font-medium">Image Quality Score</span>
                  <div className="text-base font-bold text-slate-900 my-1">
                    {analyses[0].confidence !== undefined ? `${formatConfidence(analyses[0].confidence)}%` : 'Processing...'}
                  </div>
                  {analyses[0].confidence !== undefined && (
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-600 rounded-full" style={{width:`${formatConfidence(analyses[0].confidence)}%`}}></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs italic min-h-[200px]">
              AI analysis results will appear here once processing is complete.
            </div>
          )}
        </article>
      </section>

      {/* Bottom Grids */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        <article className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-teal-50 text-teal-700 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <h3 className="text-sm font-bold text-slate-800">Expert Review</h3>
              </div>
              {isAnalyzed ? (
                hasReviewFlags ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200/60 rounded-full">Review Required</span>
                ) : isManuallyReviewed ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200/60 rounded-full">Review Performed</span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60 rounded-full">Review Not Required</span>
                )
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-200/60 rounded-full">Pending</span>
              )}
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Status</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  !isAnalyzed ? 'bg-slate-50 text-slate-500' : 
                  hasReviewFlags ? 'bg-amber-50 text-amber-600' : 
                  isManuallyReviewed ? 'bg-blue-50 text-blue-600' : 
                  'bg-emerald-50 text-emerald-600'
                }`}>
                  {!isAnalyzed ? 'Pending Analysis' : hasReviewFlags ? 'Review Required' : isManuallyReviewed ? 'Review Completed' : 'Review Not Required'}
                </span>
              </div>
              <div className="flex items-center gap-2"><span className="text-slate-400">Reviewer</span><span className="text-slate-700">{isManuallyReviewed ? 'Expert Pathologist' : 'Not Assigned'}</span></div>
              <div className="flex items-start gap-2"><span className="text-slate-400 shrink-0">Notes</span><span className="text-slate-600">{!isAnalyzed ? 'Awaiting AI analysis.' : hasReviewFlags ? 'Manual verification of flagged cells needed.' : isManuallyReviewed ? 'Manual verification completed.' : 'No AI flags detected.'}</span></div>
            </div>
          </div>
          <div className="pt-4 flex gap-2">
            <button 
              className={`w-full inline-flex items-center justify-center gap-1.5 px-2 py-2 text-[11px] font-semibold rounded-lg transition shadow-sm ${(!isAnalyzed || !hasReviewFlags) ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'text-white bg-teal-700 hover:bg-teal-800'}`}
              onClick={handleStartReview}
              disabled={!isAnalyzed || !hasReviewFlags}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>
              Review Flags
            </button>
            <button 
              className={`w-full inline-flex items-center justify-center gap-1.5 px-2 py-2 text-[11px] font-semibold rounded-lg transition shadow-sm ${(!isAnalyzed || !hasReviewFlags) ? 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed' : 'text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200'}`}
              onClick={handleFastApprove}
              disabled={!isAnalyzed || !hasReviewFlags}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"></path></svg>
              Fast Approve
            </button>
          </div>
        </article>

        <article className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-teal-50 text-teal-700 flex items-center justify-center">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              </div>
              <h3 className="text-sm font-bold text-slate-800">Reports</h3>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-slate-400">Latest Report</span><span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${reports.length > 0 ? (reports[0].status === 'OUTDATED' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600') : 'bg-slate-100 text-slate-500'}`}>{reports.length > 0 ? (reports[0].status === 'OUTDATED' ? 'Outdated' : 'Current') : 'Not Generated'}</span></div>
              <div className="flex items-center gap-2"><span className="text-slate-400">Version</span><span className="text-slate-700">{reports.length > 0 ? (reports[0].version || 'v1') : '—'}</span></div>
              <div className="flex items-center gap-2"><span className="text-slate-400">Generated On</span><span className="text-slate-700">{reports.length > 0 ? reports[0].date : '—'}</span></div>
            </div>
          </div>
          <div className="pt-4">
            {reports.length > 0 && reports[0].status === 'CURRENT' ? (
              <button 
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 rounded-lg transition shadow-sm"
                onClick={() => window.dispatchEvent(new CustomEvent('cellinsight_navigate', { detail: { view: 'reports' } }))}
              >
                <svg className="w-3.5 h-3.5 text-teal-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                View Report
              </button>
            ) : (
              <button 
                className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition shadow-sm ${!isAnalyzed ? 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed' : 'text-slate-600 bg-slate-100/80 hover:bg-slate-200 border border-slate-200/80'}`}
                onClick={handleGenerateReport}
                disabled={!isAnalyzed || isGeneratingReport}
              >
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                {isGeneratingReport ? 'Generating...' : (reports.length > 0 ? 'Update Report' : 'Generate Report')}
              </button>
            )}
          </div>
        </article>
      </section>

      <section>
        <article className="w-full bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col">
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
            {recentActivities.length > 0 ? recentActivities.map((item, i) => (
              <div key={i} className="relative flex items-start gap-3 pl-0 text-xs">
                <span className={`w-2.5 h-2.5 rounded-full ${item.color} ring-2 ring-white shrink-0 mt-1 z-10`}></span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-1">
                  <span className="text-slate-500 font-medium">{item.time}</span>
                  <span className="text-slate-800 font-semibold">{item.label}</span>
                </div>
              </div>
            )) : (
              <div className="text-xs text-slate-400 pl-4 py-2 italic">No recent activity</div>
            )}
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

      {/* Review Success Modal */}
      {showReviewSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Review Completed</h3>
              <p className="text-sm text-slate-600">
                The manual review for case <span className="font-semibold">{caseData.id || caseData.caseId}</span> has been successfully saved.
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center">
              <button 
                onClick={() => {
                  setShowReviewSuccessModal(false);
                  window.location.reload();
                }}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Success Modal */}
      {showReportSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Report Generated</h3>
              <p className="text-sm text-slate-600">
                The clinical report for case <span className="font-semibold">{caseData.id}</span> has been successfully generated.
              </p>
              {reports.length > 0 && (
                <div className="mt-3 py-2 px-3 bg-slate-50 border border-slate-100 rounded-lg text-xs flex justify-between items-center text-slate-600">
                  <span className="font-medium">Version Created:</span>
                  <span className="font-mono font-bold text-slate-800">{reports[0].version || 'v1'}</span>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
              <button 
                onClick={() => setShowReportSuccessModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setShowReportSuccessModal(false);
                  window.dispatchEvent(new CustomEvent('cellinsight_navigate', { detail: { view: 'reports' } }));
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-sm"
              >
                View Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cell Review Modal */}
      {isReviewModalOpen && cellsToReview.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex items-center gap-3 text-teal-700 mb-4">
                <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">rate_review</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Review Cells ({reviewIndex + 1}/{cellsToReview.length})</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-500">AI Classification:</span>
                    <span className="font-semibold text-slate-800">{cellsToReview[reviewIndex].cellType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Confidence:</span>
                    <span className="font-semibold text-slate-800">{cellsToReview[reviewIndex].confidence ? cellsToReview[reviewIndex].confidence.toFixed(2) : '-'}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Review Decision</label>
                  <select 
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={reviewForm.reviewStatus}
                    onChange={(e) => setReviewForm({ ...reviewForm, reviewStatus: e.target.value })}
                  >
                    <option value="accepted">Accept AI Result</option>
                    <option value="reclassified">Reclassify</option>
                    <option value="unknown">Mark as Unknown</option>
                  </select>
                </div>

                {reviewForm.reviewStatus === 'reclassified' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Correct Label</label>
                    <input 
                      type="text" 
                      className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={reviewForm.finalLabel}
                      onChange={(e) => setReviewForm({ ...reviewForm, finalLabel: e.target.value })}
                      placeholder="e.g. Neutrophil, Blast..."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Comment (Optional)</label>
                  <textarea 
                    className="w-full p-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
                    rows="2"
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="Add a reviewer note..."
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button 
                onClick={() => setIsReviewModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                disabled={isReviewing}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveCellReview}
                disabled={isReviewing}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-70"
              >
                {isReviewing ? 'Saving...' : (reviewIndex === cellsToReview.length - 1 ? 'Save & Complete' : 'Save & Next')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default function Cases({ initialCase, newCasePatientId }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [testFilter, setTestFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, testFilter, priorityFilter]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPatient, setModalPatient] = useState('');
  const [modalTestType, setModalTestType] = useState('Blood Smear (Peripheral)');
  const [modalPriority, setModalPriority] = useState('Medium');
  const [modalSampleId, setModalSampleId] = useState('');
  const [modalImageFile, setModalImageFile] = useState(null);
  const [selectedCase, setSelectedCase] = useState(initialCase?.id ? initialCase : null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdCaseId, setCreatedCaseId] = useState(null);
  const formRef = useRef(null);
  const modalFileInputRef = useRef(null);

  const handleOpenModal = () => {
    setModalSampleId('Auto-generated');
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
          patientAge: c.subjectId?.demographics?.age || '-',
          patientGender: c.subjectId?.demographics?.gender || '-',
          patientBlood: c.subjectId?.demographics?.blood || '-',
          patientContact: c.subjectId?.contact || '-',
          patientAddress: c.subjectId?.address || '-',
          patientNotes: c.notes || '-',
          test: c.test || 'Blood Smear',
          date: new Date(c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          finding: c.finding || '-',
          confidence: formatConfidence(c.confidence),
          status: c.status,
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
    if (initialCase) {
      if (initialCase.id) {
        setSelectedCase(initialCase);
      } else {
        const matchingCase = cases.find(c => c._id === initialCase._id);
        if (matchingCase) {
          setSelectedCase(matchingCase);
        }
      }
    }
  }, [initialCase, cases]);
  useEffect(() => {
    if (newCasePatientId && !loading && patients.length > 0) {
      setModalSampleId('Auto-generated');
      setModalPatient(newCasePatientId);
      setModalTestType('Blood Smear (Peripheral)');
      setModalPriority('Medium');
      setModalImageFile(null);
      if (formRef.current) formRef.current.reset();
      setIsModalOpen(true);
    }
  }, [newCasePatientId, loading, patients.length]);

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
      setCreatedCaseId(newCase._id);
      setShowSuccessModal(true);
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

  const totalPages = Math.max(1, Math.ceil(filteredCases.length / itemsPerPage));
  const currentItems = filteredCases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
            <div className="text-2xl font-bold text-amber-600 mt-1 tracking-tight">{cases.filter(c => c.status === 'review_required').length}</div>
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
            <div className="text-2xl font-bold text-sky-600 mt-1 tracking-tight">{cases.filter(c => c.status === 'draft').length}</div>
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
                { value: 'draft', label: 'AI Processing' },
                { value: 'review_required', label: 'Review Required' },
                { value: 'verified', label: 'Verified' }
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
              {currentItems.map(caseItem => (
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
                          <div className={`h-full ${caseItem.confidence >= 75 ? 'bg-teal-600' : caseItem.colorType === 'error' ? 'bg-teal-600' : caseItem.colorType === 'success' ? 'bg-emerald-500' : caseItem.colorType === 'warning' ? 'bg-amber-500' : 'bg-teal-600'}`} style={{ width: `${caseItem.confidence}%` }}></div>
                        </div>
                      </div>
                    ) : (
                      <span className="font-mono text-[11px] text-slate-400 tracking-widest">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {caseItem.status === 'review_required' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60"><span className="material-symbols-outlined text-[12px]">schedule</span>Review Required</span>
                    )}
                    {caseItem.status === 'verified' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60"><span className="material-symbols-outlined text-[12px]">check_circle</span>Verified</span>
                    )}
                    {caseItem.status === 'draft' && (
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
            Showing <span className="font-mono font-semibold text-slate-800">{currentItems.length}</span> of <span className="font-mono font-semibold text-slate-800">{filteredCases.length}</span> cases
          </div>
          <div className="flex items-center gap-2">
            <button 
              className={`px-2.5 py-1 bg-white border border-slate-200 rounded text-xs font-medium transition-colors ${currentPage === 1 ? 'text-slate-400 cursor-not-allowed' : 'text-slate-700 hover:bg-slate-50'}`}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              Previous
            </button>
            <span className="px-2 font-mono text-xs text-slate-700">Page {currentPage} of {totalPages}</span>
            <button 
              className={`px-2.5 py-1 bg-white border border-slate-200 rounded text-xs font-medium transition-colors ${currentPage === totalPages ? 'text-slate-400 cursor-not-allowed' : 'text-slate-700 hover:bg-slate-50'}`}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Next
            </button>
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
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Microscopy Field (Required)</label>
              <input 
                type="file" 
                ref={modalFileInputRef} 
                className="hidden" 
                required
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
                      Drag &amp; drop microscopy field image or <span className="text-teal-600 hover:underline">browse</span>
                    </p>
                    <p className="text-slate-500 mt-1">
                      Supports PNG, JPG, JPEG · Minimum 100x oil immersion recommended
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

      {/* Creation Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-[110] backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowSuccessModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <span className="material-symbols-outlined text-[24px]">check_circle</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Case Created</h3>
            <p className="text-sm text-slate-600 mb-6">
              The case was successfully created and the AI analysis has been initiated.
            </p>
            <div className="flex items-center gap-3 w-full">
              <button 
                className="flex-1 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
                onClick={() => setShowSuccessModal(false)}
              >
                Close
              </button>
              <button 
                className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                onClick={() => {
                  setShowSuccessModal(false);
                  const caseToSelect = cases.find(c => c._id === createdCaseId);
                  if (caseToSelect) {
                    setSelectedCase(caseToSelect);
                  } else {
                    // Fallback if not in current local state yet
                    fetch(`${API_URL}/api/cases`, { headers: { 'Authorization': `Bearer ${token}` } })
                      .then(res => res.json())
                      .then(data => {
                        const newC = data.find(c => c._id === createdCaseId);
                        if (newC) {
                          setSelectedCase({
                            _id: newC._id,
                            id: newC.caseId || newC._id.slice(-6).toUpperCase(),
                            patient: newC.subjectId?.name || 'Unknown',
                            patientId: newC.subjectId?.patientIdentifier || '-',
                            test: newC.test || 'Blood Smear',
                            status: newC.status,
                            priority: newC.priority || 'Medium'
                          });
                        }
                      });
                  }
                }}
              >
                View Case
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
