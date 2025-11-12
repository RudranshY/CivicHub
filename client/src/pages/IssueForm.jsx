import { Gemini } from '../helper/api.js';
import { SwalSuccess, SwalError } from '../helper/swal.js';
import '../styles/IssueForm.css';
import { auth } from '../components/firebase.jsx';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Loader from '../components/loader.jsx';
import { Box, Button, Chip, FormControl, TextField, Typography } from '@mui/material';

// --- LEAFLET IMPORTS ---
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// --- FIX FOR BROKEN LEAFLET ICONS ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
// --- END OF LEAFLET IMPORTS & FIX ---

// --- HELPER COMPONENT TO HANDLE MAP CLICKS ---
function MapClickHandler({ setLat, setLng, setMarkerPosition }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setLat(lat);
      setLng(lng);
      setMarkerPosition([lat, lng]);
      toast.info('Manual location selected!');
    },
  });
  return null;
}
// --- END OF HELPER COMPONENT ---

// --- NEW Component to handle map centering ---
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};
// --- END NEW Component ---

const IssueForm = () => {
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [tags, setTags] = useState([]);
  const [customTag, setCustomTag] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // --- NEW State for map center ---
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default center (India)
  const [mapZoom, setMapZoom] = useState(5); // Default zoom

  useEffect(() => {
    // --- LOGIN CHECK (with cleanup) ---
    const usingSwal = () => {
      withReactContent(Swal).fire({
        icon: 'error',
        title: 'User Not Logged In',
        text: 'Please sign in to view Issue Form',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Log In',
        cancelButtonText: 'Close',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        } else {
          navigate('/');
        }
      });
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        usingSwal();
      } else {
        setLoggedIn(true);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // --- NEW: Ask for user's location on load (only when logged in) ---
  useEffect(() => {
    if (!loggedIn) return;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLat(latitude);
          setLng(longitude);
          setMarkerPosition([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          setMapZoom(13);
          toast.success('Location found!');
        },
        (error) => {
          console.error('Error getting location', error);
          toast.error('Could not get your location. Please click on the map.');
        }
      );
    } else {
      toast.info('Geolocation not available. Please choose location on the map.');
    }
  }, [loggedIn]);
  // --- END NEW ---

  const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file && isFileTypeValid(file.type)) {
      setPhoto(file);
    } else {
      alert('Invalid file type. Please select an image (PNG, JPEG, WEBP, HEIC, HEIF).');
    }
  };

  const isFileTypeValid = (fileType) => {
    return /^image\/(png|jpeg|webp|heic|heif)$/.test(fileType);
  };

  const handleTagsChange = (e) => {
    const value = e.target.value.trim();
    if (e.key === ' ' && value) {
      setTags((prev) => [...prev, value]);
      setCustomTag('');
    }
  };

  const handleCustomTagChange = (e) => {
    setCustomTag(e.target.value);
  };

  const handleTagDelete = (index) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!lat || !lng) {
      toast.error('Please click on the map to select a location.', { position: 'bottom-center' });
      return;
    }

    if (!photo) {
      toast.error('Photo is required.', { position: 'bottom-center' });
      return;
    }

    if (tags.length === 0) {
      toast.error('At least one tag is required.', { position: 'bottom-center' });
      return;
    }

    if (tags.length > 4) {
      toast.error('Maximum of 4 tags allowed.', { position: 'bottom-center' });
      return;
    }

    setIsLoading(true);
    const user = auth.currentUser;
    const formData = new FormData();

    formData.append('user', user.uid);
    formData.append('location', `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    formData.append('lat', lat);
    formData.append('lng', lng);
    formData.append('photo', photo);
    formData.append('tags', JSON.stringify(tags));
    formData.append('date', getCurrentDate());

    try {
      // Backend handles all uploads (e.g., Cloudinary)
      await Gemini(formData);
      SwalSuccess();
    } catch (error) {
      console.error('Error:', error);
      SwalError();
    } finally {
      setIsLoading(false);
      // reset form
      setLat(null);
      setLng(null);
      setMarkerPosition(null);
      setPhoto(null);
      setTags([]);
      setCustomTag('');
      setMapCenter([20.5937, 78.9629]);
      setMapZoom(5);
    }
  };

  return (
    <>
      {isLoading && <Loader />}
      {loggedIn && (
        <Box
          className="container"
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 3,
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 3,
            width: { sm: 400, md: 500 },
          }}
        >
          <Typography variant="h4" gutterBottom>
            Report an Issue
          </Typography>

          {/* --- UPDATED LEAFLET MAP --- */}
          <FormControl fullWidth margin="normal">
            <Typography variant="body1" gutterBottom>
              Click on the map to select a location:
            </Typography>

            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '300px', width: '100%', borderRadius: '8px' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {/* This component handles map clicks */}
              <MapClickHandler setLat={setLat} setLng={setLng} setMarkerPosition={setMarkerPosition} />
              {/* This component updates the map's center/zoom */}
              <ChangeView center={mapCenter} zoom={mapZoom} />

              {markerPosition && <Marker position={markerPosition} />}
            </MapContainer>

            {!lat && (
              <Typography color="error" sx={{ mt: 1 }}>
                Please select a location on the map.
              </Typography>
            )}
          </FormControl>
          {/* --- END OF LEAFLET MAP --- */}

          <FormControl fullWidth margin="normal">
            <TextField
              type="file"
              label="Upload Photo"
              InputLabelProps={{ shrink: true }}
              inputProps={{ accept: 'image/png, image/jpeg, image/webp, image/heic, image/heif' }}
              onChange={handlePhotoChange}
            />
          </FormControl>

          <FormControl fullWidth margin="normal">
            <TextField
              label="Tags"
              placeholder="Enter tags"
              value={customTag}
              onChange={handleCustomTagChange}
              onKeyDown={handleTagsChange}
            />
            <Typography variant="body2" color="text.secondary">
              Separate tags with spaces.
            </Typography>

            <Box mt={1}>
              {tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleTagDelete(index)}
                  color="primary"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>

            {tags.length === 0 && <Typography color="error">At least one tag is required.</Typography>}
            {tags.length > 4 && <Typography color="error">Maximum of 4 tags allowed.</Typography>}
          </FormControl>

          <Box mt={2}>
            <Button variant="contained" color="primary" type="submit" fullWidth>
              Submit
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
};

export default IssueForm;
