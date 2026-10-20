// Original scoring engine – not a copy of any commercial product

const IDEAL = {
  facial_thirds_upper: [0.30, 0.36],
  facial_thirds_middle: [0.30, 0.36],
  facial_thirds_lower: [0.30, 0.36],
  eye_spacing: [0.90, 1.15],
  nose_width_to_mouth: [0.65, 0.85],
  jaw_to_cheek_width: [0.75, 0.95],
  face_width_to_height: [0.70, 0.85],
  jaw_angle: [115, 135],
};

function scoreAgainstRange(value, min, max) {
  const mid = (min + max) / 2;
  const half = (max - min) / 2;

  if (value >= min && value <= max) {
    const dist = Math.abs(value - mid) / half;
    return 10 - dist * 1.5;
  }

  const outside = value < min ? min - value : value - max;
  const penalty = outside / half;
  return Math.max(1, 8 - penalty * 3);
}

function labelFor(score) {
  if (score >= 9) return 'Excellent';
  if (score >= 7.5) return 'Very Good';
  if (score >= 6) return 'Good';
  if (score >= 4.5) return 'Average';
  if (score >= 3) return 'Below Average';
  return 'Needs Work';
}

function avg(arr) {
  if (!arr.length) return 6;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function analyze(ratios) {
  // Harmony
  const harmonyKeys = [
    'facial_thirds_upper',
    'facial_thirds_middle',
    'facial_thirds_lower',
    'eye_spacing',
    'nose_width_to_mouth',
    'face_width_to_height',
  ];
  const harmonyScores = harmonyKeys
    .filter((k) => ratios[k] != null && IDEAL[k])
    .map((k) => scoreAgainstRange(ratios[k], ...IDEAL[k]));
  const harmony = avg(harmonyScores);

  // Structure
  const structureKeys = ['jaw_angle', 'jaw_to_cheek_width', 'face_width_to_height'];
  const structureScores = structureKeys
    .filter((k) => ratios[k] != null && IDEAL[k])
    .map((k) => scoreAgainstRange(ratios[k], ...IDEAL[k]));
  const structure = avg(structureScores);

  // Dimorphism (simplified)
  let dimorphism = 6.2;
  if (ratios.jaw_to_cheek_width != null) {
    dimorphism = scoreAgainstRange(ratios.jaw_to_cheek_width, 0.80, 0.98);
  }

  // Features (placeholder until we add image-based analysis)
  const features = 6.8;

  // Overall (power mean)
  const overall = Math.pow(
    (Math.pow(harmony, 1.5) +
      Math.pow(structure, 1.5) +
      Math.pow(dimorphism, 1.5) +
      Math.pow(features, 1.5)) /
      4,
    1 / 1.5
  );

  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ratios,
    harmony: {
      name: 'Harmony',
      score: +harmony.toFixed(2),
      label: labelFor(harmony),
    },
    structure: {
      name: 'Structure',
      score: +structure.toFixed(2),
      label: labelFor(structure),
    },
    dimorphism: {
      name: 'Dimorphism',
      score: +dimorphism.toFixed(2),
      label: labelFor(dimorphism),
    },
    features: {
      name: 'Features',
      score: +features.toFixed(2),
      label: labelFor(features),
    },
    overallScore: +overall.toFixed(2),
    overallLabel: labelFor(overall),
  };
}
