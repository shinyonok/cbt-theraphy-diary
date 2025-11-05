export type StoreKey =
  | "thoughtEntries"
  | "moodEntries"
  | "activities"
  | "breathingSessions"
  | "reminders";

export interface ThoughtEntry {
  id: string;
  createdAt: string;
  situation: string;
  automaticThought: string;
  emotion: string;
  intensity: number;
  distortionTags: string[];
  reframedThought: string;
  experimentPlan?: string;
}

export interface MoodEntry {
  id: string;
  createdAt: string;
  moodLevel: number;
  energyLevel: number;
  focus: string;
  note?: string;
}

export interface ActivityPlan {
  id: string;
  scheduledFor: string;
  domain: "эмоциональное" | "социальное" | "профессиональное" | "здоровье";
  description: string;
  vitalityScore: number;
  commitment: "низкий" | "средний" | "высокий";
  status: "запланировано" | "выполнено" | "отложено";
}

export interface BreathingSession {
  id: string;
  startedAt: string;
  protocol: string;
  cyclesCompleted: number;
  perceivedEffect: "спокоен" | "сфокусирован" | "энергичен" | "расслаблен";
}

export interface Reminder {
  id: string;
  title: string;
  time: string;
  frequency: "ежедневно" | "еженедельно" | "разово";
  channel: "уведомление" | "email" | "звук";
  note?: string;
  active: boolean;
}

export type Persistable =
  | ThoughtEntry
  | MoodEntry
  | ActivityPlan
  | BreathingSession
  | Reminder;
