import { BaseModule } from "./BaseModule";
import type { StorageService } from "../services/StorageService";
import type { ActivityPlan } from "../types";
import { formatDateTimeISO, formatHuman, randomId } from "../utils/format";

const DOMAINS: ActivityPlan["domain"][] = [
  "эмоциональное",
  "социальное",
  "профессиональное",
  "здоровье",
];

const COMMITMENTS: ActivityPlan["commitment"][] = ["низкий", "средний", "высокий"];

export class ActivityPlannerModule extends BaseModule {
  private plans: ActivityPlan[] = [];
  private readonly storage: StorageService;

  constructor(storage: StorageService) {
    super(
      "activity-planner",
      "Активирующие действия",
      "BA • опора на ценности и микро-шаги",
    );
    this.storage = storage;
  }

  protected async render(container: HTMLElement): Promise<void> {
    const preface = document.createElement("p");
    preface.textContent =
      "Запланируйте действия, которые поддерживают жизненные ценности и энергию.";
    container.append(preface);

    const form = document.createElement("form");
    form.className = "module-actions";
    form.innerHTML = `
      <label>
        Действие
        <textarea name="description" required placeholder="Что поможет приблизиться к ценностям?"></textarea>
      </label>
      <label>
        Область
        <select name="domain">
          ${DOMAINS.map((domain) => `<option value="${domain}">${domain}</option>`).join("")}
        </select>
      </label>
      <label>
        Уровень вовлечённости
        <select name="commitment">
          ${COMMITMENTS.map((commitment) => `<option value="${commitment}">${commitment}</option>`).join("")}
        </select>
      </label>
      <label>
        Энергетический эффект
        <input type="range" name="vitality" min="0" max="100" value="60" />
      </label>
      <label>
        Время
        <input type="datetime-local" name="scheduled" required />
      </label>
      <button type="submit">Добавить план</button>
    `;
    form.addEventListener("submit", (event) => this.handleSubmit(event));

    const list = document.createElement("div");
    list.className = "timeline";

    container.append(form, list);
    await this.loadPlans(list);
  }

  private async loadPlans(list: HTMLElement): Promise<void> {
    this.plans = await this.storage.all("activities");
    this.paintPlans(list);
  }

  private paintPlans(list: HTMLElement): void {
    list.innerHTML = "";
    if (!this.plans.length) {
      const empty = document.createElement("p");
      empty.textContent = "Спланируйте активность, чтобы усилить поведенческую активацию.";
      list.append(empty);
      return;
    }

    this.plans
      .slice()
      .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
      .forEach((plan) => {
        const row = document.createElement("div");
        row.className = "data-item";
        row.innerHTML = `
          <strong>${formatHuman(plan.scheduledFor)}</strong>
          <p>${plan.description}</p>
          <p>Область: ${plan.domain}</p>
          <p>Вовлечённость: ${plan.commitment}</p>
          <p>Энергия: ${plan.vitalityScore}/100</p>
          <p>Статус: ${plan.status}</p>
        `;
        list.append(row);
      });
  }

  private async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const plan: ActivityPlan = {
      id: randomId("plan"),
      description: (data.get("description") ?? "").toString(),
      domain: (data.get("domain") ?? DOMAINS[0]).toString() as ActivityPlan["domain"],
      commitment: (data.get("commitment") ?? COMMITMENTS[0]).toString() as ActivityPlan["commitment"],
      vitalityScore: Number(data.get("vitality") ?? 0),
      scheduledFor: data.get("scheduled")?.toString() ?? formatDateTimeISO(new Date()),
      status: "запланировано",
    };

    await this.storage.save("activities", plan);
    this.plans.push(plan);
    this.paintPlans(form.nextElementSibling as HTMLElement);
    form.reset();
  }
}
