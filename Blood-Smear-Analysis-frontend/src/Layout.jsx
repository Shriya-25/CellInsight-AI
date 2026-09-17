import React, { useState, useEffect } from 'react';
import logoImg from './assets/logo.png';

export default function Layout({ children, currentView, onNavigate, user, onLogout }) {
  const [currentTime, setCurrentTime] = useState(new Date());

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
              <div className="px-space-md py-space-xs font-label-sm text-label-sm uppercase tracking-wider text-outline font-medium">Analysis</div>
              <div className="mt-space-xs space-y-0.5">
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); onNavigate('image-analysis'); }}
                  className={`flex items-center justify-between px-space-md py-2 transition-colors rounded-xl ${currentView === 'image-analysis' ? 'bg-primary-container text-on-primary-container font-semibold' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}
                >
                  <div className="flex items-center gap-space-md">
                    <span className="material-symbols-outlined text-[18px]">biotech</span>
                    <span className="font-body-md text-body-md">Image Analysis</span>
                  </div>
                </a>
                <a href="#" className="flex items-center justify-between px-space-md py-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">
                  <div className="flex items-center gap-space-md">
                    <span className="material-symbols-outlined text-[18px]">fact_check</span>
                    <span className="font-body-md text-body-md">Review Queue</span>
                  </div>
                </a>
              </div>
            </div>
            
            <div>
              <div className="px-space-md py-space-xs font-label-sm text-label-sm uppercase tracking-wider text-outline font-medium">Reporting</div>
              <div className="mt-space-xs space-y-0.5">
                <a href="#" className="flex items-center justify-between px-space-md py-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">
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
          <div className="flex items-center gap-space-md mb-space-sm">
            <img 
              alt={user?.name || "Dr. Evelyn Vance"} 
              className="w-9 h-9 rounded-full object-cover bg-surface-container" 
              src="https://lh3.googleusercontent.com/aida/AEtjO1VW63dPq8n7prItvQD-s-sT2XEb8Y1XbY6K7k56wpAnP32L5sungA2pZ_hcnRRQuHkfWnDu-Zj8ROxcJczDMir-Vwm-IOCyWnMfuVh2Vw1IqU1EGm_O39ahelJXN0zLe9P9XFcRdhv1w6pbVZ1Jj6vQVbGvWwYHmuRDqX1gXILoUX2WmQkNf9QO6agOGRO-4iDFZBSMzcvDtQJzYzzgyBYpmAl0OhAD8wvCgEa75N6bZTqh9h41LSgcUCA" 
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-headline-sm text-body-sm font-semibold text-on-surface truncate">{user?.name || "Dr. Evelyn Vance"}</span>
              <span className="font-label-sm text-label-sm text-secondary truncate">{user?.role || "Pathologist / Lab Dir"}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <a href="#" className="flex items-center gap-space-md px-space-md py-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-body-md text-body-md transition-colors w-full">
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
          <div className="flex items-center gap-space-md">
            <button className="relative p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-full transition-colors" type="button">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
            </button>
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
