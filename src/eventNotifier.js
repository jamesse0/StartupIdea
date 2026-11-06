import { GONE_THRESHOLD } from './eventService';

// Passes activity messages (posts, take-downs, gone reports) to any page that's listening.
// For now only this tab's own actions come through; the WebSocket deliverable will deliver
// messages from the server so everyone sees each other's activity live.
class EventNotifierClass {
  handlers = [];
  messages = [];

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
