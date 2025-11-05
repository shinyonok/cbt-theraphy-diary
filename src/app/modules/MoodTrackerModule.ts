import { BaseModule } from "./BaseModule";
import type { StorageService } from "../services/StorageService";
import type { MoodEntry } from "../types";
import { formatDateTimeISO, formatHuman, randomId } from "../utils/format";

export class MoodTrackerModule extends BaseModule {
  private entries: MoodEntry[] = [];
  private readonly storage: StorageService;

  constructor(storage: StorageService) {
    super("mood-tracker", "Настроение и энергия", "BA • ритм дня и фокус");
    this.storage = storage;
  }

  protected async render(container: HTMLElement): Promise<void> {
    const summary = document.createElement("p");
    summary.textContent =
      "Фиксируйте настроение, уровень энергии и фокус для отслеживания влияния активностей.";
    container.append(summary);

    const form = document.createElement("form");
    form.className = "module-actions mood-scale";
    form.innerHTML = `
      <label>
        Настроение
        <input name="mood" type="range" min="0" max="100" value="50" />
      </label>
      <label>
        Энергия
        <input name="energy" type="range" min="0" max="100" value="50" />
      </label>
      <label>
        Фокус
        <select name="focus">
          <option value="ценности">Ценности</option>
          <option value="отношения">Отношения</option>
          <option value="здоровье">Здоровье</option>
          <option value="рост">Личный рост</option>
        </select>
      </label>
      <label>
        Наблюдение
        <textarea name="note" placeholder="Что повлияло на состояние?"></textarea>
      </label>
      <button type="submit">Добавить отметку</button>
    `;
    form.addEventListener("submit", (event) => this.handleSubmit(event));

    const list = document.createElement("div");
    list.className = "data-list";

    container.append(form, list);
    await this.loadEntries(list);
  }

  private async loadEntries(list: HTMLElement): Promise<void> {
    this.entries = await this.storage.all("moodEntries");
    this.paintEntries(list);
  }

  private paintEntries(list: HTMLElement): void {
    list.innerHTML = "";

    if (!this.entries.length) {
      const empty = document.createElement("p");
      empty.textContent = "Начните с первой отметки, чтобы заметить закономерности недели.";
      list.append(empty);
      return;
    }

    this.entries
      .slice()
      .reverse()
      .forEach((entry) => {
        const item = document.createElement("article");
        item.className = "data-item";
        item.innerHTML = `
          <strong>${formatHuman(entry.createdAt)}</strong>
          <p>Настроение: ${entry.moodLevel}/100</p>
          <div class="progress-bar" aria-hidden="true"><span style="width: ${entry.moodLevel}%;"></span></div>
          <p>Энергия: ${entry.energyLevel}/100</p>
          <div class="progress-bar" aria-hidden="true"><span style="width: ${entry.energyLevel}%; background: var(--success);"></span></div>
          <p>Фокус: ${entry.focus}</p>
          ${entry.note ? `<p>Наблюдение: ${entry.note}</p>` : ""}
        `;
        list.append(item);
      });
  }

  private async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const entry: MoodEntry = {
      id: randomId("mood"),
      createdAt: formatDateTimeISO(new Date()),
      moodLevel: Number(data.get("mood") ?? 0),
      energyLevel: Number(data.get("energy") ?? 0),
      focus: (data.get("focus") ?? "ценности").toString(),
      note: (data.get("note") ?? "").toString() || undefined,
    };

    await this.storage.save("moodEntries", entry);
    this.entries.push(entry);
    this.paintEntries(form.nextElementSibling as HTMLElement);
    form.reset();
  }
}
