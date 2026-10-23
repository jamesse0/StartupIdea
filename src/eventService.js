// Mock: events live in localStorage until the DB deliverable swaps these functions for calls to the backend

const MINUTE = 60 * 1000;

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

export function getEvents() {
  const saved = localStorage.getItem('events');
  if (saved === null) {
    const seeded = createSeedEvents();
    localStorage.setItem('events', JSON.stringify(seeded));
    return seeded;
  }
  return JSON.parse(saved).sort((a, b) => b.postedAt - a.postedAt);
}
