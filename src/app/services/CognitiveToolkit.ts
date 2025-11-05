export interface DistortionRule {
  id: string;
  label: string;
  patterns: RegExp[];
  reframePrompts: string[];
}

const distortionRules: DistortionRule[] = [
  {
    id: "catastrophizing",
    label: "Катастрофизация",
    patterns: [/(ужас|катастроф|никогда не|все пропало)/i],
    reframePrompts: [
      "Какие факты подтверждают и опровергают самый худший сценарий?",
      "Какой наиболее реалистичный исход?",
    ],
  },
  {
    id: "polarizing",
    label: "Дихотомическое мышление",
    patterns: [/(всегда|никогда|чёрн|бел)/i],
    reframePrompts: [
      "Что находится между полярными крайностями?",
      "Какие оттенки серого я упускаю?",
    ],
  },
  {
    id: "mind-reading",
    label: "Чтение мыслей",
    patterns: [/(они думают|все считают|я уверен,? что)/i],
    reframePrompts: [
      "Какие нейтральные объяснения существуют для поведения других?",
      "Что я могу проверить напрямую?",
    ],
  },
  {
    id: "overgeneralizing",
    label: "Сверхобобщение",
    patterns: [/(вс[eё]|никому|ничто|опять|вечно)/i],
    reframePrompts: [
      "Где я уже сталкивался с другим исходом?",
      "Какие исключения есть из этого правила?",
    ],
  },
  {
    id: "self-criticism",
    label: "Жёсткая самооценка",
    patterns: [/(я неудачник|я ужасен|я подвел|со мной что-то не так)/i],
    reframePrompts: [
      "Как бы я поддержал друга в похожей ситуации?",
      "Какие сильные стороны помогают мне справляться?",
    ],
  },
];

export function detectDistortions(text: string): DistortionRule[] {
  return distortionRules.filter((rule) =>
    rule.patterns.some((pattern) => pattern.test(text)),
  );
}

export function craftReframe(
  text: string,
  emotion: string,
  intensity: number,
): string {
  const matches = detectDistortions(text);
  if (!matches.length) {
    return `Заметьте эмоцию («${emotion}», интенсивность ${intensity}/100) и сформулируйте более поддерживающую мысль, опираясь на факты.`;
  }

  const prompts = matches.flatMap((match) => match.reframePrompts);
  const prompt = prompts[0];
  return `${prompt} Подумайте, как можно уменьшить интенсивность эмоции «${emotion}».`;
}

export function summarizeDistortions(matches: DistortionRule[]): string[] {
  return matches.map((match) => match.label);
}

export const guidelineHighlights = {
  year: 2025,
  sources: [
    "Beck Institute CBT Field Update",
    "WHO Mental Health Gap BA refresh",
    "Association for Contextual Behavioral Science ACT 2025",
  ],
  focus:
    "Внимательное отслеживание ценностей, работа с телесными сигналами и микро-поведенческие эксперименты.",
};
