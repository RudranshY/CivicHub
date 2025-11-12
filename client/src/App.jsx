import './styles/App.css';
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import { CssBaseline } from '@mui/material';
import { sendUserData } from './helper/api.js';
import { auth, db } from './components/firebase.jsx';
import { getDoc, doc } from 'firebase/firestore';

import Navbar from './components/navbar.jsx';
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import IssueDetails from './pages/IssueDetails.jsx';
import Map from './pages/Map.jsx';
import IssueForm from './pages/IssueForm.jsx';
import Profile from "./components/profile.jsx";
import Login from "./components/login.jsx";
import SignUp from "./components/register.jsx";
import ResetPassword from "./components/resetPassword.jsx";
import Logout from './components/logout.jsx';
import ReportBug from './pages/reportBug.jsx';
import UserManagement from './pages/UserManagement.jsx';
import IssueManagement from './pages/IssueManagement.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [dataSent, setDataSent] = useState(false);

  // LOGIN & APPROVAL CHECK
  useEffect(() => {
    // listener handles login, logout, and approval checks
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        // User is logged in, now check if they are approved
        try {
          const userDocRef = doc(db, "Users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists() && userDoc.data().isEnabled === true) {
            // User exists AND is enabled/approved
            setUser(currentUser);
          } else {
            // User is not approved or their DB document doesn't exist
            let msg = "Your account is pending admin approval.";
            if (!userDoc.exists()) {
              msg = "User data not found. Please contact support.";
            }

            toast.error(msg, {
              position: "bottom-center",
              autoClose: 5000,
              theme: "colored",
            });

            // Log them out and clear user state
            await auth.signOut();
            setUser(null);
          }
        } catch (err) {
          console.error("Error checking user approval:", err);
          // Fallback: sign out and clear user
          await auth.signOut();
          setUser(null);
        }
      } else {
        // User is logged out
        setUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // run once on mount

  // Optional: send user data once per session (kept commented by default)
  useEffect(() => {
    // uncomment to enable sending user data once
    // sendUserDataOnce();
  }, []); // run once on mount

  const sendUserDataOnce = async () => {
    if (dataSent) return;
    setDataSent(true);
    const url = window.location.href;
    try {
      await sendUserData(url);
    } catch (err) {
      console.error("Failed to send user data:", err);
    }
  };

  // ADMIN CHECK (for the "Log in as Admin" checkbox)
  useEffect(() => {
    const checkAdmin = () => {
      if (user) {
        // Check the flag we set in localStorage during login
        const adminStatus = localStorage.getItem('isAdmin') === 'true';
        setAdmin(adminStatus);
      } else {
        // If no user, ensure admin is false and clear the flag
        setAdmin(false);
        localStorage.removeItem('isAdmin');
      }
    };
    checkAdmin();
  }, [user]); // runs whenever the user logs in or out

  return (
    <Router>
      <div className="App">
        <div className="auth-wrapper">
          <div className="auth-inner">
            <ToastContainer newestOnTop />
            <CssBaseline />
            <Navbar admin={admin} />
            <Routes>
              <Route path="/" element={<Navigate to="/home" />} />
              <Route path="/home" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/heatmap" element={<Map />} />
              <Route path="/issuedetails" element={<IssueDetails />} />
              <Route path="/issueform" element={<IssueForm />} />
              <Route path="/reportbug" element={<ReportBug />} />

              {!user && <Route path="/login" element={<Login />} />}
              {!user && <Route path="/register" element={<SignUp />} />}
              {!user && <Route path="/resetpassword" element={<ResetPassword />} />}

              {user && <Route path="/logout" element={<Logout />} />}
              {user && <Route path="/profile" element={<Profile />} />}

              {user && admin && <Route path="/usermanagement" element={<UserManagement />} />}
              {user && admin && <Route path="/issuemanagement" element={<IssueManagement />} />}
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
