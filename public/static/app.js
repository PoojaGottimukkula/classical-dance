// API builder: uses `window.API_BASE` if set (for direct backend URL),
// otherwise uses relative `/api/` which Vercel will route to its functions.
const API = (path) => {
  if (typeof window !== 'undefined' && window.API_BASE) {
    const base = window.API_BASE.replace(/\/$/, '');
    return `${base}/${path}`;
  }
  return `/api/${path}`;
};

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
    d.innerHTML = `<h3>${t.title}</h3><p class='muted'>${t.summary}</p>`;
    const list = document.createElement('div');
    (t.lessons||[]).forEach(l => {
      const b = document.createElement('button');
      b.textContent = l.title;
      b.dataset.tier = t.id;
      b.dataset.lesson = l.id;
      b.className = 'lesson-btn';
      b.addEventListener('click', () => openLesson(t.id, l.id));
      list.appendChild(b);
    });
    d.appendChild(list);
    el.appendChild(d);
  });
}

function renderLessonDetails(tier, lesson) {
  const notes = document.getElementById('lesson-notes');
  notes.innerHTML = `<h3>${lesson.title}</h3><p>${lesson.notes}</p><h4>Practice Steps</h4><ol>${(lesson.practiceSteps||[]).map(s=>`<li>${s}</li>`).join('')}</ol>`;
  document.getElementById('lesson-title').textContent = `${tier.title} — ${lesson.title}`;
  const sel = document.getElementById('anim-select');
  sel.innerHTML = '<option value="">— Animation —</option>';
  if (lesson.animationHint) {
    const opt = document.createElement('option');
    opt.value = lesson.animationHint;
    opt.textContent = `Demo: ${lesson.animationHint}`;
    sel.appendChild(opt);
  }
}

async function openLesson(tierId, lessonId) {
  const res = await fetch(API(`syllabus/${tierId}`));
  const t = await res.json();
  const lesson = (t.lessons||[]).find(l=>l.id===lessonId);
  if (lesson) renderLessonDetails(t, lesson);
}

async function init() {
  const syllabus = await fetchSyllabus();
  renderTiers(syllabus);

  await ensureViewer();
  document.getElementById('model-url').value = '/uploads/sample_dancer.glb';
  document.getElementById('load-model').addEventListener('click', async () => {
    const url = document.getElementById('model-url').value;
    const v = await ensureViewer();
    await v.loadModel(url);
    const names = v.listAnimationNames();
    const sel = document.getElementById('anim-select');
    sel.innerHTML = '<option>—</option>' + names.map(n => `<option value="${n}">${n}</option>`).join('');
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

  document.getElementById('wireframe').addEventListener('change', async (e) => {
    const v = await ensureViewer();
    v.setWireframe(e.target.checked);
  });
  document.getElementById('skeleton').addEventListener('change', async (e) => {
    const v = await ensureViewer();
    v.setSkeletonVisible(e.target.checked);
  });

  document.getElementById('preset-front').addEventListener('click', async ()=>{(await ensureViewer()).setCameraPreset('front')});
  document.getElementById('preset-side').addEventListener('click', async ()=>{(await ensureViewer()).setCameraPreset('side')});
  document.getElementById('preset-top').addEventListener('click', async ()=>{(await ensureViewer()).setCameraPreset('top')});

  document.getElementById('practice').addEventListener('click', async () => {
    try {
      const form = new FormData();
      form.append('user_id', 'demo-user');
      form.append('lesson', 'foundations/araimandi');
      form.append('progress', '1.0');
      await fetch(API('progress'), { method: 'POST', body: form });
      const p = await fetch(API('progress'));
      document.getElementById('progress-json').textContent = JSON.stringify(await p.json(), null, 2);
    } catch (e) {
      console.warn('Progress API failed', e);
    }
  });

  document.getElementById('achievement').addEventListener('click', async () => {
    try {
      const form = new FormData();
      form.append('user_id', 'demo-user');
      form.append('achievement', 'First Araimandi');
      await fetch(API('achievements'), { method: 'POST', body: form });
      const a = await fetch(API('achievements'));
      alert('Achievements: ' + JSON.stringify(await a.json()));
    } catch (e) {
      console.warn('Achievements API failed', e);
    }
  });
}

init();
