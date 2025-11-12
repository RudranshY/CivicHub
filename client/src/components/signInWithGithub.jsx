import React from "react";
import { GithubAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "./firebase";
import { toast } from "react-toastify";
import { setDoc, doc, getDoc } from "firebase/firestore";
import githubIcon from "../assets/GithubIconLight.png";
import { useNavigate } from "react-router-dom";
import { sendEmail } from "../helper/email";
import { Button } from "@mui/material";

export default function SignInWithGithub() {
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
          // --- New user ---
          await setDoc(userDocRef, {
            email: user.email || "",
            firstName: user.displayName || "",
            lastName: "",
            photo: user.photoURL || "",
            role: "User",
            isEnabled: false, // Require admin approval
          });

          // Notify admin (email helper)
          if (user.email && user.displayName) {
            sendEmail(user.email, user.displayName);
          }

          toast.info("Registration successful! Your account is pending admin approval.", {
            position: "bottom-center",
            autoClose: 5000,
          });

          await auth.signOut(); // Log out immediately
          navigate("/login");
          return; // stop here for new users
        }

        // --- Existing user ---
        toast.success("User logged in Successfully", { position: "bottom-center" });
        navigate("/");
      }
    } catch (error) {
      console.error("Error during Github login:", error);
      toast.error("Failed to login with Github", { position: "bottom-center" });
    }
  };

  return (
    <Button
      variant="contained"
      fullWidth
      onClick={githubLogin}
      sx={{
        mt: 1,
        mb: 1,
        bgcolor: "#24292e",
        color: "#ffffff",
        textTransform: "none",
        "&:hover": { bgcolor: "#333" },
      }}
      startIcon={
        <img
          src={githubIcon}
          alt="Github"
          style={{
            width: 24,
            height: 24,
            filter: "brightness(0) invert(1)",
          }}
        />
      }
    >
      Continue with Github
    </Button>
  );
}
