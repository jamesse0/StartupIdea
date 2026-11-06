import React from 'react';
import { Link } from 'react-router-dom';
import { getEvents, removeEvent, reportGone, GONE_THRESHOLD } from '../eventService';
import { EventNotifier } from '../eventNotifier';
import { MapEmbed, hasMapEmbed } from '../mapEmbed';
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
  // null until the server answers, so we don't flash "No free food right now" while loading
  const [events, setEvents] = React.useState(null);
  const [loadError, setLoadError] = React.useState('');
  const [actionError, setActionError] = React.useState('');
  const [now, setNow] = React.useState(Date.now());
  const [feed, setFeed] = React.useState(EventNotifier.recentMessages());

  React.useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch((err) => setLoadError(err.message));
  }, []);

  // Re-render every minute so the "x min ago" times stay current
  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    function handleMessage(message) {
      setFeed((prev) => [message, ...prev].slice(0, 5));
      // Skip list updates if the listings haven't loaded yet; the fetch will already include the change
      if (message.event) {
        setEvents((prev) => prev && [message.event, ...prev]);
      }
      if (message.updatedEvent) {
        setEvents((prev) => prev && prev.map((e) => (e.id === message.updatedEvent.id ? message.updatedEvent : e)));
      }
      if (message.endedId) {
        setEvents((prev) => prev && prev.filter((e) => e.id !== message.endedId));
      }
    }
    EventNotifier.addHandler(handleMessage);
    return () => EventNotifier.removeHandler(handleMessage);
  }, []);

  // A 404 means someone else already took the listing down, so just drop the stale card
  function handleActionError(err, event) {
    if (err.status === 404) {
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
    }
    setActionError(err.message);
  }

  async function handleDelete(event) {
    if (!window.confirm(`Delete "${event.title}"?`)) return;
    setActionError('');
    try {
      await removeEvent(event.id);
      EventNotifier.broadcast(`${userName} took down "${event.title}".`, { endedId: event.id });
    } catch (err) {
      handleActionError(err, event);
    }
  }

  async function handleReport(event) {
    setActionError('');
    try {
      const result = await reportGone(event.id);
      EventNotifier.broadcastReport(result, userName);
    } catch (err) {
      handleActionError(err, event);
    }
  }

  return (
    <main className="container listings-page">
      <section id="listings-intro">
        <h2>Current Listings</h2>
        <p>Free food events currently posted by other students. Grab it before it's gone!</p>
      </section>

      {actionError && <p className="listing-error">{actionError}</p>}

      {/* Each article below is one food event record from the server */}
      {loadError ? (
        <section id="no-listings" className="card-panel">
          <p className="listing-error">{loadError}</p>
        </section>
      ) : events === null ? (
        <section id="no-listings" className="card-panel">
          <p className="feed-waiting">Loading listings…</p>
        </section>
      ) : events.length === 0 ? (
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
              {/* Google Maps embed pinned at the coordinates the server looked up when this was posted */}
              {event.coords && hasMapEmbed ? (
                <MapEmbed className="listing-map" coords={event.coords} label={event.location} />
              ) : (
                <div className="map-placeholder">
                  <p>No map for this one. Look for {event.location}.</p>
                </div>
              )}
            </article>
          ))}
        </section>
      )}

      <section id="live-activity" className="card-panel">
        <h2>Live Activity</h2>
        {/* WebSocket data placeholder: updates in real time whenever another user creates or ends a food event */}
        {feed.length === 0 ? (
          <p className="feed-waiting">Nothing yet. When you post, take down, or report food, it'll show up here.</p>
        ) : (
          <ul id="live-activity-feed">
            {feed.map((message) => <li key={message.id}>{message.text}</li>)}
          </ul>
        )}
      </section>
    </main>
  );
}
