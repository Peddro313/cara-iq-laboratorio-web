const KEY = 'cara_iq_web_analyses';

export function getAllAnalyses() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch {
    return [];
  }
}

export function getAnalysis(id) {
  return getAllAnalyses().find((a) => a.id === id) || null;
}

export function saveAnalysis(analysis) {
  const list = getAllAnalyses();
  const idx = list.findIndex((a) => a.id === analysis.id);
  if (idx >= 0) list[idx] = analysis;
  else list.unshift(analysis);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function clearAnalyses() {
  localStorage.removeItem(KEY);
}
