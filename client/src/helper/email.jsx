import axios from 'axios';

// These are correct
const template_id = import.meta.env.VITE_EMAIL_TEMPLATE_ID;
const service_id = import.meta.env.VITE_EMAIL_SERVICE_ID;
const user_id = import.meta.env.VITE_EMAIL_USER_ID;

// --- NEW: Read your personal info from .env ---
const admin_name = import.meta.env.VITE_ADMIN_NAME;
const admin_email = import.meta.env.VITE_ADMIN_EMAIL;
// --- END NEW ---

export const sendEmail = async ( email, username ) => {
  
    const data = {
      service_id: service_id,
      template_id: template_id,
      user_id: user_id,
      template_params: {
        // --- UPDATED: Use the secure variables ---
        to_name: admin_name,
        from_name: username,
        message: `
        There is a new signup on civichub, wohooo! \n
        Details \n
        Email: ${email}, \n
        username: ${username}
        `,
        reply_to: admin_email
        // --- END UPDATE ---
      }
    };
  
    axios.post('https://api.emailjs.com/api/v1.0/email/send', data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .catch((error) => {
      console.error('Error sending email:', error.response ? error.response.data : error);
      console.error('Request data:', data);
    });
  };