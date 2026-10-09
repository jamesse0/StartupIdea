import React from 'react';
import './listings.css';

export function Listings() {
  return (
    <main className="container listings-page">
      <section id="listings-intro">
        <h2>Current Listings</h2>
        <p>Free food events currently posted by other students. Grab it before it's gone!</p>
      </section>

      {/* Database data placeholder: each article below represents one food event record pulled from the database */}
      <section id="listings" className="listing-grid">
        <article className="listing-card">
          <h3>Free Pizza - Wilkinson Center</h3>
          <img src="https://commons.wikimedia.org/wiki/Special:FilePath/Pizza_pie.jpg?width=400" alt="Pizza" />
          <p>Posted by: <span className="poster-username">[username placeholder]</span></p>
          <p>Location: Wilkinson Student Center, Room 2260</p>
          <p>Posted: <span className="post-time">[timestamp placeholder]</span></p>
          {/* 3rd party API placeholder: Google Maps will render an interactive map here using the event's location */}
          <div className="map-placeholder">
            <p>[Google Maps embed placeholder - Wilkinson Student Center]</p>
          </div>
        </article>

        <article className="listing-card">
          <h3>Leftover Donuts - Testing Center</h3>
          <img src="https://commons.wikimedia.org/wiki/Special:FilePath/Free_Colorful_Donuts_(12097493966).jpg?width=400" alt="Assorted donuts" />
          <p>Posted by: <span className="poster-username">[username placeholder]</span></p>
          <p>Location: Testing Center Lobby</p>
          <p>Posted: <span className="post-time">[timestamp placeholder]</span></p>
          <div className="map-placeholder">
            <p>[Google Maps embed placeholder - Testing Center]</p>
          </div>
        </article>

        <article className="listing-card">
          <h3>Fresh Cookies - Harold B. Lee Library</h3>
          <img src="https://commons.wikimedia.org/wiki/Special:FilePath/Chocolate_Chip_Cookies_-_kimberlykv.jpg?width=400" alt="Chocolate chip cookies" />
          <p>Posted by: <span className="poster-username">[username placeholder]</span></p>
          <p>Location: HBLL 1st Floor Study Area</p>
          <p>Posted: <span className="post-time">[timestamp placeholder]</span></p>
          <div className="map-placeholder">
            <p>[Google Maps embed placeholder - HBLL]</p>
          </div>
        </article>
      </section>

      <section id="live-activity" className="card-panel">
        <h2>Live Activity</h2>
        {/* WebSocket data placeholder: updates in real time whenever another user creates or ends a food event */}
        <ul id="live-activity-feed">
          <li>[websocket placeholder] A new event was just posted near the JSB.</li>
          <li>[websocket placeholder] The "Free Pizza - Wilkinson Center" event just ended.</li>
        </ul>
      </section>
    </main>
  );
}
