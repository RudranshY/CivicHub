import { useEffect } from "react";
import { auth } from "./firebase";
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";

// Renamed function to Logout to match the file name
function Logout() { 
  const navigate = useNavigate();

  
  useEffect(() => {
    const handleLogout = async () => {
        try {
          // --- NEW: Clear the admin flag ---
          localStorage.removeItem('isAdmin');
          // --- END NEW ---

          await auth.signOut();
          console.log("User logged out successfully!");
          toast.success("User logged out Successfully", {
            position: "bottom-center",
          });
          navigate('/');
        } catch (error) {
          console.error("Error logging out:", error.message);
        }
      };
    handleLogout();
  }, [navigate]);

  return (
    <></> // This component is just for logging out, so it renders nothing
  );
}
export default Logout; // Updated export