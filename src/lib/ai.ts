export function generateToolboxTalk(topic: string, audience: string, duration: string) {
  const t = topic.toLowerCase();
  const extras = t.includes('dust')
    ? [
        'Verify local exhaust ventilation before grain transfer.',
        'Use non-sparking tools in classified dust zones.',
        'Ground augers and conveyors to control static.',
      ]
    : t.includes('forklift') || t.includes('pedestrian')
      ? [
          'Hold a 3-metre exclusion zone around moving plant.',
          'Sound the horn at every warehouse cross-aisle.',
          'Class 2 hi-vis is mandatory in Dock B and silo yards.',
        ]
      : t.includes('fire')
        ? [
            'Know the nearest extinguisher type for the fuel present.',
            'Keep emergency exits and assembly points unobstructed.',
            'Raise the alarm before attempting to fight a growing fire.',
          ]
        : t.includes('electrical') || t.includes('loto')
          ? [
              'Achieve a verified zero-energy state before opening guards.',
              'Apply your personal padlock — never share keys.',
              'Test the start button after isolation.',
            ]
          : [
              'Stop, look, and assess before the task starts.',
              'Wear the PPE issued for this activity.',
              'Report near-misses in Productivity OSHAPP before the shift ends.',
            ];

  return [
    `1. Opening — OSHA 2007 Sec. 6 (Duty of Care)`,
    `This ${duration} briefing is for ${audience}. Topic: ${topic}.`,
    ``,
    `2. Why it matters on Kenyan sites`,
    `Employers must inform workers of hazards, provide a safe system of work, and keep records for DOSHS inspection.`,
    ``,
    `3. Controls to apply this shift`,
    ...extras.map((line, i) => `   ${i + 1}. ${line}`),
    ``,
    `4. Discussion prompt`,
    `Name one control you will personally apply in the next hour.`,
    ``,
    `5. Close & attendance`,
    `Sign the toolbox talk register. Raise any new hazard before leaving the huddle.`,
  ].join('\n');
}
