import { analyze } from './scoring.js';
import { computeRatios, demoLandmarks } from './landmarks.js';
import { getAllAnalyses, getAnalysis, saveAnalysis } from './storage.js';

const app = document.getElementById('app');

let frontFile = null;
let sideFile = null;
let frontUrl = null;
let sideUrl = null;

// ---------- ROUTER ----------
function navigate(path) {
  window.location.hash = path;
  render();
}

function currentPath() {
  return window.location.hash.slice(1) || '/';
}

window.addEventListener('hashchange', render);

// ---------- RENDER ----------
function render() {
  const path = currentPath();

  if (path === '/') return renderHome();
  if (path === '/upload') return renderUpload();
  if (path.startsWith('/result/')) {
    const id = path.split('/')[2];
    return renderResult(id);
  }
  if (path === '/history') return renderHistory();
  renderHome();
}

// ---------- SCREENS ----------
function renderHome() {
  app.innerHTML = `
    <header>
      <h1>Cara IQ Laboratório</h1>
      <p>Your face. Measured. Tracked. Improved.</p>
    </header>

    <div class="card">
      <p style="margin-bottom:16px;color:var(--text-secondary)">
        Analyze your face across four pillars and track your progress over time.
      </p>
      <div style="display:grid;gap:10px">
        <div class="pillar"><span class="pillar-name">Harmony</span><span>Proportions & balance</span></div>
        <div class="pillar"><span class="pillar-name">Structure</span><span>Jaw & bone definition</span></div>
        <div class="pillar"><span class="pillar-name">Dimorphism</span><span>Gender-typical traits</span></div>
        <div class="pillar"><span class="pillar-name">Features</span><span>Surface quality</span></div>
      </div>
    </div>

    <button class="btn" id="btn-start">Start New Analysis</button>
    <div style="height:12px"></div>
    <button class="btn btn-outline" id="btn-history">View Progress</button>
  `;

  document.getElementById('btn-start').onclick = () => navigate('/upload');
  document.getElementById('btn-history').onclick = () => navigate('/history');
}

function renderUpload() {
  app.innerHTML = `
    <header>
      <h1>Upload Photos</h1>
      <p>Front + side profile required</p>
    </header>

    <div class="card">
      <p class="tips">
        <strong>For best results:</strong><br>
        • Neutral expression, mouth closed<br>
        • Good, even lighting<br>
        • Camera at eye level<br>
        • Front: looking straight at camera<br>
        • Side: true 90° profile
      </p>
    </div>

    <div class="photo-grid">
      <div class="photo-slot" id="slot-front">
        ${frontUrl ? `<img src="${frontUrl}" alt="Front">` : '<span>+ Front</span>'}
      </div>
      <div class="photo-slot" id="slot-side">
        ${sideUrl ? `<img src="${sideUrl}" alt="Side">` : '<span>+ Side Profile</span>'}
      </div>
    </div>

    <input type="file" id="input-front" accept="image/*" hidden>
    <input type="file" id="input-side" accept="image/*" hidden>

    <button class="btn" id="btn-analyze" ${frontFile && sideFile ? '' : 'disabled'}>
      Analyze Face
    </button>
    <div style="height:12px"></div>
    <button class="btn btn-outline" id="btn-back">Back</button>
  `;

  if (frontUrl) document.getElementById('slot-front').classList.add('has-photo');
  if (sideUrl) document.getElementById('slot-side').classList.add('has-photo');

  document.getElementById('slot-front').onclick = () => document.getElementById('input-front').click();
  document.getElementById('slot-side').onclick = () => document.getElementById('input-side').click();

  document.getElementById('input-front').onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    frontFile = file;
    if (frontUrl) URL.revokeObjectURL(frontUrl);
    frontUrl = URL.createObjectURL(file);
    renderUpload();
  };

  document.getElementById('input-side').onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    sideFile = file;
    if (sideUrl) URL.revokeObjectURL(sideUrl);
    sideUrl = URL.createObjectURL(file);
    renderUpload();
  };

  document.getElementById('btn-analyze').onclick = runAnalysis;
  document.getElementById('btn-back').onclick = () => navigate('/');
}

async function runAnalysis() {
  const btn = document.getElementById('btn-analyze');
  btn.disabled = true;
  btn.textContent = 'Analyzing…';

  // Simulate processing time. Later this will run real MediaPipe.
  await new Promise((r) => setTimeout(r, 1200));

  const landmarks = demoLandmarks();
  const ratios = computeRatios(landmarks);
  const result = analyze(ratios);

  // Keep a small reference to the photos (data URLs would be large; we just store scores for now)
  saveAnalysis(result);

  navigate(`/result/${result.id}`);
}

function renderResult(id) {
  const result = getAnalysis(id);
  if (!result) {
    app.innerHTML = `<div class="loading">Analysis not found.<br><br><button class="btn" onclick="location.hash='/'">Home</button></div>`;
    return;
  }

  const date = new Date(result.createdAt).toLocaleString();

  const pillars = [result.harmony, result.structure, result.dimorphism, result.features]
    .map(
      (p) => `
      <div class="pillar">
        <div>
          <div class="pillar-name">${p.name}</div>
          <div style="font-size:0.85rem;color:var(--text-secondary)">${p.label}</div>
        </div>
        <div class="pillar-score">${p.score.toFixed(1)}</div>
      </div>`
    )
    .join('');

  const ratiosHtml = Object.entries(result.ratios || {})
    .map(
      ([k, v]) => `
      <div class="ratio-row">
        <span>${k.replaceAll('_', ' ')}</span>
        <strong>${typeof v === 'number' ? v.toFixed(3) : v}</strong>
      </div>`
    )
    .join('');

  app.innerHTML = `
    <header>
      <h1>Analysis Result</h1>
      <p>${date}</p>
    </header>

    <div class="card score-big">
      <div class="value">${result.overallScore.toFixed(1)}</div>
      <div class="label">${result.overallLabel}</div>
      <div style="font-size:0.85rem;color:var(--text-secondary);margin-top:6px">Overall Score</div>
    </div>

    <div class="card">
      <h3 style="margin-bottom:12px">Pillars</h3>
      ${pillars}
    </div>

    ${ratiosHtml ? `<div class="card"><h3 style="margin-bottom:12px">Key Ratios</h3>${ratiosHtml}</div>` : ''}

    <div class="nav">
      <button class="btn btn-outline" id="btn-home">Home</button>
      <button class="btn" id="btn-hist">History</button>
    </div>
  `;

  document.getElementById('btn-home').onclick = () => navigate('/');
  document.getElementById('btn-hist').onclick = () => navigate('/history');
}

function renderHistory() {
  const list = getAllAnalyses();

  if (!list.length) {
    app.innerHTML = `
      <header><h1>Progress</h1></header>
      <div class="card" style="text-align:center;padding:40px 20px">
        <p style="color:var(--text-secondary);margin-bottom:20px">No analyses yet</p>
        <button class="btn" id="btn-start">Start First Analysis</button>
      </div>
    `;
    document.getElementById('btn-start').onclick = () => navigate('/upload');
    return;
  }

  const items = list
    .map(
      (a) => `
      <div class="history-item" data-id="${a.id}">
        <div class="history-score">${a.overallScore.toFixed(1)}</div>
        <div style="flex:1">
          <div style="font-weight:600">${new Date(a.createdAt).toLocaleDateString()}</div>
          <div style="font-size:0.85rem;color:var(--text-secondary)">
            ${a.overallLabel} · H:${a.harmony.score} S:${a.structure.score}
          </div>
        </div>
        <span style="color:var(--text-secondary)">›</span>
      </div>`
    )
    .join('');

  app.innerHTML = `
    <header>
      <h1>Progress & History</h1>
      <p>${list.length} analysis${list.length > 1 ? 'es' : ''}</p>
    </header>

    <div class="card">
      ${items}
    </div>

    <button class="btn" id="btn-new">New Analysis</button>
    <div style="height:12px"></div>
    <button class="btn btn-outline" id="btn-home">Home</button>
  `;

  document.querySelectorAll('.history-item').forEach((el) => {
    el.onclick = () => navigate(`/result/${el.dataset.id}`);
  });
  document.getElementById('btn-new').onclick = () => navigate('/upload');
  document.getElementById('btn-home').onclick = () => navigate('/');
}

// Start
render();
