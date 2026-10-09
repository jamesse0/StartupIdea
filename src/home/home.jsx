import React from 'react';
import { Link } from 'react-router-dom';
import Carousel from 'react-bootstrap/Carousel';
import './home.css';

export function Home() {
  return (
    <main className="container home-page">
      <section id="greeting">
        {/* Application data placeholder: rendered from app state once a user is logged in */}
        <h2>Welcome back, <span id="current-username">[username placeholder]</span>!</h2>
        <p>Here's what's happening around campus today.</p>
      </section>

      <section id="tip" className="card-panel">
        <h2>Food Tip of the Day</h2>
        <Carousel id="tip-carousel" indicatorLabels={['Food tip', 'Campus photo']}>
          <Carousel.Item>
            <div className="tip-slide">
              {/* Application data placeholder: a randomly selected tip/quote will be rendered here */}
              <blockquote id="daily-tip">
                "The early Cougar gets the free pizza." - [random tip placeholder]
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
        {/* Database data placeholder: teaser of the most recent food events, full list on the listings page */}
        <ul id="recent-activity-preview">
          <li>[Event placeholder] - Free pizza at the Wilkinson Center</li>
          <li>[Event placeholder] - Leftover cookies at the Testing Center</li>
        </ul>
        <p className="see-all"><Link to="/listings">See all current listings</Link></p>
      </section>
    </main>
  );
}
