import React from 'react';
import { Link } from 'react-router-dom';
import Carousel from 'react-bootstrap/Carousel';
import { getEvents } from '../eventService';
import './home.css';

const FOOD_TIPS = [
  'The early Cougar gets the free pizza.',
  'Club meetings end, leftovers begin. Check the WSC around 8pm.',
  'Finals week means study-break snacks. Keep an eye on the HBLL.',
  'Bring a container. Future you will thank you.',
  "If it says free, it means free. Grab it before it's gone.",
  'Post what you find. Good karma tastes better than cold pizza.',
  'Department open houses almost always have cookies.',
  'Thank whoever brought the food. It keeps the leftovers coming.',
];

export function Home({ userName }) {
  const [tip, setTip] = React.useState('');
  // null until the server answers, so we don't flash "Nothing posted yet" while loading
  const [recent, setRecent] = React.useState(null);
  const [loadError, setLoadError] = React.useState('');

  // Mock: a random local tip until a 3rd party quote API is hooked up
  React.useEffect(() => {
    setTip(FOOD_TIPS[Math.floor(Math.random() * FOOD_TIPS.length)]);
  }, []);

  React.useEffect(() => {
    getEvents()
      .then((events) => setRecent(events.slice(0, 3)))
      .catch((err) => setLoadError(err.message));
  }, []);

  return (
    <main className="container home-page">
      <section id="greeting">
        {/* Application data placeholder: rendered from app state once a user is logged in */}
        <h2>Welcome back, <span id="current-username">{userName}</span>!</h2>
        <p>Here's what's happening around campus today.</p>
      </section>

      <section id="tip" className="card-panel">
        <h2>Food Tip of the Day</h2>
        <Carousel id="tip-carousel" indicatorLabels={['Food tip', 'Campus photo']}>
          <Carousel.Item>
            <div className="tip-slide">
              {/* Application data placeholder: a randomly selected tip/quote will be rendered here */}
              <blockquote id="daily-tip">
                "{tip}"
              </blockquote>
            </div>
          </Carousel.Item>
          <Carousel.Item>
            <img src="https://commons.wikimedia.org/wiki/Special:FilePath/Brigham_Young_University_Campus_-_BYU_-_Provo_-_Utah_in_Autumn.jpg?width=800" alt="BYU campus in Provo, Utah" />
          </Carousel.Item>
        </Carousel>
      </section>

      <section id="quick-actions" className="card-panel">
        <h2>Quick Actions</h2>
        <div className="action-list">
          <Link to="/listings" className="quick-action" title="View Current Listings">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 12h8M12 8v8"></path>
            </svg>
            <span>View Listings</span>
          </Link>
          <Link to="/post" className="quick-action" title="Post a New Event">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18"></rect>
              <path d="M8 12h8M12 8v8"></path>
            </svg>
            <span>Post an Event</span>
          </Link>
        </div>
      </section>

      <section id="recent-activity" className="card-panel">
        <h2>Recent Activity</h2>
        {/* Teaser of the most recent food events from the server, full list on the listings page */}
        {loadError ? (
          <p className="text-danger">{loadError}</p>
        ) : recent === null ? (
          <p className="text-muted">Loading…</p>
        ) : recent.length === 0 ? (
          <p>Nothing posted yet. <Link to="/post">Be the first!</Link></p>
        ) : (
          <ul id="recent-activity-preview">
            {recent.map((event) => (
              <li key={event.id}>{event.title} <span className="text-muted">(posted by {event.poster})</span></li>
            ))}
          </ul>
        )}
        <p className="see-all"><Link to="/listings">See all current listings</Link></p>
      </section>
    </main>
  );
}
