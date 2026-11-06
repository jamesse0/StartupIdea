import React from 'react';
import { useNavigate } from 'react-router-dom';
import { addEvent, lookupLocation, DEFAULT_IMAGE } from '../eventService';
import { EventNotifier } from '../eventNotifier';
import { MapEmbed } from '../mapEmbed';

// Wait this long after the last keystroke before looking up the location, so we don't call Google on every letter
const LOOKUP_DELAY = 800;
import './postEvent.css';

// Shrinks the photo to a small JPEG data URL so the upload to the server stays well under its size limit
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
  const [saving, setSaving] = React.useState(false);
  // status is idle, loading, found, or error; place is the server's { address, lat, lng, exact }
  const [lookup, setLookup] = React.useState({ status: 'idle' });

  React.useEffect(() => {
    const query = location.trim();
    if (query.length < 3) {
      setLookup({ status: 'idle' });
      return;
    }
    // ignore is set if the user keeps typing, so a slow, older answer can't replace a newer one
    let ignore = false;
    const timer = setTimeout(() => {
      setLookup({ status: 'loading' });
      lookupLocation(query)
        .then((place) => !ignore && setLookup({ status: 'found', place }))
        .catch((err) => !ignore && setLookup({ status: 'error', msg: err.message }));
    }, LOOKUP_DELAY);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [location]);

  const canPost = title.trim() && foodType.trim() && location.trim() && !saving;

  async function handleSubmit(e) {
    e.preventDefault();
    setSaveError('');
    setSaving(true);
    try {
      const event = await addEvent({
        title: title.trim(),
        foodType: foodType.trim(),
        location: location.trim(),
        description: description.trim(),
        image: image || DEFAULT_IMAGE,
        coords: lookup.status === 'found' ? { lat: lookup.place.lat, lng: lookup.place.lng } : null,
      });
      EventNotifier.broadcast(`${userName} just posted "${event.title}".`, { event });
      navigate('/listings');
    } catch (err) {
      setSaveError(err.message);
      setSaving(false);
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

          {/* Google Maps: the server geocodes the typed location, and the preview shows where it landed */}
          <div className="location-preview" aria-live="polite">
            {lookup.status === 'idle' && (
              <p className="location-note">Type a building or room and we'll find it on the map.</p>
            )}
            {lookup.status === 'loading' && <p className="location-note">Looking up that spot…</p>}
            {lookup.status === 'error' && (
              <p className="location-note">{lookup.msg} You can still post without a map.</p>
            )}
            {lookup.status === 'found' && (
              <>
                <p className="location-match">📍 {lookup.place.address}</p>
                {!lookup.place.exact && (
                  <p className="location-warning">
                    Couldn't pinpoint that spot, so the pin is just somewhere on campus. Try a building name like "JSB" or "Wilkinson Center".
                  </p>
                )}
                <MapEmbed className="location-map" coords={lookup.place} label={location} />
              </>
            )}
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
          <button type="submit" className="btn btn-cougar" disabled={!canPost}>{saving ? 'Posting…' : 'Post Event'}</button>
        </form>
      </section>
    </main>
  );
}
