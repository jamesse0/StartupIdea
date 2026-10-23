import React from 'react';
import { getEvents } from '../eventService';
import './listings.css';

function timeAgo(timestamp, now) {
  const minutes = Math.floor((now - timestamp) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

export function Listings() {
  const [events, setEvents] = React.useState([]);
  const [now, setNow] = React.useState(Date.now());

  React.useEffect(() => {
    setEvents(getEvents());
  }, []);

  // Re-render every minute so the "x min ago" times stay current
  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="container listings-page">
      <section id="listings-intro">
        <h2>Current Listings</h2>
        <p>Free food events currently posted by other students. Grab it before it's gone!</p>
      </section>

      {/* Database data placeholder: each article below represents one food event record pulled from the database */}
      <section id="listings" className="listing-grid">
        {events.map((event) => (
          <article className="listing-card" key={event.id}>
            <h3>{event.title}</h3>
            <img src={event.image} alt={event.foodType} />
            {event.description && <p>{event.description}</p>}
            <p>Posted by: <span className="poster-username">{event.poster}</span></p>
            <p>Location: {event.location}</p>
            <p>Posted: <span className="post-time">{timeAgo(event.postedAt, now)}</span></p>
            {/* 3rd party API placeholder: Google Maps will render an interactive map here using the event's location */}
            <div className="map-placeholder">
              <p>[Google Maps embed placeholder]</p>
            </div>
          </article>
        ))}
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
