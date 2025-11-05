import { StorageService } from "../services/StorageService";
import type { BaseModule } from "../modules/BaseModule";
import { ThoughtDiaryModule } from "../modules/ThoughtDiaryModule";
import { MoodTrackerModule } from "../modules/MoodTrackerModule";
import { ActivityPlannerModule } from "../modules/ActivityPlannerModule";
import { BreathingModule } from "../modules/BreathingModule";
import { ReminderModule } from "../modules/ReminderModule";
import { guidelineHighlights } from "../services/CognitiveToolkit";

export class App {
  private readonly modules: BaseModule[];
  private readonly storage = new StorageService();
  private readonly root: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
    this.modules = [
      new ThoughtDiaryModule(this.storage),
      new MoodTrackerModule(this.storage),
      new ActivityPlannerModule(this.storage),
      new BreathingModule(this.storage),
      new ReminderModule(this.storage),
    ];
  }

  init(): void {
    const header = document.createElement("section");
    header.className = "module-card";
    header.innerHTML = `
      <header>
        <h2>CBT дневник</h2>
        <span class="tag">iPhone 13 Pro • ${guidelineHighlights.year}</span>
      </header>
      <p>
        Комплексный само-помощник по CBT/BA/ACT: фиксируйте мысли, активность, дыхание и ритуалы.
      </p>
      <p class="guideline">Актуальные акценты: ${guidelineHighlights.focus}</p>
    `;

    const fragment = document.createDocumentFragment();
    fragment.append(header);

    this.modules.forEach((module) => {
      fragment.append(module.createView());
    });

    this.root.append(fragment);
  }
}
