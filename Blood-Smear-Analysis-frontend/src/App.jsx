import { useEffect, useState } from "react";
import "./App.css";
import Login from "./Login.jsx";
import Layout from "./Layout.jsx";
import Dashboard from "./Dashboard.jsx";
import ImageAnalysis from "./ImageAnalysis.jsx";
import Patients from "./Patients.jsx";
import Cases from "./Cases.jsx";
import ReviewQueue from "./ReviewQueue.jsx";
import Reports from "./Reports.jsx";
import Settings from "./Settings.jsx";
import Profile from "./Profile.jsx";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
  const getInitialView = () => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'dashboard';
  };

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));
  const [currentView, setCurrentView] = useState(getInitialView());
  const [initialCase, setInitialCase] = useState(null);

  const handleLoginSuccess = (newToken, newUser) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    window.location.hash = 'dashboard';
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setCurrentView("dashboard");
  };

  // Listen for cross-component navigation (e.g. "View Case" from Patient Profile)
  useEffect(() => {
    const handleCrossNav = (e) => {
      const { view, openCase } = e.detail || {};
      if (view) {
        setInitialCase(openCase || null);
        setCurrentView(view);
      }
    };
    
    const handleAuthError = () => {
      handleLogout();
    };
    
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash !== currentView) {
        setCurrentView(hash);
      }
    };

    window.addEventListener('cellinsight_navigate', handleCrossNav);
    window.addEventListener('cellinsight_auth_error', handleAuthError);
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('cellinsight_navigate', handleCrossNav);
      window.removeEventListener('cellinsight_auth_error', handleAuthError);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [currentView]);

  useEffect(() => {
    if (token) {
      window.location.hash = currentView;
      
      // Proactively verify token on load since some views (like Dashboard) don't fetch data yet
      fetch(`${API_URL}/api/cases`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          window.dispatchEvent(new Event('cellinsight_auth_error'));
        }
      })
      .catch(err => console.error("Error verifying token on load:", err));
    }
  }, [currentView, token]);

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Layout 
      currentView={currentView} 
      onNavigate={(view) => { setInitialCase(null); setCurrentView(view); }} 
      user={user} 
      onLogout={handleLogout}
    >
      {currentView === 'dashboard' && <Dashboard />}
      {currentView === 'image-analysis' && <ImageAnalysis token={token} />}
      {currentView === 'patients' && <Patients />}
      {currentView === 'cases' && <Cases initialCase={initialCase} />}
      {currentView === 'review-queue' && <ReviewQueue />}
      {currentView === 'reports' && <Reports />}
      {currentView === 'settings' && <Settings />}
      {currentView === 'profile' && <Profile />}
    </Layout>
  );
}

export default App;
