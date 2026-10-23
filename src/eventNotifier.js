import { addEvent, getEvents, DEFAULT_IMAGE } from './eventService';

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
      const food = pick(FOODS);
      const place = pick(PLACES);
      if (Math.random() < 1 / 3 && getEvents().length < MAX_EVENTS) {
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
        this.broadcast(`${user} just posted "${event.title}".`, event);
      } else {
        this.broadcast(`${user} just grabbed some ${food.toLowerCase()} at the ${place}.`);
      }
    }, 8000);
  }

  broadcast(text, event) {
    const message = { id: crypto.randomUUID(), text, event };
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
