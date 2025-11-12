import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebase";
import { setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { sendEmail } from "../helper/email";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      if (user) {
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email || "",
          firstName: fname || "",
          lastName: lname || "",
          photo: "",
          role: "User",
          // New users are disabled until approved in the DB
          isEnabled: false,
        });

        // Notify admin (or send welcome) — only if email and name present
        if (user.email) {
          sendEmail(user.email, `${fname} ${lname}`.trim());
        }
      }

      console.log("User Registered Successfully!!");
      toast.success("Registration successful! Your account is pending admin approval.", {
        position: "bottom-center",
        autoClose: 5000,
      });
      navigate("/login");
    } catch (error) {
      console.log(error.message);
      toast.error(error.message, {
        position: "bottom-center",
      });
    }
  };

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center">
      <Box
        component="form"
        onSubmit={handleRegister}
        sx={{
          p: 4,
          bgcolor: "background.paper",
          borderRadius: 1,
          boxShadow: 3,
          width: { sm: 350, md: 450 },
        }}
        noValidate
        autoComplete="off"
      >
        <h3 className="text-center mb-4">Sign Up</h3>

        <TextField
          required
          id="outlined-firstname"
          label="First Name"
          fullWidth
          margin="normal"
          value={fname}
          onChange={(e) => setFname(e.target.value)}
        />

        <TextField
          id="outlined-lastname"
          label="Last Name"
          fullWidth
          margin="normal"
          value={lname}
          onChange={(e) => setLname(e.target.value)}
        />

        <TextField
          required
          id="outlined-email"
          label="Email Address"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          required
          id="outlined-password"
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="d-grid mb-3">
          <button type="submit" className="btn btn-primary">
            Sign Up
          </button>
        </div>

        <p className="text-center">
          Already registered? <a href="/login">Login Here</a>
        </p>
      </Box>
    </div>
  );
}
