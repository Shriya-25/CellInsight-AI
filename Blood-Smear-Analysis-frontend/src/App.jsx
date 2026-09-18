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

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));
  const [currentView, setCurrentView] = useState("dashboard");
  const [initialCase, setInitialCase] = useState(null);

  const handleLoginSuccess = (newToken, newUser) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
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
    window.addEventListener('cellinsight_navigate', handleCrossNav);
    return () => window.removeEventListener('cellinsight_navigate', handleCrossNav);
  }, []);

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
    </Layout>
  );
}

export default App;
