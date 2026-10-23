const FAKE_USERS = ['mia_r', 'tbennett', 'cosmo_fan', 'jdawg23', 'sarah.k', 'byu_ben'];
const FOODS = ['pizza', 'donuts', 'cookies', 'bagels', 'tacos', 'cupcakes'];
const PLACES = ['the WSC', 'the HBLL', 'the JSB', 'the Tanner Building', 'the Testing Center', 'the Talmage Building'];

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

class EventNotifierClass {
  handlers = [];

  constructor() {
    // Mock: fake activity from other students until the WebSocket deliverable
    setInterval(() => {
      this.broadcast(`${pick(FAKE_USERS)} just grabbed some ${pick(FOODS)} at ${pick(PLACES)}.`);
    }, 8000);
  }

  broadcast(text) {
    const message = { id: crypto.randomUUID(), text };
    this.handlers.forEach((handler) => handler(message));
  }

  addHandler(handler) {
    this.handlers.push(handler);
  }

  removeHandler(handler) {
    this.handlers = this.handlers.filter((h) => h !== handler);
  }
}

export const EventNotifier = new EventNotifierClass();
