import { BaseModule } from "./BaseModule";
import type { StorageService } from "../services/StorageService";
import type { BreathingSession } from "../types";
import { formatDateTimeISO, formatHuman, randomId } from "../utils/format";

interface BreathingProtocol {
  id: string;
  title: string;
  description: string;
  inhale: number;
  hold: number;
  exhale: number;
}

const protocols: BreathingProtocol[] = [
  {
    id: "box",
    title: "Квадратное дыхание",
    description: "4 секунды вдох — 4 удержание — 4 выдох — 4 удержание.",
    inhale: 4,
    hold: 4,
    exhale: 4,
  },
  {
    id: "coherent",
    title: "Коэрентное дыхание",
    description: "5 секунд вдох — 5 секунд выдох. Помогает стабилизировать пульс.",
    inhale: 5,
    hold: 0,
    exhale: 5,
  },
  {
    id: "act-body-scan",
    title: "ACT телесная заземлённость",
    description: "3 секунды вдох — 6 секунд выдох, фокус на ощущениях стоп и контакте с ценностями.",
    inhale: 3,
    hold: 0,
    exhale: 6,
  },
];

export class BreathingModule extends BaseModule {
  private sessions: BreathingSession[] = [];
  private readonly storage: StorageService;

  constructor(storage: StorageService) {
    super("breathing", "Дыхание и релаксация", "ACT • осознанное тело");
    this.storage = storage;
  }

  protected async render(container: HTMLElement): Promise<void> {
    const explanation = document.createElement("p");
    explanation.textContent =
      "Выберите протокол и отслеживайте ощущение спокойствия после цикла.";
    container.append(explanation);

    const grid = document.createElement("div");
    grid.className = "exercise-grid";

    protocols.forEach((protocol) => {
      const card = document.createElement("article");
      card.className = "exercise-card";
      card.innerHTML = `
        <h3>${protocol.title}</h3>
        <p>${protocol.description}</p>
        <button type="button" data-protocol="${protocol.id}">Начать</button>
      `;
      card
        .querySelector("button")
        ?.addEventListener("click", () => this.startSession(protocol));
      grid.append(card);
    });

    const list = document.createElement("div");
    list.className = "data-list";

    container.append(grid, list);
    await this.loadSessions(list);
  }

  private async loadSessions(list: HTMLElement): Promise<void> {
    this.sessions = await this.storage.all("breathingSessions");
    this.paintSessions(list);
  }

  private paintSessions(list: HTMLElement): void {
    list.innerHTML = "";
    if (!this.sessions.length) {
      const empty = document.createElement("p");
      empty.textContent = "После упражнения отметьте ощущение эффекта.";
      list.append(empty);
      return;
    }

    this.sessions
      .slice()
      .reverse()
      .forEach((session) => {
        const item = document.createElement("div");
        item.className = "data-item";
        item.innerHTML = `
          <strong>${formatHuman(session.startedAt)}</strong>
          <p>Протокол: ${session.protocol}</p>
          <p>Циклов: ${session.cyclesCompleted}</p>
          <p>Состояние: ${session.perceivedEffect}</p>
        `;
        list.append(item);
      });
  }

  private async startSession(protocol: BreathingProtocol): Promise<void> {
    const perceived = prompt(
      `Завершите ${protocol.title}. Как вы себя чувствуете? (спокоен/сфокусирован/энергичен/расслаблен)`,
      "спокоен",
    );
    const effect = (perceived ?? "спокоен") as BreathingSession["perceivedEffect"];
    const cycles = Number(
      prompt("Сколько циклов завершено?", (protocol.inhale + protocol.exhale).toString()),
    );

    const session: BreathingSession = {
      id: randomId("breath"),
      startedAt: formatDateTimeISO(new Date()),
      protocol: protocol.title,
      cyclesCompleted: Number.isFinite(cycles) ? cycles : 1,
      perceivedEffect: effect,
    };

    await this.storage.save("breathingSessions", session);
    this.sessions.push(session);
    const list = this.section?.querySelector(".data-list") as HTMLElement;
    if (list) {
      this.paintSessions(list);
    }
  }
}
