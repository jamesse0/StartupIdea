// Talks to the backend's /api/events endpoints. Every function throws an ApiError when a request fails,
// carrying the HTTP status and the server's message so pages can show it.

export const GONE_THRESHOLD = 3;

export const DEFAULT_IMAGE = 'https://commons.wikimedia.org/wiki/Special:FilePath/Good_Food_Display_-_NCI_Visuals_Online.jpg?width=400';

const SERVER_ERROR = "Couldn't reach CougarGrub right now. Try again in a moment.";

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function request(url, options = {}) {
  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    });
  } catch {
    throw new ApiError(0, SERVER_ERROR);
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(response.status, data?.msg || SERVER_ERROR);
  }
  return data;
}

// Newest first
export function getEvents() {
  return request('/api/events');
}

// The server fills in the poster from whoever is logged in
export function addEvent(details) {
  return request('/api/events', { method: 'POST', body: JSON.stringify(details) });
}

// Only the poster can remove their own event; the server enforces this
export function removeEvent(id) {
  return request(`/api/events/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

// Resolves with { event, removed }; removed is true once enough people have reported it
export function reportGone(id) {
  return request(`/api/events/${encodeURIComponent(id)}/gone`, { method: 'POST' });
}
