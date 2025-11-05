import { describe, expect, it } from "vitest";
import { StorageService } from "../app/services/StorageService";

type MoodEntry = {
  id: string;
  createdAt: string;
  moodLevel: number;
  energyLevel: number;
  focus: string;
};

class MemoryOnlyStorage extends StorageService {
  // eslint-disable-next-line class-methods-use-this
  protected hasIndexedDB(): boolean {
    return false;
  }
}

describe("StorageService", () => {
  it("сохраняет и возвращает данные в памяти", async () => {
    const storage = new MemoryOnlyStorage("test-db");
    const entry: MoodEntry = {
      id: "m1",
      createdAt: new Date().toISOString(),
      moodLevel: 70,
      energyLevel: 65,
      focus: "ценности",
    };

    await storage.save("moodEntries", entry);
    const result = await storage.all<MoodEntry>("moodEntries");

    expect(result).toHaveLength(1);
    expect(result[0]?.moodLevel).toBe(70);
  });
});
