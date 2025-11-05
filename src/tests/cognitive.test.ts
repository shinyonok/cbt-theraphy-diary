import { describe, expect, it } from "vitest";
import {
  craftReframe,
  detectDistortions,
  summarizeDistortions,
} from "../app/services/CognitiveToolkit";

describe("CognitiveToolkit", () => {
  it("detectDistortions обнаруживает паттерны", () => {
    const matches = detectDistortions("Это катастрофа, я всегда проваливаюсь");
    expect(matches.length).toBeGreaterThanOrEqual(2);
    const labels = summarizeDistortions(matches);
    expect(labels).toContain("Катастрофизация");
    expect(labels.some((label) => /мышление/.test(label))).toBe(true);
  });

  it("craftReframe формирует подсказку", () => {
    const suggestion = craftReframe(
      "Я уверен, что все думают, будто я не справлюсь",
      "тревога",
      70,
    );
    expect(suggestion).toMatch(/Подумайте/);
    expect(suggestion).toMatch(/тревога/);
  });

  it("craftReframe без искажений", () => {
    const suggestion = craftReframe("Мне просто грустно", "грусть", 40);
    expect(suggestion).toMatch(/грусть/);
    expect(suggestion).toMatch(/факты/);
  });
});
