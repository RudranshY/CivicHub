import '../styles/Login.css';
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { auth } from "./firebase";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import SignInWithGithub from "./signInWithGithub.jsx";
import SignInWithGoogle from "./signInGoogle.jsx";

// --- MUI IMPORTS ---
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Grid,
  Box,
  Typography,
  Container
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
// --- END IMPORTS ---

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in Successfully");

      if (isAdminLogin) {
        localStorage.setItem('isAdmin', 'true');
        toast.success("Admin logged in Successfully", {
          position: "bottom-center",
        });
      } else {
        localStorage.removeItem('isAdmin');
        toast.success("User logged in Successfully", {
          position: "bottom-center",
        });
      }
      navigate('/');
    } catch (error) {
      console.log(error.message);
      toast.error(error.message, {
        position: "bottom-center",
      });
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 3,
          bgcolor: 'background.paper',
          borderRadius: 2,
          // --- UPDATED: Stronger shadow ---
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FormControlLabel
            control={
              <Checkbox
                value="admin"
                color="primary"
                checked={isAdminLogin}
                onChange={(e) => setIsAdminLogin(e.target.checked)}
              />
            }
            label="Log in as Admin"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              // --- UPDATED: Gradient Button ---
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              border: 0,
              borderRadius: 3,
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              color: 'white',
              height: 48,
              padding: '0 30px',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #0288D1 90%)',
              }
            }}
          >
            Sign In
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href="/resetpassword" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link href="/register" variant="body2">
                {"New user? Register Here"}
              </Link>
            </Grid>
          </Grid>
        </Box>

        <Typography component="p" variant="body2" align="center" sx={{ mt: 2, color: '#555' }}>
          -- Or continue with --
        </Typography>

        <Box sx={{ width: '100%', mt: 1 }}>
          <SignInWithGoogle />
          <SignInWithGithub />
        </Box>
      </Box>
    </Container>
  );
}

export default Login;
