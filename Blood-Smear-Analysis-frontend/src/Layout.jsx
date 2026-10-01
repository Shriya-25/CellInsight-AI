import React, { useState, useEffect } from 'react';
import logoImg from './assets/logo.png';

export default function Layout({ children, currentView, onNavigate, user, onLogout }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) { console.error(e); }
  };

  const markNotificationsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await fetch(`${API_URL}/api/notifications/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (e) { console.error(e); }
  };

  const toggleNotifications = () => {
    if (!showDropdown) {
      markNotificationsRead();
    }
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {
    fetchNotifications();
    const notifTimer = setInterval(fetchNotifications, 30000);
    return () => clearInterval(notifTimer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).replace(/, /g, ' · ');

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen">
      <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-lowest z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="h-16 px-gutter-lg flex items-center gap-space-md">
            <img 
              alt="CellInsight Lab Logo" 
              className="h-8 w-8 object-contain rounded-lg" 
              src={logoImg} 
            />
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface leading-none font-semibold">CellInsight Lab</span>
              <span className="font-label-sm text-label-sm text-secondary mt-space-xs">AI Blood Smear Analysis</span>
            </div>
          </div>
          
          <div className="px-gutter-lg py-1">
            <div className="h-px bg-surface-container-high w-full"></div>
          </div>
          
          <nav className="px-space-md space-y-space-md flex-1 py-space-md">
            <div>
              <div className="px-space-md py-space-xs font-label-sm text-label-sm uppercase tracking-wider text-outline font-medium">Overview</div>
              <div className="mt-space-xs space-y-0.5">
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }}
                  className={`flex items-center justify-between px-space-md py-2 transition-colors rounded-xl ${currentView === 'dashboard' ? 'bg-primary-container text-on-primary-container font-semibold' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}
                >
                  <div className="flex items-center gap-space-md">
                    <span className="material-symbols-outlined text-[18px]">grid_view</span>
                    <span className="font-body-md text-body-md">Dashboard</span>
                  </div>
                </a>
              </div>
            </div>
            
            <div>
              <div className="px-space-md py-space-xs font-label-sm text-label-sm uppercase tracking-wider text-outline font-medium">Case Management</div>
              <div className="mt-space-xs space-y-0.5">
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); onNavigate('patients'); }}
                  className={`flex items-center justify-between px-space-md py-2 transition-colors rounded-xl ${currentView === 'patients' ? 'bg-primary-container text-on-primary-container font-semibold' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}
                >
                  <div className="flex items-center gap-space-md">
                    <span className="material-symbols-outlined text-[18px]">groups</span>
                    <span className="font-body-md text-body-md">Patients</span>
                  </div>
                </a>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); onNavigate('cases'); }}
                  className={`flex items-center justify-between px-space-md py-2 transition-colors rounded-xl ${currentView === 'cases' ? 'bg-primary-container text-on-primary-container font-semibold' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}
                >
                  <div className="flex items-center gap-space-md">
                    <span className="material-symbols-outlined text-[18px]">folder_shared</span>
                    <span className="font-body-md text-body-md">Cases</span>
                  </div>
                </a>
              </div>
            </div>
            
            <div>
              <div className="px-space-md py-space-xs font-label-sm text-label-sm uppercase tracking-wider text-outline font-medium">Reporting</div>
              <div className="mt-space-xs space-y-0.5">
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); onNavigate('reports'); }}
                  className={`flex items-center justify-between px-space-md py-2 transition-colors rounded-xl ${currentView === 'reports' ? 'bg-primary-container text-on-primary-container font-semibold' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}
                >
                  <div className="flex items-center gap-space-md">
                    <span className="material-symbols-outlined text-[18px]">description</span>
                    <span className="font-body-md text-body-md">Reports</span>
                  </div>
                </a>
              </div>
            </div>

          </nav>
        </div>
        
        <div className="p-space-md border-t border-surface-container-high">
          <div
            className="flex items-center gap-space-md mb-space-sm cursor-pointer hover:bg-surface-container rounded-xl px-space-sm py-space-xs transition-colors"
            onClick={() => onNavigate('profile')}
            role="button"
            tabIndex={0}
          >
            <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center shrink-0 border border-teal-100">
              SK
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-headline-sm text-body-sm font-semibold text-on-surface truncate">Dr. Shriya Kulkarni</span>
              <span className="font-label-sm text-label-sm text-secondary truncate">Pathologist</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <a 
              href="#"
              onClick={(e) => { e.preventDefault(); onNavigate('settings'); }}
              className={`flex items-center gap-space-md px-space-md py-2 rounded-xl font-body-md text-body-md transition-colors w-full ${currentView === 'settings' ? 'bg-primary-container text-on-primary-container font-semibold' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}
            >
              <span className="material-symbols-outlined text-[18px]">settings</span>
              <span>Settings</span>
            </a>
            <button onClick={onLogout} className="flex items-center gap-space-md px-space-md py-2 rounded-xl text-secondary hover:bg-surface-container hover:text-error font-body-md text-body-md transition-colors w-full">
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
      
      <div className="pl-72">
        <header className="fixed top-0 left-72 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-gutter-lg">
          <div className="flex items-center gap-space-lg">
            <div className="relative flex items-center w-80">
              <span className="material-symbols-outlined absolute left-space-md text-outline text-[18px]">search</span>
              <input 
                className="w-full h-9 pl-9 pr-space-md bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-xl outline-none placeholder:text-outline focus:bg-surface-container-lowest transition-all" 
                placeholder="Search patients, cases, reports..." 
                type="text" 
              />
            </div>
          </div>
          <div className="flex items-center gap-space-md relative">
            <button 
              className="relative p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-full transition-colors" 
              type="button"
              onClick={toggleNotifications}
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {notifications.some(n => !n.isRead) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
              )}
            </button>
            
            {showDropdown && (
              <div className="absolute top-10 right-32 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
                <div className="p-3 border-b border-slate-100 bg-slate-50 font-bold text-sm text-slate-800 flex justify-between items-center">
                  <span>Notifications</span>
                  <button onClick={() => setShowDropdown(false)} className="text-slate-400 hover:text-slate-600">
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <div key={n._id} className={`p-3 border-b border-slate-100 hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-slate-50/50' : ''}`}>
                        <div className="text-xs text-slate-800">{n.message}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleTimeString()}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-xs text-slate-500 text-center">No notifications yet.</div>
                  )}
                </div>
              </div>
            )}
            <span className="text-body-sm text-secondary font-medium">{formattedTime}</span>
          </div>
        </header>
        
        <main className="w-full pt-16 bg-surface min-h-screen px-gutter-lg py-gutter-lg">
          {children}
        </main>
      </div>
    </div>
  );
}
