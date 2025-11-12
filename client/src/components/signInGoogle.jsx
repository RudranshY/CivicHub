import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "./firebase";
import { toast } from "react-toastify";
import { setDoc, doc, getDoc } from "firebase/firestore";
import googleIconLight from "../assets/GoogleIconLight.png"; // This import is correct
import { useNavigate } from 'react-router-dom';
import { sendEmail } from '../helper/email';
// We are NO LONGER importing { Button } from '@mui/material'

function SignInWithGoogle() {
  const navigate = useNavigate();

  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          // This is a NEW user
          await setDoc(docRef, {
            email: user.email,
            firstName: user.displayName.split(" ")[0],
            lastName: user.displayName.split(" ").slice(1).join(" "),
            photo: user.photoURL,
            role: "User",
            isEnabled: false // Set to false, requires admin approval
          });
          // Send notification email to admin
          sendEmail(user.email, user.displayName);
          // Inform user they need approval
          toast.info("Registration successful! Your account is pending admin approval.", {
            position: "bottom-center", autoClose: 5000
          });
          auth.signOut(); // Log them out immediately
          navigate('/login'); // Send them to login page
          return; // Stop the function here
        }
        
        // This is an EXISTING user, let App.jsx handle the approval check
        toast.success("User logged in Successfully", {
          position: "bottom-center",
        });
        navigate('/');
      }
    } catch (error) {
      console.error("Error logging in with Google:", error.message);
      toast.error("Error logging in with Google", {
        position: "bottom-center",
      });
    }
  };

  // --- REVERTED to the original <div> and <img> structure ---
  return (
    <div className="continue-google d-flex align-items-center justify-content-center">
      <div onClick={googleLogin} className="d-grid mb-3">
        <img className="continue-submit-icon" src={googleIconLight} alt="Continue with Google" />
      </div>
    </div>
  );
}

export default SignInWithGoogle;