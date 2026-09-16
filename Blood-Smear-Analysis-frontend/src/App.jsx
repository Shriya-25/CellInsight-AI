import { useEffect, useState } from "react";
import "./App.css";
import Login from "./Login.jsx";
import Layout from "./Layout.jsx";
import Dashboard from "./Dashboard.jsx";
import ImageAnalysis from "./ImageAnalysis.jsx";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));
  const [currentView, setCurrentView] = useState("dashboard");

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

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Layout 
      currentView={currentView} 
      onNavigate={setCurrentView} 
      user={user} 
      onLogout={handleLogout}
    >
      {currentView === 'dashboard' && <Dashboard />}
      {currentView === 'image-analysis' && <ImageAnalysis token={token} />}
    </Layout>
  );
}

export default App;
