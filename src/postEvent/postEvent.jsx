import React from 'react';
import { useNavigate } from 'react-router-dom';
import { addEvent } from '../eventService';
import './postEvent.css';

const DEFAULT_IMAGE = 'https://commons.wikimedia.org/wiki/Special:FilePath/Good_Food_Display_-_NCI_Visuals_Online.jpg?width=400';

// Mock: shrinks the photo to a small JPEG data URL so it fits in localStorage.
// The Service deliverable will upload the file to the server instead.
function resizeImage(file, onDone) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 800 / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      onDone(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

export function PostEvent({ userName }) {
  const navigate = useNavigate();
  const [title, setTitle] = React.useState('');
  const [foodType, setFoodType] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [image, setImage] = React.useState('');
  const fileInput = React.useRef(null);
  const [saveError, setSaveError] = React.useState('');

  const canPost = title.trim() && foodType.trim() && location.trim();

  function handleSubmit(e) {
    e.preventDefault();
    try {
      addEvent(
        {
          title: title.trim(),
          foodType: foodType.trim(),
          location: location.trim(),
          description: description.trim(),
          image: image || DEFAULT_IMAGE,
        },
        userName
      );
      navigate('/listings');
    } catch {
      setSaveError("Couldn't save your post. Storage may be full, so try removing the photo.");
    }
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      resizeImage(file, setImage);
    }
  }

  function clearImage() {
    setImage('');
    fileInput.current.value = '';
  }

  return (
    <main className="container post-page">
      <section id="post-intro">
        <h2>Post a Free Food Event</h2>
        <img src="https://commons.wikimedia.org/wiki/Special:FilePath/BYU_Wilkinson_Student_Center.JPG?width=600" alt="BYU Wilkinson Student Center" />
        <p>Spotted free food on campus? Let other Cougars know so nothing goes to waste.</p>
      </section>

      <section id="post-form" className="card-panel">
        <form onSubmit={handleSubmit}>
          <label htmlFor="event-title" className="form-label">Event Title</label>
          <input type="text" id="event-title" className="form-control" name="title" placeholder="e.g. Leftover pizza from club meeting" required value={title} onChange={(e) => setTitle(e.target.value)} />

          <label htmlFor="food-type" className="form-label">Food Type</label>
          <input type="text" id="food-type" className="form-control" name="foodType" placeholder="e.g. Pizza, donuts, sandwiches" required value={foodType} onChange={(e) => setFoodType(e.target.value)} />

          <label htmlFor="location" className="form-label">Location</label>
          <input type="text" id="location" className="form-control" name="location" placeholder="e.g. Wilkinson Center, Room 2260" required value={location} onChange={(e) => setLocation(e.target.value)} />

          {/* 3rd party API placeholder: Google Maps will let the user drop a pin for the exact event location */}
          <div className="map-placeholder">
            <p>[Google Maps location picker placeholder]</p>
          </div>

          <label htmlFor="event-image" className="form-label">Upload an Image</label>
          <input type="file" id="event-image" className="form-control" name="image" accept="image/*" ref={fileInput} onChange={handleImageChange} />
          <div className="image-preview">
            <img src={image || DEFAULT_IMAGE} alt="Event preview" />
            {image
              ? <button type="button" className="btn btn-link" onClick={clearImage}>Remove photo</button>
              : <p>No photo chosen, so we'll use this one.</p>}
          </div>

          <label htmlFor="description" className="form-label">Description</label>
          <textarea id="description" className="form-control" name="description" placeholder="Any extra details? How much food is left, how long it'll be there, etc." value={description} onChange={(e) => setDescription(e.target.value)} />

          {saveError && <p className="field-hint">{saveError}</p>}
          <button type="submit" className="btn btn-cougar" disabled={!canPost}>Post Event</button>
        </form>
      </section>
    </main>
  );
}
