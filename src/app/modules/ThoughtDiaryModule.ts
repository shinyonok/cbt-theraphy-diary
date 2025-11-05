import { BaseModule } from "./BaseModule";
import { craftReframe, detectDistortions, summarizeDistortions } from "../services/CognitiveToolkit";
import type { StorageService } from "../services/StorageService";
import type { ThoughtEntry } from "../types";
import { formatDateTimeISO, formatHuman, randomId } from "../utils/format";

export class ThoughtDiaryModule extends BaseModule {
  private entries: ThoughtEntry[] = [];
  private readonly storage: StorageService;

  constructor(storage: StorageService) {
    super(
      "thought-diary",
      "Дневник мыслей",
      "CBT • автоматический анализ убеждений",
    );
    this.storage = storage;
  }

  protected async render(container: HTMLElement): Promise<void> {
    const intro = document.createElement("p");
    intro.textContent =
      "Осознайте триггеры и получите подсказки для переоценки согласно CBT 2025.";
    container.append(intro);

    const form = document.createElement("form");
    form.className = "module-actions";
    form.innerHTML = `
      <label>
        Ситуация
        <textarea name="situation" required placeholder="Где и с кем вы были?"></textarea>
      </label>
      <label>
        Автоматическая мысль
        <textarea name="thought" required placeholder="Что пронеслось в голове?"></textarea>
      </label>
      <label>
        Эмоция
        <input name="emotion" type="text" required placeholder="Например: тревога" />
      </label>
      <label>
        Интенсивность эмоции
        <input name="intensity" type="range" min="0" max="100" value="60" />
      </label>
      <label>
        Поведенческий эксперимент
        <textarea name="experiment" placeholder="Как вы протестируете новую мысль?"></textarea>
      </label>
      <button type="submit">Сохранить запись</button>
    `;
    form.addEventListener("submit", (event) => this.handleSubmit(event));

    const list = document.createElement("div");
    list.className = "data-list";
    list.setAttribute("aria-live", "polite");

    container.append(form, list);
    await this.loadEntries(list);
  }

  private async loadEntries(list: HTMLElement): Promise<void> {
    this.entries = await this.storage.all("thoughtEntries");
    this.paintEntries(list);
  }

  private paintEntries(list: HTMLElement): void {
    list.innerHTML = "";
    if (!this.entries.length) {
      const empty = document.createElement("p");
      empty.textContent = "Пока нет записей — начните с наблюдения за мыслью.";
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
          <p><em>Мысль:</em> ${entry.automaticThought}</p>
          <p><em>Эмоция:</em> ${entry.emotion} (${entry.intensity}/100)</p>
          <p><em>Переоценка:</em> ${entry.reframedThought}</p>
          <p><em>Теги:</em> ${entry.distortionTags.join(", ") || "—"}</p>
          ${entry.experimentPlan ? `<p><em>Эксперимент:</em> ${entry.experimentPlan}</p>` : ""}
        `;
        list.append(item);
      });
  }

  private async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const situation = (data.get("situation") ?? "").toString().trim();
    const thought = (data.get("thought") ?? "").toString().trim();
    const emotion = (data.get("emotion") ?? "").toString().trim() || "не определено";
    const intensity = Number(data.get("intensity") ?? 0);
    const experiment = (data.get("experiment") ?? "").toString().trim();

    const matches = detectDistortions(thought);
    const entry: ThoughtEntry = {
      id: randomId("thought"),
      createdAt: formatDateTimeISO(new Date()),
      situation,
      automaticThought: thought,
      emotion,
      intensity,
      distortionTags: summarizeDistortions(matches),
      reframedThought: craftReframe(thought, emotion, intensity),
      experimentPlan: experiment || undefined,
    };

    await this.storage.save("thoughtEntries", entry);
    this.entries.push(entry);
    this.paintEntries(form.nextElementSibling as HTMLElement);
    form.reset();
  }
}
