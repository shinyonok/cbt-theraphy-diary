import type { Reminder } from "../types";

export class ReminderService {
  private readonly reminders: Reminder[];

  constructor(reminders: Reminder[] = []) {
    this.reminders = reminders;
  }

  get upcoming(): Reminder[] {
    const now = new Date();
    return this.reminders
      .filter((reminder) => reminder.active)
      .filter((reminder) => this.isUpcoming(reminder, now))
      .sort((a, b) => this.nextOccurrence(a).getTime() - this.nextOccurrence(b).getTime())
      .slice(0, 5);
  }

  add(reminder: Reminder): void {
    const index = this.reminders.findIndex((item) => item.id === reminder.id);
    if (index >= 0) {
      this.reminders[index] = reminder;
    } else {
      this.reminders.push(reminder);
    }
  }

  private isUpcoming(reminder: Reminder, now: Date): boolean {
    const next = this.nextOccurrence(reminder);
    return next.getTime() >= now.getTime();
  }

  private nextOccurrence(reminder: Reminder): Date {
    const [hours, minutes] = reminder.time.split(":").map(Number);
    const base = new Date();
    base.setHours(hours ?? 0, minutes ?? 0, 0, 0);

    if (reminder.frequency === "разово") {
      return base;
    }

    if (reminder.frequency === "ежедневно") {
      if (base.getTime() < Date.now()) {
        base.setDate(base.getDate() + 1);
      }
      return base;
    }

    // еженедельно
    const weekdayTarget = 1; // понедельник — как точка отсчёта по BA распорядку недели
    const currentDay = base.getDay();
    const diff = (weekdayTarget + 7 - currentDay) % 7;
    base.setDate(base.getDate() + (diff === 0 && base.getTime() < Date.now() ? 7 : diff));
    return base;
  }
}
