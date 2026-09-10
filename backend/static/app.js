// API builder: uses `window.API_BASE` if set (for direct backend URL),
// otherwise uses relative `/api/` which can be proxied by Vercel rewrites.
const API = (path) => {
  if (typeof window !== 'undefined' && window.API_BASE) {
    const base = window.API_BASE.replace(/\/$/, '');
    return `${base}/${path}`;
  }
  return `/api/${path}`;
};

// Three viewer bridge (dynamically import the helper module)
let viewer = null;
async function ensureViewer() {
  if (!viewer) {
    const mod = await import('./three-viewer.js');
    viewer = mod.default || mod;
  }
  return viewer;
}

async function fetchSyllabus() {
  const res = await fetch(API('syllabus'));
  return res.json();
}

function renderTiers(syllabus) {
  const el = document.getElementById('tiers');
  el.innerHTML = '';
  syllabus.tiers.forEach(t => {
    const d = document.createElement('div');
    d.className = 'tier';
    d.innerHTML = `<h3>${t.title}</h3><p>${t.summary}</p><button data-id='${t.id}' class='open-lesson'>Open</button>`;
    el.appendChild(d);
  });
}

async function init() {
  const syllabus = await fetchSyllabus();
  renderTiers(syllabus);

  // initialize three viewer
  await ensureViewer();
  document.getElementById('model-url').value = '/uploads/sample_dancer.glb';
  document.getElementById('load-model').addEventListener('click', async () => {
    const url = document.getElementById('model-url').value;
    const v = await ensureViewer();
    await v.loadModel(url);
    // populate animations
    const names = v.listAnimationNames();
    const sel = document.getElementById('anim-select');
    sel.innerHTML = '<option>—</option>' + names.map(n => `<option>${n}</option>`).join('');
  });
  document.getElementById('play-anim').addEventListener('click', async () => {
    const sel = document.getElementById('anim-select');
    const name = sel.value;
    const v = await ensureViewer();
    v.play(name);
  });
  document.getElementById('pause-anim').addEventListener('click', async () => {
    const v = await ensureViewer();
    v.pause();
  });
  document.getElementById('speed').addEventListener('input', async (e) => {
    const v = await ensureViewer();
    v.setSpeed(parseFloat(e.target.value));
  });

  document.getElementById('practice').addEventListener('click', async () => {
    // Mark progress for demo user
    const form = new FormData();
    form.append('user_id', 'demo-user');
    form.append('lesson', 'foundations/araimandi');
    form.append('progress', '1.0');
    await fetch(API('progress'), { method: 'POST', body: form });
    const p = await fetch(API('progress/demo-user'));
    document.getElementById('progress-json').textContent = JSON.stringify(await p.json(), null, 2);
  });

  document.getElementById('achievement').addEventListener('click', async () => {
    const form = new FormData();
    form.append('user_id', 'demo-user');
    form.append('achievement', 'First Araimandi');
    await fetch(API('achievements'), { method: 'POST', body: form });
    const a = await fetch(API('achievements/demo-user'));
    alert('Achievements: ' + JSON.stringify(await a.json()));
  });
}

init();
