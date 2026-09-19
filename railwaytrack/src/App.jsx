import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landingpage from "./pages/Landingpage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Components from "./pages/Components";
import Inspection from "./pages/Inspection";
import AIAnalysis from "./pages/AIAnalysis";
import Reports from "./pages/Reports";
import WorkerAccount from "./pages/WorkerAccount";
import { auth } from "./services/firebase";
import { onAuthStateChanged } from "firebase/auth";

function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = (firebaseUser) => {
      let signedIn = false;
      try {
        const localFlag = window.localStorage.getItem('signedIn');
        const sessionFlag = window.sessionStorage.getItem('signedIn');
        if (localFlag === 'true' || sessionFlag === 'true') {
          signedIn = true;
        }
      } catch (e) {
        console.error(e);
      }

      if (firebaseUser || signedIn) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setChecking(false);
    };

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      checkAuth(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center font-mono text-xs p-4">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <span>Verifying Officer Sign-In Status...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page & Login */}
        <Route path="/" element={<Landingpage />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Application Routes - Sign In Required */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/components" element={<ProtectedRoute><Components /></ProtectedRoute>} />
        <Route path="/inspection" element={<ProtectedRoute><Inspection /></ProtectedRoute>} />
        <Route path="/inspections" element={<ProtectedRoute><Inspection /></ProtectedRoute>} />
        <Route path="/ai-analysis" element={<ProtectedRoute><AIAnalysis /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/worker-account" element={<ProtectedRoute><WorkerAccount /></ProtectedRoute>} />

        {/* Fallback Wildcard - Redirect all other paths to Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
