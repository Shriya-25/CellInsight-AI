import React from 'react';

export default function Dashboard() {
  return (
    <div className="flex flex-col w-full">
      <div className="space-y-space-lg">
        
        {/* PAGE TITLE & HEADER BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-sm border-b border-surface-container-high">
          <div className="space-y-1">
            <div className="flex items-center gap-space-sm">
              <h1 className="font-headline-lg text-display-lg tracking-tight text-on-surface font-bold">Dashboard</h1>
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
              <span className="text-[32px] font-semibold text-on-surface">12</span>
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
              <span className="text-[32px] font-semibold text-on-surface">04</span>
              <span className="text-body-sm text-secondary">slides</span>
            </div>
            <p className="text-body-sm text-secondary">Images currently in pipeline</p>
          </div>
          
          <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow transition-all space-y-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm tracking-wider uppercase text-secondary font-medium">Reviewed</span>
              <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
            </div>
            <div className="flex items-baseline gap-1 pt-1">
              <span className="text-[32px] font-semibold text-on-surface">28</span>
              <span className="text-body-sm text-secondary">completed</span>
            </div>
            <p className="text-body-sm text-secondary">Reviewed & verified today</p>
          </div>
          
          <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow transition-all space-y-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm tracking-wider uppercase text-secondary font-medium">Reports</span>
              <span className="material-symbols-outlined text-[18px] text-tertiary">assignment_turned_in</span>
            </div>
            <div className="flex items-baseline gap-1 pt-1">
              <span className="text-[32px] font-semibold text-on-surface">06</span>
              <span className="text-body-sm text-secondary">drafts</span>
            </div>
            <p className="text-body-sm text-secondary">Awaiting final sign-off</p>
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
                <a className="inline-flex items-center gap-1 text-primary hover:text-primary-container font-label-md text-label-md transition-colors font-medium" href="#">
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
                    <tr className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="py-3 px-space-md font-data-mono text-primary font-medium">CS-1024</td>
                      <td className="py-3 px-space-md font-medium text-on-surface">Rahul Mehta</td>
                      <td className="py-3 px-space-md text-secondary">CBC + Blood Smear</td>
                      <td className="py-3 px-space-md text-on-surface font-medium">Abnormal cell pattern</td>
                      <td className="py-3 px-space-md">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: '94.6%' }}></div>
                          </div>
                          <span className="font-data-mono text-label-sm text-on-surface">94.6%</span>
                        </div>
                      </td>
                      <td className="py-3 px-space-md"><span className="text-rose-700 font-medium text-label-sm">High</span></td>
                      <td className="py-3 px-space-md text-secondary font-data-mono text-label-sm">2h 14m</td>
                      <td className="py-3 px-space-md text-right"><button className="px-3 py-1 rounded-lg bg-primary text-on-primary hover:bg-primary-container text-label-sm font-medium transition-all" type="button">Review</button></td>
                    </tr>
                    <tr className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="py-3 px-space-md font-data-mono text-primary font-medium">CS-1021</td>
                      <td className="py-3 px-space-md font-medium text-on-surface">Priya Shah</td>
                      <td className="py-3 px-space-md text-secondary">Blood Smear</td>
                      <td className="py-3 px-space-md text-on-surface font-medium">Low-confidence class</td>
                      <td className="py-3 px-space-md">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: '72.4%' }}></div>
                          </div>
                          <span className="font-data-mono text-label-sm text-amber-700">72.4%</span>
                        </div>
                      </td>
                      <td className="py-3 px-space-md"><span className="text-amber-700 font-medium text-label-sm">Medium</span></td>
                      <td className="py-3 px-space-md text-secondary font-data-mono text-label-sm">1h 42m</td>
                      <td className="py-3 px-space-md text-right"><button className="px-3 py-1 rounded-lg bg-primary text-on-primary hover:bg-primary-container text-label-sm font-medium transition-all" type="button">Review</button></td>
                    </tr>
                    <tr className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="py-3 px-space-md font-data-mono text-primary font-medium">CS-1018</td>
                      <td className="py-3 px-space-md font-medium text-on-surface">Neha Kulkarni</td>
                      <td className="py-3 px-space-md text-secondary">CBC + Blood Smear</td>
                      <td className="py-3 px-space-md text-on-surface font-medium">Possible cell anomaly</td>
                      <td className="py-3 px-space-md">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: '88.1%' }}></div>
                          </div>
                          <span className="font-data-mono text-label-sm text-on-surface">88.1%</span>
                        </div>
                      </td>
                      <td className="py-3 px-space-md"><span className="text-rose-700 font-medium text-label-sm">High</span></td>
                      <td className="py-3 px-space-md text-secondary font-data-mono text-label-sm">48m</td>
                      <td className="py-3 px-space-md text-right"><button className="px-3 py-1 rounded-lg bg-primary text-on-primary hover:bg-primary-container text-label-sm font-medium transition-all" type="button">Review</button></td>
                    </tr>
                    <tr className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="py-3 px-space-md font-data-mono text-primary font-medium">CS-1015</td>
                      <td className="py-3 px-space-md font-medium text-on-surface">Arjun Nair</td>
                      <td className="py-3 px-space-md text-secondary">Blood Smear</td>
                      <td className="py-3 px-space-md text-on-surface font-medium">Atypical lymphocyte morph.</td>
                      <td className="py-3 px-space-md">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: '81.3%' }}></div>
                          </div>
                          <span className="font-data-mono text-label-sm text-on-surface">81.3%</span>
                        </div>
                      </td>
                      <td className="py-3 px-space-md"><span className="text-amber-700 font-medium text-label-sm">Medium</span></td>
                      <td className="py-3 px-space-md text-secondary font-data-mono text-label-sm">35m</td>
                      <td className="py-3 px-space-md text-right"><button className="px-3 py-1 rounded-lg bg-primary text-on-primary hover:bg-primary-container text-label-sm font-medium transition-all" type="button">Review</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION B: TODAY'S PATIENTS */}
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl overflow-hidden shadow-sm">
              <div className="p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs border-b border-surface-container-high">
                <div className="space-y-0.5">
                  <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Today's Patients</h2>
                </div>
                <a className="inline-flex items-center gap-1 text-primary hover:text-primary-container font-label-md text-label-md transition-colors font-medium" href="#">
                  <span>View All Patients</span>
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
                    <tr className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="py-3 px-space-md font-medium text-on-surface">Rahul Mehta</td>
                      <td className="py-3 px-space-md font-data-mono text-tertiary">CS-1024</td>
                      <td className="py-3 px-space-md text-secondary">CBC + Blood Smear</td>
                      <td className="py-3 px-space-md"><span className="text-amber-800 font-medium text-label-sm">Review Required</span></td>
                      <td className="py-3 px-space-md text-right font-data-mono text-label-sm text-secondary">10:42 AM</td>
                    </tr>
                    <tr className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="py-3 px-space-md font-medium text-on-surface">Anita Shah</td>
                      <td className="py-3 px-space-md font-data-mono text-tertiary">CS-1023</td>
                      <td className="py-3 px-space-md text-secondary">Blood Smear</td>
                      <td className="py-3 px-space-md"><span className="text-emerald-800 font-medium text-label-sm">Verified</span></td>
                      <td className="py-3 px-space-md text-right font-data-mono text-label-sm text-secondary">10:15 AM</td>
                    </tr>
                    <tr className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="py-3 px-space-md font-medium text-on-surface">Rohan Patil</td>
                      <td className="py-3 px-space-md font-data-mono text-tertiary">CS-1022</td>
                      <td className="py-3 px-space-md text-secondary">Blood Smear</td>
                      <td className="py-3 px-space-md"><span className="text-indigo-800 font-medium text-label-sm">AI Processing</span></td>
                      <td className="py-3 px-space-md text-right font-data-mono text-label-sm text-secondary">09:48 AM</td>
                    </tr>
                    <tr className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="py-3 px-space-md font-medium text-on-surface">Sneha Kulkarni</td>
                      <td className="py-3 px-space-md font-data-mono text-tertiary">CS-1021</td>
                      <td className="py-3 px-space-md text-secondary">CBC + Blood Smear</td>
                      <td className="py-3 px-space-md"><span className="text-amber-800 font-medium text-label-sm">Review Required</span></td>
                      <td className="py-3 px-space-md text-right font-data-mono text-label-sm text-secondary">09:20 AM</td>
                    </tr>
                    <tr className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="py-3 px-space-md font-medium text-on-surface">Vikram Sen</td>
                      <td className="py-3 px-space-md font-data-mono text-tertiary">CS-1020</td>
                      <td className="py-3 px-space-md text-secondary">Peripheral Smear</td>
                      <td className="py-3 px-space-md"><span className="text-emerald-800 font-medium text-label-sm">Verified</span></td>
                      <td className="py-3 px-space-md text-right font-data-mono text-label-sm text-secondary">08:55 AM</td>
                    </tr>
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
                <div><h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">AI Result Distribution</h2></div>
              </div>
              <div className="flex w-full p-1 rounded-xl bg-surface-container-low">
                <button className="flex-1 py-1 text-center font-label-sm text-label-sm text-secondary hover:text-on-surface rounded-lg transition-all font-medium" type="button">Today</button>
                <button className="flex-1 py-1 text-center font-label-sm text-label-sm bg-surface-container-lowest text-primary font-semibold rounded-lg shadow-sm transition-all" type="button">This Week</button>
                <button className="flex-1 py-1 text-center font-label-sm text-label-sm text-secondary hover:text-on-surface rounded-lg transition-all font-medium" type="button">This Month</button>
              </div>
              <div className="flex flex-col items-center py-space-xs">
                <div className="relative w-44 h-44">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" fill="transparent" r="60" stroke="#eff4ff" strokeWidth="16"></circle>
                    <circle cx="80" cy="80" fill="transparent" r="60" stroke="#00685f" strokeDasharray="233.7 377" strokeDashoffset="0" strokeWidth="16"></circle>
                    <circle cx="80" cy="80" fill="transparent" r="60" stroke="#ba1a1a" strokeDasharray="90.5 377" strokeDashoffset="-233.7" strokeWidth="16"></circle>
                    <circle cx="80" cy="80" fill="transparent" r="60" stroke="#d97706" strokeDasharray="52.8 377" strokeDashoffset="-324.2" strokeWidth="16"></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[28px] font-bold text-on-surface leading-tight font-data-mono">342</span>
                    <span className="text-label-sm text-secondary font-medium">Total Slides</span>
                  </div>
                </div>
                <div className="w-full mt-space-md space-y-space-xs">
                  <div className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-surface-container-low transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm bg-primary"></span>
                      <span className="font-body-sm text-on-surface">Normal / No Flag</span>
                    </div>
                    <div className="flex items-center gap-1 font-data-mono text-body-sm">
                      <span className="text-on-surface font-semibold">212</span>
                      <span className="text-secondary text-label-sm">(62%)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-surface-container-low transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm bg-error"></span>
                      <span className="font-body-sm text-on-surface">Abnormal / Flagged</span>
                    </div>
                    <div className="flex items-center gap-1 font-data-mono text-body-sm">
                      <span className="text-on-surface font-semibold">82</span>
                      <span className="text-secondary text-label-sm">(24%)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-surface-container-low transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm bg-amber-600"></span>
                      <span className="font-body-sm text-on-surface">Requires Review</span>
                    </div>
                    <div className="flex items-center gap-1 font-data-mono text-body-sm">
                      <span className="text-on-surface font-semibold">48</span>
                      <span className="text-secondary text-label-sm">(14%)</span>
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
                <div className="relative flex flex-col gap-0.5">
                  <span className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-surface-container-lowest"></span>
                  <span className="font-data-mono text-[11px] text-secondary">10:42 AM</span>
                  <p className="text-body-sm text-on-surface"><span className="font-medium text-primary">Dr. Evelyn Vance</span> reviewed Case <span className="font-data-mono font-medium">CS-1024</span></p>
                </div>
                <div className="relative flex flex-col gap-0.5">
                  <span className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-secondary ring-4 ring-surface-container-lowest"></span>
                  <span className="font-data-mono text-[11px] text-secondary">10:35 AM</span>
                  <p className="text-body-sm text-on-surface">Technician uploaded smear image for <span className="font-data-mono font-medium text-tertiary">CS-1025</span></p>
                </div>
                <div className="relative flex flex-col gap-0.5">
                  <span className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-surface-container-lowest"></span>
                  <span className="font-data-mono text-[11px] text-secondary">10:31 AM</span>
                  <p className="text-body-sm text-on-surface">CellInsight AI completed morphology analysis for <span className="font-data-mono font-medium text-tertiary">CS-1025</span></p>
                </div>
                <div className="relative flex flex-col gap-0.5">
                  <span className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-surface-container-lowest"></span>
                  <span className="font-data-mono text-[11px] text-secondary">10:18 AM</span>
                  <p className="text-body-sm text-on-surface"><span className="font-medium text-primary">Dr. Evelyn Vance</span> finalized report for <span className="font-data-mono font-medium">CS-1021</span></p>
                </div>
                <div className="relative flex flex-col gap-0.5">
                  <span className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-secondary ring-4 ring-surface-container-lowest"></span>
                  <span className="font-data-mono text-[11px] text-secondary">10:05 AM</span>
                  <p className="text-body-sm text-on-surface">Technician created Case <span className="font-data-mono font-medium text-tertiary">CS-1026</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
