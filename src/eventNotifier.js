import { addEvent, getEvents, reportGone, DEFAULT_IMAGE, GONE_THRESHOLD } from './eventService';

const FAKE_USERS = ['mia_r', 'tbennett', 'cosmo_fan', 'jdawg23', 'sarah.k', 'byu_ben'];
const FOODS = ['Pizza', 'Donuts', 'Cookies', 'Bagels', 'Tacos', 'Cupcakes'];
const PLACES = ['WSC', 'HBLL', 'JSB', 'Tanner Building', 'Testing Center', 'Talmage Building'];
const FOOD_IMAGES = {
  Pizza: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pizza_pie.jpg?width=400',
  Donuts: 'https://commons.wikimedia.org/wiki/Special:FilePath/Free_Colorful_Donuts_(12097493966).jpg?width=400',
  Cookies: 'https://commons.wikimedia.org/wiki/Special:FilePath/Chocolate_Chip_Cookies_-_kimberlykv.jpg?width=400',
};
const MAX_EVENTS = 8;

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

class EventNotifierClass {
  handlers = [];
  messages = [];

  constructor() {
    // Mock: fake activity from other students until the WebSocket deliverable
    setInterval(() => {
      const user = pick(FAKE_USERS);
      const roll = Math.random();
      if (roll < 0.3 && getEvents().length < MAX_EVENTS) {
        this.fakePost(user);
        return;
      }
      if (roll < 0.55 && this.fakeReport(user)) {
        return;
      }
      this.broadcast(`${user} just grabbed some ${pick(FOODS).toLowerCase()} at the ${pick(PLACES)}.`);
    }, 8000);
  }

  fakePost(user) {
    const food = pick(FOODS);
    const place = pick(PLACES);
    const event = addEvent(
      {
        title: `Free ${food} - ${place}`,
        foodType: food,
        location: place,
        description: '',
        image: FOOD_IMAGES[food] || DEFAULT_IMAGE,
      },
      user
    );
    this.broadcast(`${user} just posted "${event.title}".`, { event });
  }

  // Returns false when this user has nothing left they're allowed to report
  fakeReport(user) {
    const reportable = getEvents().filter((e) => e.poster !== user && !(e.goneReports || []).includes(user));
    if (reportable.length === 0) {
      return false;
    }
    const result = reportGone(pick(reportable).id, user);
    this.broadcastReport(result, user);
    return true;
  }

  broadcastReport({ event, removed }, user) {
    if (removed) {
      this.broadcast(`"${event.title}" was taken down. ${GONE_THRESHOLD} people said the food's gone.`, { endedId: event.id });
    } else {
      this.broadcast(`${user} says the food's gone at "${event.title}" (${event.goneReports.length}/${GONE_THRESHOLD}).`, { updatedEvent: event });
    }
  }

  broadcast(text, data = {}) {
    const message = { id: crypto.randomUUID(), text, ...data };
    this.messages = [message, ...this.messages].slice(0, 5);
    this.handlers.forEach((handler) => handler(message));
  }

  recentMessages() {
    return this.messages;
  }

  addHandler(handler) {
    this.handlers.push(handler);
  }

  removeHandler(handler) {
    this.handlers = this.handlers.filter((h) => h !== handler);
  }
}

export const EventNotifier = new EventNotifierClass();
