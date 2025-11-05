import { BaseModule } from "./BaseModule";
import type { StorageService } from "../services/StorageService";
import type { Reminder } from "../types";
import { formatHuman, randomId } from "../utils/format";
import { ReminderService } from "../services/ReminderService";

export class ReminderModule extends BaseModule {
  private reminders: Reminder[] = [];
  private readonly storage: StorageService;

  constructor(storage: StorageService) {
    super("reminders", "Напоминания", "CBT/ACT • устойчивые ритуалы");
    this.storage = storage;
  }

  protected async render(container: HTMLElement): Promise<void> {
    const helper = document.createElement("p");
    helper.textContent =
      "Создайте микро-ритуалы: проверка дневника, дыхание, доброжелательные действия.";
    container.append(helper);

    const form = document.createElement("form");
    form.className = "module-actions";
    form.innerHTML = `
      <label>
        Заголовок
        <input type="text" name="title" required placeholder="Например: вечерний обзор" />
      </label>
      <label>
        Время
        <input type="time" name="time" required />
      </label>
      <label>
        Частота
        <select name="frequency">
          <option value="ежедневно">Ежедневно</option>
          <option value="еженедельно">Еженедельно</option>
          <option value="разово">Разово</option>
        </select>
      </label>
      <label>
        Канал
        <select name="channel">
          <option value="уведомление">Уведомление</option>
          <option value="email">Email</option>
          <option value="звук">Звуковой сигнал</option>
        </select>
      </label>
      <label>
        Заметка
        <textarea name="note" placeholder="Контекст и намерение"></textarea>
      </label>
      <label>
        Активно
        <input type="checkbox" name="active" checked />
      </label>
      <button type="submit">Сохранить напоминание</button>
    `;
    form.addEventListener("submit", (event) => this.handleSubmit(event));

    const list = document.createElement("div");
    list.className = "data-list";

    container.append(form, list);
    await this.loadReminders(list);
  }

  private async loadReminders(list: HTMLElement): Promise<void> {
    this.reminders = await this.storage.all("reminders");
    this.paintReminders(list);
  }

  private paintReminders(list: HTMLElement): void {
    list.innerHTML = "";
    if (!this.reminders.length) {
      const empty = document.createElement("p");
      empty.textContent = "Добавьте напоминание, чтобы поддерживать регулярность практик.";
      list.append(empty);
      return;
    }

    const helper = new ReminderService(this.reminders);
    const upcoming = helper.upcoming;

    const overview = document.createElement("div");
    overview.className = "reminder-item";
    overview.innerHTML = `
      <span>Ближайшие (${upcoming.length})</span>
      <strong>${upcoming
        .map((item) => {
          const anchor = new Date();
          const [hours, minutes] = item.time.split(":").map(Number);
          anchor.setHours(hours ?? 0, minutes ?? 0, 0, 0);
          return `${item.title}: ${formatHuman(anchor.toISOString())}`;
        })
        .join("; ")}</strong>
    `;
    list.append(overview);

    this.reminders
      .slice()
      .reverse()
      .forEach((reminder) => {
        const row = document.createElement("div");
        row.className = "reminder-item";
        row.innerHTML = `
          <div>
            <strong>${reminder.title}</strong>
            <p>${reminder.frequency} • ${reminder.channel}</p>
            ${reminder.note ? `<p>${reminder.note}</p>` : ""}
          </div>
          <span>${reminder.time}</span>
        `;
        list.append(row);
      });
  }

  private async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const reminder: Reminder = {
      id: randomId("reminder"),
      title: (data.get("title") ?? "").toString(),
      time: (data.get("time") ?? "07:30").toString(),
      frequency: (data.get("frequency") ?? "ежедневно").toString() as Reminder["frequency"],
      channel: (data.get("channel") ?? "уведомление").toString() as Reminder["channel"],
      note: (data.get("note") ?? "").toString() || undefined,
      active: data.get("active") === "on",
    };

    await this.storage.save("reminders", reminder);
    this.reminders.push(reminder);
    this.paintReminders(form.nextElementSibling as HTMLElement);
    form.reset();
  }
}
