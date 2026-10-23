import React from 'react';
import { Link } from 'react-router-dom';
import { getEvents, removeEvent, reportGone, GONE_THRESHOLD } from '../eventService';
import { EventNotifier } from '../eventNotifier';
import './listings.css';

function timeAgo(timestamp, now) {
  const minutes = Math.floor((now - timestamp) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

export function Listings({ userName }) {
  const [events, setEvents] = React.useState([]);
  const [now, setNow] = React.useState(Date.now());
  const [feed, setFeed] = React.useState(EventNotifier.recentMessages());

  React.useEffect(() => {
    setEvents(getEvents());
  }, []);

  // Re-render every minute so the "x min ago" times stay current
  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    function handleMessage(message) {
      setFeed((prev) => [message, ...prev].slice(0, 5));
      if (message.event) {
        setEvents((prev) => [message.event, ...prev]);
      }
    }
    EventNotifier.addHandler(handleMessage);
    return () => EventNotifier.removeHandler(handleMessage);
  }, []);

  function handleDelete(event) {
    if (!window.confirm(`Delete "${event.title}"?`)) return;
    if (removeEvent(event.id, userName)) {
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
    }
  }

  function handleReport(event) {
    const result = reportGone(event.id, userName);
    setEvents((prev) =>
      result.removed
        ? prev.filter((e) => e.id !== event.id)
        : prev.map((e) => (e.id === event.id ? result.event : e))
    );
  }

  return (
    <main className="container listings-page">
      <section id="listings-intro">
        <h2>Current Listings</h2>
        <p>Free food events currently posted by other students. Grab it before it's gone!</p>
      </section>

      {/* Database data placeholder: each article below represents one food event record pulled from the database */}
      {events.length === 0 ? (
        <section id="no-listings" className="card-panel">
          <h3>No free food right now 😢</h3>
          <p>Spotted some on campus? <Link to="/post">Post it</Link> so other Cougars can grab it.</p>
        </section>
      ) : (
        <section id="listings" className="listing-grid">
          {events.map((event) => (
            <article className="listing-card" key={event.id}>
              <h3>{event.title}</h3>
              <img src={event.image} alt={event.foodType} />
              {event.description && <p>{event.description}</p>}
              <p>Posted by: <span className="poster-username">{event.poster}</span></p>
              <p>Location: {event.location}</p>
              <p>Posted: <span className="post-time">{timeAgo(event.postedAt, now)}</span></p>
              {event.goneReports?.length > 0 && (
                <p className="gone-count">🍽️ {event.goneReports.length} of {GONE_THRESHOLD} people say the food's gone</p>
              )}
              {event.poster === userName ? (
                <button type="button" className="btn btn-card-action" onClick={() => handleDelete(event)}>Delete listing</button>
              ) : (
                <button type="button" className="btn btn-card-action" disabled={event.goneReports?.includes(userName)} onClick={() => handleReport(event)}>
                  {event.goneReports?.includes(userName) ? 'Reported ✓' : "Food's gone"}
                </button>
              )}
              {/* 3rd party API placeholder: Google Maps will render an interactive map here using the event's location */}
              <div className="map-placeholder">
                <p>[Google Maps embed placeholder - {event.location}]</p>
              </div>
            </article>
          ))}
        </section>
      )}

      <section id="live-activity" className="card-panel">
        <h2>Live Activity</h2>
        {/* WebSocket data placeholder: updates in real time whenever another user creates or ends a food event */}
        {feed.length === 0 ? (
          <p className="feed-waiting">Waiting for activity…</p>
        ) : (
          <ul id="live-activity-feed">
            {feed.map((message) => <li key={message.id}>{message.text}</li>)}
          </ul>
        )}
      </section>
    </main>
  );
}
