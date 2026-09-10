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
  // request that the loaded model (when ready) auto-play a mapped animation
  window.lessonToAutoPlay = lessonId;
}

function computeClipForLesson(lessonId, names) {
  if (!names || !names.length) return null;
  const m = lessonId.match(/^tatta_(\d+)$/);
  let idx = 0;
  if (m) {
    idx = (parseInt(m[1],10)-1);
  } else {
    let s = 0; for (let i=0;i<lessonId.length;i++) s += lessonId.charCodeAt(i);
    idx = s;
  }
  return names[idx % names.length];
}

async function init() {
  const syllabus = await fetchSyllabus();
  renderTiers(syllabus);

  await ensureViewer();
  // default to a human-like animated model so the viewer can perform adavus
  document.getElementById('model-url').value = 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb';
  document.getElementById('load-model').addEventListener('click', async () => {
    const url = document.getElementById('model-url').value;
    const v = await ensureViewer();
    await v.loadModel(url);
    const names = v.listAnimationNames();
    window.availableAnimationNames = names;
    const sel = document.getElementById('anim-select');
    sel.innerHTML = '<option value="">— Animation —</option>' + names.map(n => `<option value="${n}">${n}</option>`).join('');
    // if a lesson requested an auto-play, pick a clip mapped to the lesson
    if (window.lessonToAutoPlay) {
      const clip = computeClipForLesson(window.lessonToAutoPlay, names);
      if (clip) {
        sel.value = clip;
        v.play(clip);
      }
      window.lessonToAutoPlay = null;
    }
    const playBtn = document.getElementById('play-anim');
    const pauseBtn = document.getElementById('pause-anim');
    const hint = document.getElementById('anim-hint');
    if (!names || names.length === 0) {
      // disable controls when no animations
      if (playBtn) playBtn.disabled = true;
      if (pauseBtn) pauseBtn.disabled = true;
      if (hint) hint.textContent = 'No animations found in this model.';
    } else {
      if (playBtn) playBtn.disabled = false;
      if (pauseBtn) pauseBtn.disabled = false;
      if (hint) hint.textContent = 'Select an animation and press play.';
    }
  });
  const playAnim = document.getElementById('play-anim');
  const pauseAnim = document.getElementById('pause-anim');
  playAnim?.addEventListener('click', async () => {
    const sel = document.getElementById('anim-select');
    const name = sel?.value || '';
    const v = await ensureViewer();
    v.play(name);
    if (playAnim) playAnim.disabled = true;
    if (pauseAnim) pauseAnim.disabled = false;
  });
  pauseAnim?.addEventListener('click', async () => {
    const v = await ensureViewer();
    v.pause();
    if (playAnim) playAnim.disabled = false;
    if (pauseAnim) pauseAnim.disabled = true;
  });

  // Auto-play when selecting an animation from the dropdown
  document.getElementById('anim-select')?.addEventListener('change', async (e) => {
    const val = e.target.value;
    if (!val) return;
    const v = await ensureViewer();
    v.play(val);
    if (playAnim) playAnim.disabled = true;
    if (pauseAnim) pauseAnim.disabled = false;
  });
  // three discrete speed levels: Slow(0.5), Normal(1), Fast(2)
  const setSpeedLevel = async (level) => {
    const v = await ensureViewer();
    const map = { slow: 0.5, normal: 1, fast: 2 };
    v.setSpeed(map[level] || 1);
    // update speed slider if present
    const slider = document.getElementById('speed');
    if (slider) slider.value = map[level] || 1;
  };
  document.getElementById('speed-slow')?.addEventListener('click', ()=>setSpeedLevel('slow'));
  document.getElementById('speed-normal')?.addEventListener('click', ()=>setSpeedLevel('normal'));
  document.getElementById('speed-fast')?.addEventListener('click', ()=>setSpeedLevel('fast'));

  // simple rhythm/metronome player for practice steps
  let rhythmTimer = null;
  const rhythmPattern = ['ta','tum','ta','ta'];
  let rhythmIndex = 0;
  let rhythmInterval = 600; // ms default
  function playBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 800;
      o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
      o.start();
      setTimeout(()=>{ o.stop(); ctx.close(); }, 120);
    } catch(e){ console.warn('Audio error', e); }
  }
  document.getElementById('play-rhythm')?.addEventListener('click', ()=>{
    if (rhythmTimer) { clearInterval(rhythmTimer); rhythmTimer = null; return; }
    // read current speed multiplier
    const s = document.getElementById('speed') ? parseFloat(document.getElementById('speed').value) : 1;
    rhythmInterval = Math.round(600 / s);
    rhythmIndex = 0;
    playBeep();
    rhythmTimer = setInterval(()=>{ playBeep(); rhythmIndex = (rhythmIndex+1) % rhythmPattern.length; }, rhythmInterval);
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
