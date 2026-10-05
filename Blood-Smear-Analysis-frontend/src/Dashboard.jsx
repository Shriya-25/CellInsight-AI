import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const formatWaitingTime = (timestamp) => {
  if (!timestamp) return '0 hrs';
  const diff = Date.now() - new Date(timestamp).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  return `${hours} hr${hours === 1 ? '' : 's'}`;
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return; // Don't fetch if not authenticated

      const response = await fetch(`${API_URL}/api/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 401 || response.status === 403) {
        window.dispatchEvent(new Event('cellinsight_auth_error'));
        throw new Error('Authentication expired. Please log in again.');
      }
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const jsonData = await response.json();
      setData(jsonData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not load real-time data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center h-full min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const metrics = data?.metrics || { pendingReview: 0, aiProcessing: 0, reviewed: 0, reports: 0 };
  const attentionCases = data?.attentionCases || [];
  const recentPatients = data?.recentPatients || [];
  const aiDist = data?.aiDistribution || { total: 0, normal: 0, abnormal: 0, reviewRequired: 0 };
  const recentAudit = data?.recentAudit || [];

  return (
    <div className="flex flex-col w-full">
      <div className="space-y-space-lg">
        
        {/* PAGE TITLE & HEADER BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-sm border-b border-surface-container-high">
          <div className="space-y-1">
            <div className="flex items-center gap-space-sm">
              <h1 className="font-headline-lg text-display-lg tracking-tight text-on-surface font-bold">Dashboard</h1>
              {error && <span className="text-error text-label-sm">{error}</span>}
            </div>
          </div>
        </div>

        {/* PRIMARY WORKFLOW SUMMARY (4 Metric Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow transition-all space-y-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm tracking-wider uppercase text-secondary font-medium">Pending Review</span>
              <span className="material-symbols-outlined text-[18px] text-amber-600">pending_actions</span>
            </div>
            <div className="flex items-baseline gap-1 pt-1">
              <span className="text-[32px] font-semibold text-on-surface">{metrics.pendingReview.toString().padStart(2, '0')}</span>
              <span className="text-body-sm text-secondary">cases</span>
            </div>
            <p className="text-body-sm text-secondary">Awaiting expert verification</p>
          </div>
          
          <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow transition-all space-y-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm tracking-wider uppercase text-secondary font-medium">AI Processing</span>
              <span className="material-symbols-outlined text-[18px] text-primary">memory</span>
            </div>
            <div className="flex items-baseline gap-1 pt-1">
              <span className="text-[32px] font-semibold text-on-surface">{metrics.aiProcessing.toString().padStart(2, '0')}</span>
              <span className="text-body-sm text-secondary">cases</span>
            </div>
            <p className="text-body-sm text-secondary">Awaiting AI pipeline</p>
          </div>
          
          <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow transition-all space-y-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm tracking-wider uppercase text-secondary font-medium">Reviewed</span>
              <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
            </div>
            <div className="flex items-baseline gap-1 pt-1">
              <span className="text-[32px] font-semibold text-on-surface">{metrics.reviewed.toString().padStart(2, '0')}</span>
              <span className="text-body-sm text-secondary">cases</span>
            </div>
            <p className="text-body-sm text-secondary">Reviewed & verified</p>
          </div>
          
          <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow transition-all space-y-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm tracking-wider uppercase text-secondary font-medium">Reports</span>
              <span className="material-symbols-outlined text-[18px] text-tertiary">assignment_turned_in</span>
            </div>
            <div className="flex items-baseline gap-1 pt-1">
              <span className="text-[32px] font-semibold text-on-surface">{metrics.reports.toString().padStart(2, '0')}</span>
              <span className="text-body-sm text-secondary">total</span>
            </div>
            <p className="text-body-sm text-secondary">Generated reports</p>
          </div>
        </div>

        {/* TWO-COLUMN OPERATIONAL WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          
          {/* LEFT COLUMN: OPERATIONAL PRIORITY (8 COLS) */}
          <div className="lg:col-span-8 space-y-space-lg">
            
            {/* SECTION A: CASES REQUIRING ATTENTION */}
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl overflow-hidden shadow-sm">
              <div className="p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs border-b border-surface-container-high">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Cases Requiring Attention</h2>
                  </div>
                </div>
                <a className="inline-flex items-center gap-1 text-primary hover:text-primary-container font-label-md text-label-md transition-colors font-medium" href="/review-queue">
                  <span>View Review Queue</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-secondary font-label-sm text-label-sm uppercase tracking-wider">
                      <th className="py-2.5 px-space-md font-medium">Case ID</th>
                      <th className="py-2.5 px-space-md font-medium">Patient</th>
                      <th className="py-2.5 px-space-md font-medium">Test</th>
                      <th className="py-2.5 px-space-md font-medium">AI Finding</th>
                      <th className="py-2.5 px-space-md font-medium">Confidence</th>
                      <th className="py-2.5 px-space-md font-medium">Priority</th>
                      <th className="py-2.5 px-space-md font-medium">Waiting</th>
                      <th className="py-2.5 px-space-md text-right font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high text-body-sm">
                    {attentionCases.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="py-4 text-center text-secondary">No cases currently require attention.</td>
                      </tr>
                    ) : (
                      attentionCases.map(c => (
                        <tr key={c._id} className="hover:bg-surface-container-low/40 transition-colors">
                          <td className="py-3 px-space-md font-data-mono text-primary font-medium">{c.caseId || c._id.toString().slice(-6).toUpperCase()}</td>
                          <td className="py-3 px-space-md font-medium text-on-surface">{c.subjectId?.name || 'Unknown'}</td>
                          <td className="py-3 px-space-md text-secondary">{c.test || 'Blood Smear'}</td>
                          <td className="py-3 px-space-md text-on-surface font-medium truncate max-w-[150px]" title={c.finding}>{c.finding}</td>
                          <td className="py-3 px-space-md">
                            {c.confidence != null ? (
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${Math.round(c.confidence * 100) >= 75 ? 'bg-teal-600' : c.colorType === 'warning' ? 'bg-amber-500' : 'bg-primary'}`} style={{ width: `${Math.round(c.confidence * 100)}%` }}></div>
                                </div>
                                <span className={`font-data-mono text-label-sm ${Math.round(c.confidence * 100) >= 75 ? 'text-teal-700' : c.colorType === 'warning' ? 'text-amber-700' : 'text-on-surface'}`}>{Math.round(c.confidence * 100)}%</span>
                              </div>
                            ) : (
                              <span className="text-secondary text-label-sm">N/A</span>
                            )}
                          </td>
                          <td className="py-3 px-space-md">
                            <span className={`${c.priority === 'High' ? 'text-rose-700' : c.priority === 'Medium' ? 'text-amber-700' : 'text-emerald-700'} font-medium text-label-sm`}>{c.priority || 'Medium'}</span>
                          </td>
                          <td className="py-3 px-space-md text-secondary font-data-mono text-label-sm">{formatWaitingTime(c.updatedAt || c.createdAt)}</td>
                          <td className="py-3 px-space-md text-right"><button onClick={() => window.dispatchEvent(new CustomEvent('cellinsight_navigate', { detail: { view: 'cases', openCase: c } }))} className="px-3 py-1 rounded-lg bg-primary text-on-primary hover:bg-primary-container text-label-sm font-medium transition-all" type="button">Review</button></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION B: RECENT CASES */}
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl overflow-hidden shadow-sm">
              <div className="p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs border-b border-surface-container-high">
                <div className="space-y-0.5">
                  <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Recent Cases</h2>
                </div>
                <a className="inline-flex items-center gap-1 text-primary hover:text-primary-container font-label-md text-label-md transition-colors font-medium" href="#cases">
                  <span>View All Cases</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-secondary font-label-sm text-label-sm uppercase tracking-wider">
                      <th className="py-2.5 px-space-md font-medium">Patient</th>
                      <th className="py-2.5 px-space-md font-medium">Case</th>
                      <th className="py-2.5 px-space-md font-medium">Test Type</th>
                      <th className="py-2.5 px-space-md font-medium">Status</th>
                      <th className="py-2.5 px-space-md text-right font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high text-body-sm">
                    {recentPatients.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-4 text-center text-secondary">No cases recorded recently.</td>
                      </tr>
                    ) : (
                      recentPatients.map(c => {
                        let statusColor = "text-secondary";
                        let statusLabel = c.status;
                        if (c.status === 'review_required') { statusColor = "text-amber-800"; statusLabel = "Review Required"; }
                        if (c.status === 'completed' || c.status === 'approved') { statusColor = "text-emerald-800"; statusLabel = "Verified"; }
                        if (c.status === 'draft') { statusColor = "text-indigo-800"; statusLabel = "Processing"; }

                        return (
                          <tr key={c._id} className="hover:bg-surface-container-low/40 transition-colors">
                            <td className="py-3 px-space-md font-medium text-on-surface">{c.subjectId?.name || 'Unknown'}</td>
                            <td className="py-3 px-space-md font-data-mono text-tertiary">{c.caseId || c._id.toString().slice(-6).toUpperCase()}</td>
                            <td className="py-3 px-space-md text-secondary">{c.test || 'Blood Smear'}</td>
                            <td className="py-3 px-space-md"><span className={`${statusColor} font-medium text-label-sm`}>{statusLabel}</span></td>
                            <td className="py-3 px-space-md text-right font-data-mono text-label-sm text-secondary">
                              {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>

          {/* RIGHT COLUMN: ANALYTICS & AUDIT TRAIL (4 COLS) */}
          <div className="lg:col-span-4 space-y-space-lg">
            
            {/* SECTION C: AI RESULT DISTRIBUTION */}
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md shadow-sm space-y-space-md">
              <div className="flex items-center justify-between">
                <div><h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Image Quality Distribution</h2></div>
              </div>

              <div className="flex flex-col items-center py-space-xs">
                <div className="relative w-44 h-44">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" fill="transparent" r="60" stroke="#eff4ff" strokeWidth="16"></circle>
                    {/* Simplified dynamic ring for demo purposes - proper SVG arc math requires more complex logic, 
                        so we just use static dashes scaled if total > 0. A real chart library is recommended for exact angles. */}
                    {aiDist.total > 0 ? (
                      <>
                        <circle cx="80" cy="80" fill="transparent" r="60" stroke="#00685f" strokeDasharray={`${(aiDist.normal / aiDist.total) * 377} 377`} strokeDashoffset="0" strokeWidth="16"></circle>
                        <circle cx="80" cy="80" fill="transparent" r="60" stroke="#ba1a1a" strokeDasharray={`${(aiDist.abnormal / aiDist.total) * 377} 377`} strokeDashoffset={`-${(aiDist.normal / aiDist.total) * 377}`} strokeWidth="16"></circle>
                        <circle cx="80" cy="80" fill="transparent" r="60" stroke="#d97706" strokeDasharray={`${(aiDist.reviewRequired / aiDist.total) * 377} 377`} strokeDashoffset={`-${((aiDist.normal + aiDist.abnormal) / aiDist.total) * 377}`} strokeWidth="16"></circle>
                      </>
                    ) : (
                      <circle cx="80" cy="80" fill="transparent" r="60" stroke="#e2e8f0" strokeDasharray="377 377" strokeDashoffset="0" strokeWidth="16"></circle>
                    )}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[28px] font-bold text-on-surface leading-tight font-data-mono">{aiDist.total}</span>
                    <span className="text-label-sm text-secondary font-medium">Total Images</span>
                  </div>
                </div>
                <div className="w-full mt-space-md space-y-space-xs">
                  <div className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-surface-container-low transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm bg-primary"></span>
                      <span className="font-body-sm text-on-surface">Normal / Good</span>
                    </div>
                    <div className="flex items-center gap-1 font-data-mono text-body-sm">
                      <span className="text-on-surface font-semibold">{aiDist.normal}</span>
                      <span className="text-secondary text-label-sm">({aiDist.total > 0 ? Math.round((aiDist.normal/aiDist.total)*100) : 0}%)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-surface-container-low transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm bg-error"></span>
                      <span className="font-body-sm text-on-surface">Abnormal / Flagged</span>
                    </div>
                    <div className="flex items-center gap-1 font-data-mono text-body-sm">
                      <span className="text-on-surface font-semibold">{aiDist.abnormal}</span>
                      <span className="text-secondary text-label-sm">({aiDist.total > 0 ? Math.round((aiDist.abnormal/aiDist.total)*100) : 0}%)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-surface-container-low transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm bg-amber-600"></span>
                      <span className="font-body-sm text-on-surface">Poor Quality / Review</span>
                    </div>
                    <div className="flex items-center gap-1 font-data-mono text-body-sm">
                      <span className="text-on-surface font-semibold">{aiDist.reviewRequired}</span>
                      <span className="text-secondary text-label-sm">({aiDist.total > 0 ? Math.round((aiDist.reviewRequired/aiDist.total)*100) : 0}%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* SECTION D: RECENT AUDIT ACTIVITY */}
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md shadow-sm space-y-space-md">
              <div className="flex items-center justify-between">
                <div><h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Recent Audit Activity</h2></div>
                <a className="text-primary hover:text-primary-container font-label-sm text-label-sm font-semibold transition-colors" href="#">View Logs →</a>
              </div>
              <div className="relative pl-5 space-y-space-md before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-high">
                {recentAudit.length === 0 ? (
                  <div className="text-body-sm text-secondary">No recent audit activity.</div>
                ) : (
                  recentAudit.map((audit, idx) => {
                    const colors = ['bg-primary', 'bg-secondary', 'bg-indigo-600', 'bg-amber-600', 'bg-emerald-600'];
                    const color = colors[idx % colors.length];
                    const timeString = new Date(audit.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    return (
                      <div key={audit._id} className="relative flex flex-col gap-0.5">
                        <span className={`absolute -left-5 top-1 w-2.5 h-2.5 rounded-full ${color} ring-4 ring-surface-container-lowest`}></span>
                        <span className="font-data-mono text-[11px] text-secondary">{timeString}</span>
                        <p className="text-body-sm text-on-surface">
                          {audit.performedBy ? <span className="font-medium text-primary">{audit.performedBy.name} </span> : ''}
                          {audit.details ? (typeof audit.details === 'object' ? JSON.stringify(audit.details) : audit.details) : (
                            <>{audit.action.replace(/_/g, ' ').toLowerCase()} {audit.targetResource && audit.targetResource.resourceId ? ` on ${audit.targetResource.resourceType}` : ''}</>
                          )}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
