import { describe, expect, it } from "vitest";
import { ReminderService } from "../app/services/ReminderService";
import { ReminderModule } from "../app/modules/ReminderModule";

void ReminderModule;

describe("ReminderService", () => {
  it("сортирует и фильтрует напоминания", () => {
    const now = new Date();
    const nextMinute = new Date(now.getTime() + 60_000);
    const pad = (value: number) => String(value).padStart(2, "0");

    const baseline = [
      {
        id: "1",
        title: "Утреннее дыхание",
        time: `${pad(nextMinute.getHours())}:${pad(nextMinute.getMinutes())}`,
        frequency: "ежедневно" as const,
        channel: "уведомление" as const,
        active: true,
      },
      {
        id: "2",
        title: "Письмо благодарности",
        time: "06:30",
        frequency: "еженедельно" as const,
        channel: "email" as const,
        active: true,
      },
      {
        id: "3",
        title: "Отключено",
        time: "22:00",
        frequency: "разово" as const,
        channel: "звук" as const,
        active: false,
      },
    ];

    const service = new ReminderService([...baseline]);
    const upcoming = service.upcoming;

    expect(upcoming.length).toBeLessThanOrEqual(2);
    expect(upcoming.every((item) => item.active)).toBe(true);
    expect(upcoming[0]?.title).toBe("Утреннее дыхание");
  });
});
