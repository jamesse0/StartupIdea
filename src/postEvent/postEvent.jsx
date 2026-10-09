import React from 'react';
import './postEvent.css';

export function PostEvent() {
  return (
    <main className="container post-page">
      <section id="post-intro">
        <h2>Post a Free Food Event</h2>
        <img src="https://commons.wikimedia.org/wiki/Special:FilePath/BYU_Wilkinson_Student_Center.JPG?width=600" alt="BYU Wilkinson Student Center" />
        <p>Spotted free food on campus? Let other Cougars know so nothing goes to waste.</p>
      </section>

      <section id="post-form" className="card-panel">
        <form action="#" method="post">
          <label htmlFor="event-title" className="form-label">Event Title</label>
          <input type="text" id="event-title" className="form-control" name="title" placeholder="e.g. Leftover pizza from club meeting" required />

          <label htmlFor="food-type" className="form-label">Food Type</label>
          <input type="text" id="food-type" className="form-control" name="foodType" placeholder="e.g. Pizza, donuts, sandwiches" required />

          <label htmlFor="location" className="form-label">Location</label>
          <input type="text" id="location" className="form-control" name="location" placeholder="e.g. Wilkinson Center, Room 2260" required />

          {/* 3rd party API placeholder: Google Maps will let the user drop a pin for the exact event location */}
          <div className="map-placeholder">
            <p>[Google Maps location picker placeholder]</p>
          </div>

          <label htmlFor="event-image" className="form-label">Upload an Image</label>
          <input type="file" id="event-image" className="form-control" name="image" accept="image/*" />

          <label htmlFor="description" className="form-label">Description</label>
          <textarea id="description" className="form-control" name="description" placeholder="Any extra details? How much food is left, how long it'll be there, etc." />

          <button type="submit" className="btn btn-cougar">Post Event</button>
        </form>
      </section>
    </main>
  );
}
