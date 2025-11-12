import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "./firebase";
import { toast } from "react-toastify";
import { setDoc, doc, getDoc } from "firebase/firestore";
import googleIconLight from "../assets/GoogleIconLight.png";
import { useNavigate } from 'react-router-dom';
import { sendEmail } from '../helper/email';
import { Button } from '@mui/material'; // Using the Button component we fixed earlier

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
            // --- THE CHANGE ---
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

  // Using the fixed MUI Button from our previous edits
  return (
    <Button
      variant="outlined"
      fullWidth
      onClick={googleLogin}
      sx={{ 
        mt: 1, 
        mb: 1, 
        color: '#3c4043', 
        borderColor: '#dadce0', 
        textTransform: 'none', 
        '&:hover': { bgcolor: '#f5f5f5' } 
      }}
      startIcon={<img src={googleIconLight} alt="Google" style={{ width: '24px', height: '24px' }} />}
    >
      Continue with Google
    </Button>
  );
}

export default SignInWithGoogle;