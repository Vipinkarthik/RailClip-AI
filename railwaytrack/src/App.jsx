import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landingpage from "./pages/Landingpage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Components from "./pages/Components";
import Inspection from "./pages/Inspection";
import AIAnalysis from "./pages/AIAnalysis";
import Reports from "./pages/Reports";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Landingpage />} />
        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        {/* Main Application */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/components" element={<Components />} />
        <Route path="/inspection" element={<Inspection />} />
        <Route path="/inspections" element={<Inspection />} />
        <Route path="/ai-analysis" element={<AIAnalysis />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
