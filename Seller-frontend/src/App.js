import { useEffect } from 'react';
import './App.css';
import Login from './Components/Login/Login';
import Dashboard from './Pages/Dashboard';
import { BrowserRouter as Router, Routes, Route  } from "react-router-dom";
import useAuthStore from './Store/AuthStore/AuthStore';

function App() {
  const { userGet, user } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token && !user) {
      userGet().catch((err) => {
        console.error("Session verification failed:", err);
      });
    }
  }, []);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/*" element={<Dashboard />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
