import { GithubAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "./firebase";
import { toast } from "react-toastify";
import { setDoc, doc, getDoc } from "firebase/firestore";
import githubIcon from "../assets/GithubIconLight.png"; // This import is correct
import { useNavigate } from "react-router-dom";
import { sendEmail } from "../helper/email";
// We are NO LONGER importing { Button } from '@mui/material'

function SignInWithGithub() {
  const navigate = useNavigate();

  const githubLogin = async () => {
    const provider = new GithubAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user) {
        const userDocRef = doc(db, "Users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          // This is a NEW user
          await setDoc(userDocRef, {
            email: user.email,
            firstName: user.displayName,
            lastName: "",
            photo: user.photoURL,
            role: "User",
            isEnabled: false, // Set to false, requires admin approval
          });

          // Send notification email to admin
          sendEmail(user.email, user.displayName);

          // Inform user they need approval
          toast.info("Registration successful! Your account is pending admin approval.", {
            position: "bottom-center",
            autoClose: 5000,
          });

          auth.signOut(); // Log them out immediately
          navigate("/login"); // Send them to login page
          return; // Stop the function here
        }

        // This is an EXISTING user, let App.jsx handle the approval check
        toast.success("User logged in Successfully", {
          position: "bottom-center",
        });
        navigate("/");
      }
    } catch (error) {
      console.error("Error during Github login:", error);
      toast.error("Failed to login with Github", {
        position: "bottom-center",
      });
    }
  };

  // --- REVERTED to the original <div> and <img> structure ---
  return (
    <div className="continue-google d-flex align-items-center justify-content-center">
      <div onClick={githubLogin} className="d-grid mb-3">
        <img className="continue-submit-icon" src={githubIcon} alt="Continue with Github" />
      </div>
    </div>
  );
}

export default SignInWithGithub;
