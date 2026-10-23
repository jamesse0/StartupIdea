// Mock: events live in localStorage until the DB deliverable swaps these functions for calls to the backend

const MINUTE = 60 * 1000;

export const DEFAULT_IMAGE = 'https://commons.wikimedia.org/wiki/Special:FilePath/Good_Food_Display_-_NCI_Visuals_Online.jpg?width=400';

function createSeedEvents() {
  const now = Date.now();
  return [
    {
      id: 'seed-1',
      title: 'Free Pizza - Wilkinson Center',
      foodType: 'Pizza',
      location: 'Wilkinson Student Center, Room 2260',
      description: 'Leftovers from a club meeting, about 6 boxes.',
      image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pizza_pie.jpg?width=400',
      poster: 'cosmo_fan',
      postedAt: now - 12 * MINUTE,
    },
    {
      id: 'seed-2',
      title: 'Leftover Donuts - Testing Center',
      foodType: 'Donuts',
      location: 'Testing Center Lobby',
      description: 'Two dozen assorted donuts on the table by the doors.',
      image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Free_Colorful_Donuts_(12097493966).jpg?width=400',
      poster: 'mia_r',
      postedAt: now - 35 * MINUTE,
    },
    {
      id: 'seed-3',
      title: 'Fresh Cookies - Harold B. Lee Library',
      foodType: 'Cookies',
      location: 'HBLL 1st Floor Study Area',
      description: 'Chocolate chip cookies from a study group, help yourself.',
      image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Chocolate_Chip_Cookies_-_kimberlykv.jpg?width=400',
      poster: 'tbennett',
      postedAt: now - 50 * MINUTE,
    },
  ];
}

function saveEvents(events) {
  localStorage.setItem('events', JSON.stringify(events));
}

export function getEvents() {
  const saved = localStorage.getItem('events');
  if (saved === null) {
    const seeded = createSeedEvents();
    saveEvents(seeded);
    return seeded;
  }
  return JSON.parse(saved).sort((a, b) => b.postedAt - a.postedAt);
}

export function addEvent(details, poster) {
  const event = { ...details, id: crypto.randomUUID(), poster, postedAt: Date.now() };
  saveEvents([event, ...getEvents()]);
  return event;
}

// Only the poster can remove their own event; the backend will enforce this same check later
export function removeEvent(id, userName) {
  const events = getEvents();
  const event = events.find((e) => e.id === id);
  if (!event || event.poster !== userName) {
    return false;
  }
  saveEvents(events.filter((e) => e.id !== id));
  return true;
}
