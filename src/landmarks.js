// MediaPipe Face Mesh landmark indices
export const IDX = {
  chin: 152,
  foreheadTop: 10,
  leftCheek: 234,
  rightCheek: 454,
  leftEyeOuter: 33,
  leftEyeInner: 133,
  rightEyeOuter: 263,
  rightEyeInner: 362,
  noseTip: 1,
  noseBridge: 6,
  noseLeft: 98,
  noseRight: 327,
  mouthLeft: 61,
  mouthRight: 291,
  leftJaw: 172,
  rightJaw: 397,
};

function dist(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function angle(a, b, c) {
  const abx = a.x - b.x;
  const aby = a.y - b.y;
  const cbx = c.x - b.x;
  const cby = c.y - b.y;
  const dot = abx * cbx + aby * cby;
  const magAB = Math.sqrt(abx * abx + aby * aby);
  const magCB = Math.sqrt(cbx * cbx + cby * cby);
  if (!magAB || !magCB) return 0;
  const cos = Math.min(1, Math.max(-1, dot / (magAB * magCB)));
  return (Math.acos(cos) * 180) / Math.PI;
}

function get(landmarks, index) {
  return landmarks.find((l) => l.index === index) || null;
}

export function computeRatios(frontLandmarks) {
  const ratios = {};
  const g = (i) => get(frontLandmarks, i);

  const forehead = g(IDX.foreheadTop);
  const chin = g(IDX.chin);
  const leftCheek = g(IDX.leftCheek);
  const rightCheek = g(IDX.rightCheek);
  const noseTip = g(IDX.noseTip);
  const noseBridge = g(IDX.noseBridge);
  const leftEyeOuter = g(IDX.leftEyeOuter);
  const rightEyeOuter = g(IDX.rightEyeOuter);
  const leftEyeInner = g(IDX.leftEyeInner);
  const rightEyeInner = g(IDX.rightEyeInner);
  const mouthLeft = g(IDX.mouthLeft);
  const mouthRight = g(IDX.mouthRight);
  const noseLeft = g(IDX.noseLeft);
  const noseRight = g(IDX.noseRight);
  const leftJaw = g(IDX.leftJaw);
  const rightJaw = g(IDX.rightJaw);

  if (forehead && chin) {
    const faceHeight = dist(forehead, chin);
    if (leftCheek && rightCheek) {
      const faceWidth = dist(leftCheek, rightCheek);
      if (faceHeight > 0) ratios.face_width_to_height = faceWidth / faceHeight;
    }
  }

  if (forehead && chin && noseBridge && noseTip) {
    const total = dist(forehead, chin);
    if (total > 0) {
      ratios.facial_thirds_upper = dist(forehead, noseBridge) / total;
      ratios.facial_thirds_middle = dist(noseBridge, noseTip) / total;
      ratios.facial_thirds_lower = dist(noseTip, chin) / total;
    }
  }

  if (leftEyeOuter && rightEyeOuter && leftEyeInner && rightEyeInner) {
    const leftW = dist(leftEyeOuter, leftEyeInner);
    const rightW = dist(rightEyeOuter, rightEyeInner);
    const avgEye = (leftW + rightW) / 2;
    const inter = dist(leftEyeInner, rightEyeInner);
    if (avgEye > 0) ratios.eye_spacing = inter / avgEye;
  }

  if (noseLeft && noseRight && mouthLeft && mouthRight) {
    const noseW = dist(noseLeft, noseRight);
    const mouthW = dist(mouthLeft, mouthRight);
    if (mouthW > 0) ratios.nose_width_to_mouth = noseW / mouthW;
  }

  if (leftJaw && rightJaw && leftCheek && rightCheek) {
    const jawW = dist(leftJaw, rightJaw);
    const cheekW = dist(leftCheek, rightCheek);
    if (cheekW > 0) ratios.jaw_to_cheek_width = jawW / cheekW;
  }

  if (leftJaw && chin && rightJaw) {
    ratios.jaw_angle = angle(leftJaw, chin, rightJaw);
  }

  return ratios;
}

/** Demo landmarks so the app works before full MediaPipe is connected */
export function demoLandmarks() {
  return [
    { index: IDX.foreheadTop, x: 0.5, y: 0.12, z: 0 },
    { index: IDX.chin, x: 0.5, y: 0.92, z: 0 },
    { index: IDX.leftCheek, x: 0.18, y: 0.48, z: 0 },
    { index: IDX.rightCheek, x: 0.82, y: 0.48, z: 0 },
    { index: IDX.noseTip, x: 0.5, y: 0.52, z: 0 },
    { index: IDX.noseBridge, x: 0.5, y: 0.38, z: 0 },
    { index: IDX.noseLeft, x: 0.42, y: 0.5, z: 0 },
    { index: IDX.noseRight, x: 0.58, y: 0.5, z: 0 },
    { index: IDX.leftEyeOuter, x: 0.28, y: 0.35, z: 0 },
    { index: IDX.leftEyeInner, x: 0.4, y: 0.35, z: 0 },
    { index: IDX.rightEyeOuter, x: 0.72, y: 0.35, z: 0 },
    { index: IDX.rightEyeInner, x: 0.6, y: 0.35, z: 0 },
    { index: IDX.mouthLeft, x: 0.38, y: 0.68, z: 0 },
    { index: IDX.mouthRight, x: 0.62, y: 0.68, z: 0 },
    { index: IDX.leftJaw, x: 0.22, y: 0.72, z: 0 },
    { index: IDX.rightJaw, x: 0.78, y: 0.72, z: 0 },
  ];
}
