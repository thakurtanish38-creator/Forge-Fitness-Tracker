import React, { useEffect, useRef, useState } from 'react';
import { FOODS as FOOD_LIST, FOOD_CATEGORIES, foodCategory, foodMatchesQuery, foodServingGrams, foodMacrosForGrams } from './data.js';
import { readState, saveState } from './storage.js';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
const EXERCISES = {
  Gym: [['Bench Press', .45], ['Squat', .55], ['Deadlift', .6], ['Lat Pulldown', .4], ['Shoulder Press', .4], ['Bicep Curl', .25]],
  Hypertrophy: [['Dumbbell Curl', .25], ['Push-ups', .35], ['Dumbbell Row', .4], ['Dumbbell Fly', .3]],
  Cardio: [['Running', 10], ['Cycling', 8], ['Jump Rope', 12], ['Incline Walk', 6]],
  Mobility: [['Dynamic Stretching', .035], ['Yoga Flow', .045], ['Foam Rolling', .025]],
  Recovery: [['Breathwork', .01], ['Easy Walk', .04], ['Gentle Mobility', .025]],
  Sports: [['Cricket', 5], ['Football', 9], ['Badminton', 7], ['Swimming', 9]],
};
const workoutCategoryArt = {
  Gym: ['/images/hero-training.jpg', 'Strength', 'Barbell strength training'],
  Hypertrophy: ['/images/workout-dumbbell-curl.jpg', 'Hypertrophy', 'Focused dumbbell training'],
  Cardio: ['/images/workout-cycling.jpg', 'Cardio', 'Cyclists training together on the road'],
  Mobility: ['/images/recovery-mobility.jpg', 'Mobility', 'Athlete stretching at sunset'],
  Recovery: ['/images/recovery-rest.jpg', 'Recovery', 'Athlete meditating outdoors at sunrise'],
  Sports: ['/images/workout-cricket.jpg', 'Sport', 'Cricket ball resting on a field'],
};
const SPLIT = ['Push (chest, shoulders, triceps)', 'Pull (back, biceps)', 'Legs & core', 'Cardio + mobility', 'Full body'];
const ACCENTS = ['#1e3a8a', '#2563eb', '#0f766e', '#7c3aed', '#be185d'];
const h = React.createElement;
const exerciseImage = name => {
  if (/deadlift/i.test(name)) return ['/images/hero-training.jpg', 'Athlete setting up a barbell deadlift'];
  if (/squat/i.test(name)) return ['/images/workout-squat.jpg', 'Athlete setting up for a barbell squat'];
  if (/push-ups/i.test(name)) return ['/images/workout-push-up.jpg', 'Athlete performing a push-up'];
  if (/curl/i.test(name)) return ['/images/workout-dumbbell-curl.jpg', 'Athlete training with a dumbbell curl'];
  if (/row|pulldown/i.test(name)) return ['/images/workout-dumbbells.jpg', 'Athlete training with a row movement'];
  if (/breathwork/i.test(name)) return ['/images/recovery-rest.jpg', 'Athlete practicing a quiet breathing meditation'];
  if (/stretch|yoga|mobility|rolling/i.test(name)) return ['/images/recovery-mobility.jpg', 'Athlete stretching outdoors'];
  if (/running|incline walk/i.test(name)) return ['/images/workout-progress.jpg', 'Athletes running together at dusk'];
  if (/cycling/i.test(name)) return ['/images/workout-cycling.jpg', 'Cyclists training together on the road'];
  if (/cricket/i.test(name)) return ['/images/workout-cricket.jpg', 'Cricket ball resting on a field'];
  if (/football/i.test(name)) return ['/images/workout-football.jpg', 'Football and boots on the pitch'];
  if (/badminton/i.test(name)) return ['/images/workout-badminton.jpg', 'Player reaching for a badminton shot'];
  if (/swimming/i.test(name)) return ['/images/workout-swimming.jpg', 'Swimmer training in a pool lane'];
  return null;
};
const foodImage = food => {
  const name = food[0].toLowerCase();
  if (/biryani|curry|masala|chole|rajma|dal|paneer|roti|naan|paratha|idli|dosa|khichdi|poha|upma|pulao|sambar/i.test(name)) {
    return /chicken|mutton|fish|prawn|curry/i.test(name)
      ? ['/images/nutrition-curry.jpg', 'Protein-rich curry served with Indian bread']
      : ['/images/nutrition-indian-meal.jpg', 'Balanced meal with vegetables, grains, and protein'];
  }
  if (/fruit|banana|apple|mango|orange|grape|guava|papaya|strawberr/i.test(name)) return ['/images/nutrition-bowl.jpg', 'Fresh produce and plant-based ingredients'];
  if (/egg|chicken|whey|tofu|fish|prawn|salmon|tuna|turkey|soy|beef|pork|mutton/i.test(name)) return ['/images/nutrition-indian-meal.jpg', 'Balanced meal with grains and protein'];
  if (/vegetable|salad|spinach|broccoli|cucumber|tomato|carrot|cauliflower/i.test(name)) return ['/images/nutrition-bowl.jpg', 'Colorful vegetables and nourishing ingredients'];
  return ['/images/nutrition-prep.jpg', 'Fresh ingredients prepared for a meal'];
};
const localDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const today = () => localDate(new Date());
const daysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return localDate(d); };
const dayOf = (state, email, date) => (state.logs[email] || {})[date] || { food: [], work: [], waterEntries: [] };
const total = (list, index) => list.reduce((n, row) => n + (+row[index] || 0), 0);
const hasLog = day => day.food.length > 0 || day.work.length > 0;
const hydrationTotal = day => (day.waterEntries || []).reduce((sum, entry) => sum + Number(entry.ml || 0), 0);
const entryId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const PASSWORD_ITERATIONS = 210000;
const toHex = bytes => Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
async function derivePassword(password, salt, iterations = PASSWORD_ITERATIONS) {
  if (!globalThis.crypto?.subtle) throw new Error('Secure password storage is unavailable in this browser.');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256);
  return new Uint8Array(bits);
}
async function hashPassword(password) {
  if (!globalThis.crypto?.getRandomValues) throw new Error('Secure password storage is unavailable in this browser.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const digest = await derivePassword(password, salt);
  return `pbkdf2$${PASSWORD_ITERATIONS}$${toHex(salt)}$${toHex(digest)}`;
}
async function checkPassword(password, user) {
  if (typeof user.passwordHash !== 'string') return { valid: user.pw === password, legacy: true };
  const [, iterationValue, saltHex, digestHex] = user.passwordHash.split('$');
  const iterations = Number(iterationValue);
  if (!Number.isSafeInteger(iterations) || iterations < 100000 || iterations > 1000000 || !/^[a-f0-9]{32}$/.test(saltHex) || !/^[a-f0-9]{64}$/.test(digestHex)) return { valid: false, legacy: false };
  const salt = Uint8Array.from(saltHex.match(/.{2}/g), byte => Number.parseInt(byte, 16));
  const digest = toHex(await derivePassword(password, salt, iterations));
  return { valid: digest === digestHex, legacy: false };
}
const caloriePlan = profile => {
  const weight = +profile.weight || 60;
  const kcal = Math.round((weight * 32 + (profile.type === 'bulky' ? 350 : profile.type === 'aesthetic' ? -250 : 0)) / 10) * 10;
  const protein = Math.round(weight * (profile.type === 'fit' ? 1.6 : 2));
  const fat = Math.round(kcal * .25 / 9);
  const targets = profile.targets || {};
  const targetKcal = Number.isFinite(+targets.kcal) && +targets.kcal > 0 ? +targets.kcal : kcal;
  const targetProtein = Number.isFinite(+targets.protein) && +targets.protein > 0 ? +targets.protein : protein;
  const targetFat = Number.isFinite(+targets.fat) && +targets.fat > 0 ? +targets.fat : fat;
  return {
    kcal: targetKcal,
    protein: targetProtein,
    fat: targetFat,
    carbs: Number.isFinite(+targets.carbs) && +targets.carbs > 0
      ? +targets.carbs
      : Math.max(0, Math.round((targetKcal - targetProtein * 4 - targetFat * 9) / 4)),
  };
};

function Mascot({ size = 56, className = '' }) {
  return <svg aria-hidden="true" className={`mascot ${className}`} width={size} height={size} viewBox="0 0 100 100">
    <rect x="4" y="36" width="14" height="28" rx="5" fill="var(--accent)" />
    <rect x="82" y="36" width="14" height="28" rx="5" fill="var(--accent)" />
    <rect x="14" y="26" width="72" height="48" rx="24" fill="var(--accent)" />
    <circle cx="38" cy="48" r="6" fill="var(--mascot-eye)" /><circle cx="62" cy="48" r="6" fill="var(--mascot-eye)" />
    <circle cx="39" cy="49" r="3" fill="var(--mascot-pupil)" /><circle cx="63" cy="49" r="3" fill="var(--mascot-pupil)" />
    <path d="M40 60q10 9 20 0" stroke="var(--mascot-eye)" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>;
}

function DumbbellMark({ size = 38 }) {
  return <svg aria-hidden="true" className="dumbbell-mark" width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M10 24h28" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <rect x="3" y="14" width="8" height="20" rx="2" fill="currentColor" />
    <rect x="12" y="18" width="5" height="12" rx="1.5" fill="currentColor" />
    <rect x="31" y="18" width="5" height="12" rx="1.5" fill="currentColor" />
    <rect x="37" y="14" width="8" height="20" rx="2" fill="currentColor" />
  </svg>;
}

const hideBrokenImage = event => { event.currentTarget.hidden = true; };

function useCount(value, duration = 380) {
  const [shown, setShown] = useState(value);
  const previous = useRef(value);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(value);
      previous.current = value;
      return undefined;
    }
    const from = previous.current;
    const start = performance.now();
    let frame;
    const tick = now => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(from + (value - from) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
      else previous.current = value;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);
  return shown;
}

function useReveal() {
  useEffect(() => {
    const targets = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      targets.forEach(target => target.classList.add('revealed'));
      return undefined;
    }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    }), { threshold: .12 });
    targets.forEach(target => observer.observe(target));
    return () => observer.disconnect();
  }, []);
}

function Landing({ go, goFeature }) {
  const heroRef = useRef(null);
  const lenisRef = useRef(null);
  useReveal();
  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    const syncMotionPreference = () => {
      if (motionPreference.matches) {
        lenisRef.current?.destroy();
        lenisRef.current = null;
        document.documentElement.style.scrollBehavior = previousScrollBehavior;
        return;
      }
      if (lenisRef.current) return;
      document.documentElement.style.scrollBehavior = 'auto';
      lenisRef.current = new Lenis({
        autoRaf: true,
        smoothWheel: true,
        syncTouch: false,
        anchors: false,
        prevent: node => node.closest('input, textarea, select, [contenteditable="true"], [data-lenis-prevent]') !== null,
      });
    };
    syncMotionPreference();
    motionPreference.addEventListener('change', syncMotionPreference);
    return () => {
      motionPreference.removeEventListener('change', syncMotionPreference);
      lenisRef.current?.destroy();
      lenisRef.current = null;
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
    };
  }, []);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (heroRef.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          heroRef.current.style.setProperty('--hero-shift', `${Math.min(24, window.scrollY * .025)}px`);
        }
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);
  return <main className="landing">
    <header className="site-header landing-header">
      <a className="brand" href="#" onClick={event => {
        event.preventDefault();
        if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: event.detail === 0 });
        else document.documentElement.scrollTop = 0;
      }}><DumbbellMark size={42} /><span>FORGE<small>DAILY, BUILT BETTER</small></span></a>
      <div className="header-actions"><button className="button button-quiet" onClick={() => go('login')}>Log in</button><button className="button button-primary" onClick={() => go('signup')}>Get started <span aria-hidden="true">↗</span></button></div>
    </header>
    <section className="hero" ref={heroRef}>
      <img className="hero-image" src="/images/hero-training.jpg" alt="Athlete setting up for a barbell deadlift in a dramatic, low-lit gym" fetchpriority="high" />
      <div className="hero-shade" />
      <div className="hero-content">
        <div className="eyebrow"><span className="live-dot" /> TRAIN WITH INTENTION. COME BACK STRONGER.</div>
        <h1><span>BUILD</span><span className="headline-outline">YOUR</span><span className="headline-accent">STRONGER.</span></h1>
        <p>Train with purpose, fuel your effort, and see your progress — all in one place.</p>
        <div className="hero-cta"><button className="button button-primary button-large" onClick={() => goFeature('Workout')}>Start Training <span aria-hidden="true">↗</span></button><button className="button hero-secondary button-large" onClick={() => goFeature('Food')}>Track Nutrition <span aria-hidden="true">↗</span></button></div>
      </div>
      <div className="hero-side-note">FOR THE WORK<br />YOU PUT IN</div>
      <div className="hero-foot"><span>FORGE / TRAIN · FUEL · PROGRESS</span><span>YOUR NEXT SET STARTS HERE ↓</span></div>
    </section>
    <div className="marquee" aria-label="Eat, lift, log, repeat"><div className="marquee-track">{Array.from({ length: 4 }, (_, i) => <span key={i}>EAT WITH CARE <i>✳</i> LIFT WITH PURPOSE <i>✳</i> LOG THE LITTLE WINS <i>✳</i> REPEAT <i>✳</i></span>)}</div></div>
    <section className="workout-showcase section-wrap" id="training">
      <header className="showcase-heading" data-reveal><span className="eyebrow">01 / STRENGTH THAT STAYS WITH YOU</span><h2>Every rep has<br /><em>a reason.</em></h2><p>Build a training record around your real sessions — strength, cardio, and the effort behind both.</p></header>
      <div className="workout-photo-grid">
        <button className="cinema-panel workout-panel workout-panel-wide" type="button" onClick={() => goFeature('Workout')} aria-label="Open the workout tracker">
          <img src="/images/hero-training.jpg" alt="Athlete gripping a loaded barbell before a deadlift" loading="lazy" decoding="async" />
          <span className="panel-copy"><span className="panel-kicker">BARBELL / LOG YOUR LIFTS</span><b>Strength is built<br />one set at a time.</b><span className="panel-link">Open workout log <i aria-hidden="true">↗</i></span></span>
        </button>
        <button className="cinema-panel workout-panel" type="button" onClick={() => goFeature('Workout')} aria-label="Track a dumbbell strength workout">
          <img src="/images/workout-dumbbell-curl.jpg" alt="Athlete training with dumbbells in a focused gym session" loading="lazy" decoding="async" />
          <span className="panel-copy"><span className="panel-kicker">DUMBBELLS / FIND YOUR FORM</span><b>Make room<br />for one more.</b><span className="panel-link">Track your sets <i aria-hidden="true">↗</i></span></span>
        </button>
        <button className="cinema-panel workout-panel" type="button" onClick={() => goFeature('Workout')} aria-label="Open workouts for gym, cardio, and sport">
          <img src="/images/workout-gym.jpg" alt="Rows of dumbbells and an athlete training in a modern gym" loading="lazy" decoding="async" />
          <span className="panel-copy"><span className="panel-kicker">YOUR GYM / YOUR RHYTHM</span><b>Show up.<br />Keep the proof.</b><span className="panel-link">Choose a workout <i aria-hidden="true">↗</i></span></span>
        </button>
      </div>
    </section>
    <section className="nutrition-showcase" id="nutrition">
      <div className="nutrition-copy" data-reveal><span className="eyebrow">02 / FUEL FOR THE WORK</span><h2>Good food.<br /><em>No guesswork.</em></h2><p>Build a plate from everyday ingredients, set your serving in grams, and see estimated calories and macros update as you log.</p>
        <ul className="nutrition-points"><li><span>01</span> Pick from the built-in food list</li><li><span>02</span> Adjust your portion before you add it</li><li><span>03</span> Follow daily calories and macros</li></ul>
        <button className="button button-primary button-large" onClick={() => goFeature('Food')}>Open Food Tracker <span aria-hidden="true">↗</span></button>
        <small>Values are estimates from FORGE’s built-in list, not a verified food database.</small>
      </div>
      <div className="nutrition-mosaic">
        <figure className="nutrition-photo nutrition-photo-main" data-reveal><img src="/images/nutrition-bowl.jpg" alt="Balanced chickpea bowl with leafy greens, colorful vegetables, and avocado" loading="lazy" decoding="async" /><figcaption>WHOLE FOODS / EVERYDAY ENERGY</figcaption></figure>
        <figure className="nutrition-photo nutrition-photo-protein" data-reveal><img src="/images/nutrition-protein.jpg" alt="Protein-rich meal with beans, grains, vegetables, and salmon" loading="lazy" decoding="async" /><figcaption>PROTEIN / BUILT INTO YOUR DAY</figcaption></figure>
        <figure className="nutrition-photo nutrition-photo-prep" data-reveal><img src="/images/nutrition-prep.jpg" alt="Fresh vegetables and ingredients arranged on a bright kitchen counter" loading="lazy" decoding="async" /><figcaption>PREP / KEEP IT SIMPLE</figcaption></figure>
      </div>
    </section>
    <section className="progress-showcase">
      <img className="progress-photo" src="/images/workout-progress.jpg" alt="Runners continuing together along an outdoor track at dusk" loading="lazy" decoding="async" />
      <div className="progress-shade" />
      <div className="progress-copy" data-reveal><span className="eyebrow">03 / PROGRESS IS A PRACTICE</span><h2>See how far<br />showing up takes you.</h2><p>Daily logs, training history, streaks, and weight trends — all based on what you actually record.</p><button className="button button-primary button-large" onClick={() => goFeature('Progress')}>Explore Your Progress <span aria-hidden="true">↗</span></button></div>
      <div className="progress-caption">ONE DAY AT A TIME / FORGE</div>
    </section>
    <section className="manifesto section-wrap">
      <div className="eyebrow" data-reveal>GOOD HABITS, NO GUILT TRIPS</div>
      <h2 data-reveal>Made for real life.<br /><em>And all the days in between.</em></h2>
      <div className="feature-grid">
        {[
          ['01', 'Food, not fuss.', 'A thoughtful food list, live macros, and a log that takes seconds.'],
          ['02', 'Training, your way.', 'Gym, cardio, and sports — all the details worth remembering.'],
          ['03', 'Progress you can feel.', 'Weight trends, streaks, badges, and a monthly grade.'],
          ['04', 'Room to reset.', 'Water tracking and goals that make consistency feel achievable.'],
        ].map(([n, title, text], i) => <article className="feature-card" data-reveal key={n} style={{ '--delay': `${i * 80}ms` }}>
          <span className="feature-index">{n} <span>✳</span></span><h3>{title}</h3><p>{text}</p><span className="feature-arrow" aria-hidden="true">↗</span>
        </article>)}
      </div>
    </section>
    <section className="closing">
      <div className="closing-inner" data-reveal><DumbbellMark size={54} /><span className="eyebrow">YOUR NEXT GOOD DAY IS WAITING</span>
        <h2>Start small.<br /><em>Stay in it.</em></h2><button className="button button-primary button-large" onClick={() => go('signup')}>Create your account <span aria-hidden="true">↗</span></button>
      </div><span className="closing-index">FORGE / 2025</span>
    </section>
    <footer className="landing-footer"><span><DumbbellMark size={28} /> FORGE</span><span>BUILT A DAY AT A TIME.</span><a href="https://unsplash.com/license" target="_blank" rel="noreferrer">PHOTOGRAPHY / UNSPLASH</a></footer>
  </main>;
}

function Auth({ mode, setMode, state, setState, go }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const isSignup = mode === 'signup';
  const submit = async event => {
    event.preventDefault();
    if (submittingRef.current) return;
    const email = form.email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.');
    if (form.password.length < 6) return setError('Password needs at least 6 characters.');
    const user = state.users[email];
    if (isSignup) {
      if (!form.name.trim()) return setError('Tell us your name to get started.');
      if (state.users[email]) return setError('That email already has an account.');
    } else {
      if (!user) return setError('Email or password does not match.');
    }
    submittingRef.current = true;
    setSubmitting(true);
    try {
      if (isSignup) {
        const passwordHash = await hashPassword(form.password);
        setState(s => { s.users[email] = { name: form.name.trim(), passwordHash, profile: null }; s.session = email; return s; });
      } else {
        const result = await checkPassword(form.password, user);
        if (!result.valid) return setError('Email or password does not match.');
        if (result.legacy) {
          const passwordHash = await hashPassword(form.password);
          setState(s => { s.users[email].passwordHash = passwordHash; delete s.users[email].pw; s.session = email; return s; });
        } else {
          setState(s => { s.session = email; return s; });
        }
      }
      setForm(current => ({ ...current, password: '' }));
    } catch (passwordError) {
      console.error('Unable to securely process FORGE password.', passwordError);
      setError('Unable to securely process your password in this browser. Try again in a supported browser.');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };
  return <main className="auth-page">
    <header className="site-header auth-header"><button className="brand brand-button" onClick={() => go('land')}><DumbbellMark size={42} /><span>FORGE<small>DAILY, BUILT BETTER</small></span></button><button className="button button-quiet" onClick={() => go('land')}>← Back to home</button></header>
    <div className="auth-layout"><div className="auth-aside"><span className="eyebrow">A LITTLE STRONGER, EVERY DAY</span><h1>Good things<br />are <em>built.</em></h1><p>Make a plan that meets you where you are. Then keep showing up for it.</p><div className="auth-aside-mark"><DumbbellMark size={112} /></div>
      <section className="auth-faq" aria-labelledby="auth-faq-title"><span className="eyebrow" id="auth-faq-title">A FEW THINGS YOU MIGHT WONDER</span>
        <details><summary>Is FORGE free to use?</summary><p>Yes. Your food, workout, and progress tools are ready to use with no subscription.</p></details>
        <details><summary>Where is my data saved?</summary><p>Your account and logs are saved locally on this device, so your progress stays in your browser.</p></details>
        <details><summary>Can I change my goals later?</summary><p>Absolutely. Update your plan and preferences from Settings whenever your routine changes.</p></details>
      </section>
    </div>
      <section className="auth-card">
        <span className="eyebrow">{isSignup ? 'YOUR NEXT CHAPTER' : 'WELCOME BACK'}</span><h2>{isSignup ? 'Let’s get to know you.' : 'Pick up where you left off.'}</h2><p className="form-intro">{isSignup ? 'A few details, then we’ll build a plan around you.' : 'Your good habits are right where you left them.'}</p>
        <div className="auth-tabs" role="tablist"><button role="tab" aria-selected={!isSignup} className={!isSignup ? 'selected' : ''} onClick={() => { setMode('login'); setError(''); }}>Log in</button><button role="tab" aria-selected={isSignup} className={isSignup ? 'selected' : ''} onClick={() => { setMode('signup'); setError(''); }}>Sign up</button></div>
        <form onSubmit={submit} noValidate>
          {isSignup && <label className="field">Your name<input autoComplete="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="How should we call you?" /></label>}
          <label className="field">Email address<input type="email" autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label>
          <label className="field">Password<input type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" /></label>
          <p className="form-error" role="alert">{error}</p><button className="button button-primary form-submit" type="submit" disabled={submitting}>{submitting ? 'Saving securely…' : isSignup ? 'Create account' : 'Log in'} <span aria-hidden="true">↗</span></button>
        </form><p className="privacy-note">Your progress stays on this device.</p>
      </section>
    </div>
  </main>;
}

function Setup({ user, initialProfile, save }) {
  const [form, setForm] = useState(() => initialProfile
    ? { ...initialProfile, weight: String(initialProfile.weight), goal: String(initialProfile.goal) }
    : { weight: '', goal: '', type: 'fit', diet: 'veg', days: 4 });
  const physiques = [['aesthetic', 'Aesthetic', 'Lean & defined'], ['bulky', 'Bulky', 'Size & strength'], ['fit', 'Fit', 'Healthy & strong']];
  return <main className="setup-page">
    <header className="site-header"><button className="brand brand-button" aria-label="FORGE home"><DumbbellMark size={42} /><span>FORGE<small>DAILY, BUILT BETTER</small></span></button><span className="setup-step">YOUR PLAN <b>01 / 01</b></span></header>
    <section className="setup-card"><span className="eyebrow">FIRST, THE STARTING POINT</span><h1>Let’s make this <em>yours</em>, {user.name.split(' ')[0]}.</h1><p className="form-intro">Your goals shape your daily targets. You can always change them later.</p>
      <div className="field-grid">
        <label className="field">Current weight <span className="input-unit"><input type="number" min="1" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} placeholder="e.g. 68" /><i>kg</i></span></label>
        <label className="field">Goal weight <span className="input-unit"><input type="number" min="1" value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })} placeholder="e.g. 64" /><i>kg</i></span></label>
      </div>
      <fieldset className="setup-group"><legend>Your kind of strong</legend><div className="physique-options">{physiques.map(([value, label, detail]) => <button type="button" key={value} className={`physique-option ${form.type === value ? 'selected' : ''}`} aria-pressed={form.type === value} onClick={() => setForm({ ...form, type: value })}><span className="physique-glyph">{value === 'aesthetic' ? '◒' : value === 'bulky' ? '↗' : '✳'}</span><b>{label}</b><small>{detail}</small></button>)}</div></fieldset>
      <fieldset className="setup-group"><legend>How do you eat?</legend><div className="choice-row">{[['veg', 'Vegetarian'], ['non', 'Non-vegetarian']].map(([value, label]) => <button type="button" className={`choice-button ${form.diet === value ? 'selected' : ''}`} aria-pressed={form.diet === value} key={value} onClick={() => setForm({ ...form, diet: value })}>{label}</button>)}</div></fieldset>
      <label className="field days-field">Gym days each week <span className="days-number">{form.days}<small> days</small></span><input type="range" min="2" max="7" value={form.days} onChange={e => setForm({ ...form, days: +e.target.value })} /></label>
      <button className="button button-primary form-submit" disabled={!form.weight || +form.weight <= 0} onClick={() => save({ ...form, weight: +form.weight, goal: +form.goal || +form.weight })}>Build my plan <span aria-hidden="true">↗</span></button>
    </section>
  </main>;
}

function CalorieRing({ eaten, burned, goal }) {
  const remaining = useCount(Math.max(0, goal - eaten + burned));
  const circumference = 339.3;
  const progress = Math.min(1, Math.max(0, (eaten - burned) / goal));
  return <div className="calorie-ring">
    <svg viewBox="0 0 140 140" role="img" aria-label={`${remaining} calories remaining`}>
      <circle className="ring-track" cx="70" cy="70" r="54" /><circle className="ring-value" cx="70" cy="70" r="54" style={{ strokeDasharray: circumference, strokeDashoffset: circumference * (1 - progress) }} />
    </svg><div className="ring-copy"><b>{remaining.toLocaleString()}</b><span>KCAL LEFT</span></div>
  </div>;
}

function MacroBar({ label, value, goal, color }) {
  const display = useCount(Math.round(value));
  return <div className="macro-item"><div className="macro-copy"><span>{label}</span><b>{display}<small> / {goal} g</small></b></div><div className="macro-track"><i style={{ '--macro': color, transform: `scaleX(${Math.min(1, value / goal)})` }} /></div></div>;
}

function ScreenPhotoHeading({ image, alt, eyebrow, title, description, trailing }) {
  return <section className="screen-photo-heading">
    <img src={image} alt={alt} loading="eager" decoding="async" />
    <div className="screen-photo-shade" />
    <div className="screen-photo-copy"><span className="eyebrow">{eyebrow}</span><h1>{title}<span>.</span></h1><p>{description}</p></div>
    {trailing && <div className="screen-photo-trailing">{trailing}</div>}
  </section>;
}

function Dashboard({ state, email, user, plan, update, navigate, startWorkout, saveHydrationGoal }) {
  const [drinkAmount, setDrinkAmount] = useState('250');
  const [goalDraft, setGoalDraft] = useState(String(user.profile.hydrationGoalMl || 2000));
  const [goalMessage, setGoalMessage] = useState('');
  const [editingWater, setEditingWater] = useState(null);
  const [waterEditAmount, setWaterEditAmount] = useState('');
  const [waterError, setWaterError] = useState('');
  const day = dayOf(state, email, today());
  const drinks = day.waterEntries || [];
  const waterMl = hydrationTotal(day);
  const waterGoalMl = Number(user.profile.hydrationGoalMl) || 2000;
  const eaten = total(day.food, 1);
  const burned = Math.round(total(day.work, 1));
  let streak = 0;
  for (let i = 0; i < 365; i += 1) {
    if (hasLog(dayOf(state, email, daysAgo(i)))) streak += 1;
    else if (i > 0) break;
  }
  const week = [6, 5, 4, 3, 2, 1, 0].map(n => ({ date: daysAgo(n), value: total(dayOf(state, email, daysAgo(n)).food, 1) }));
  const trainingWeek = [6, 5, 4, 3, 2, 1, 0].map(n => {
    const date = daysAgo(n);
    const log = dayOf(state, email, date);
    return { date, sessions: log.work.length, calories: total(log.work, 1) };
  });
  const weeklySessions = trainingWeek.reduce((count, item) => count + item.sessions, 0);
  const weeklyTrainingDays = trainingWeek.filter(item => item.sessions > 0).length;
  const peakSessions = Math.max(1, ...trainingWeek.map(item => item.sessions));
  const peak = Math.max(plan.kcal, ...week.map(x => x.value), 1);
  const addDrink = amount => {
    const ml = Number(amount);
    if (!Number.isFinite(ml) || ml < 1 || ml > 5000) { setWaterError('Enter a drink volume between 1 and 5000 ml.'); return; }
    update(d => { d.waterEntries.push({ id: entryId(), ml, loggedAt: new Date().toISOString() }); });
    setDrinkAmount('250');
    setWaterError('');
  };
  const saveWaterEdit = id => {
    const ml = Number(waterEditAmount);
    if (!Number.isFinite(ml) || ml < 1 || ml > 5000) { setWaterError('Enter a drink volume between 1 and 5000 ml.'); return; }
    update(d => { const entry = d.waterEntries.find(item => item.id === id); if (entry) entry.ml = ml; });
    setEditingWater(null);
    setWaterError('');
  };
  return <div className="dashboard-view">
    <section className="dashboard-hero">
      <img src="/images/workout-strength.jpg" alt="" aria-hidden="true" />
      <div className="dashboard-hero-shade" />
      <div className="dashboard-hero-content">
        <span className="eyebrow">YOUR EFFORT, ALL IN ONE PLACE</span>
        <h1>Hey, {user.name.split(' ')[0]}<span>.</span></h1>
        <p>A good day to begin. Make today count, one choice at a time.</p>
        <div className="dashboard-hero-actions"><button className="button button-primary" onClick={() => startWorkout('Gym')}>Log a workout <span aria-hidden="true">↗</span></button><button className="button dashboard-hero-secondary" onClick={() => navigate('Food')}>Add food <span aria-hidden="true">↗</span></button></div>
      </div>
      <div className="dashboard-hero-meta"><span>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span><span>TODAY'S TRAINING / {SPLIT[new Date().getDay() % SPLIT.length].toUpperCase()}</span></div>
    </section>
    <div className="dashboard-section-label"><span>YOUR DAILY SNAPSHOT</span><span>01 / TRACK THE WORK</span></div>
    <div className="dashboard-grid">
      <section className="app-card calories-card"><div className="card-photo"><img src="/images/nutrition-bowl.jpg" alt="Colorful bowl of vegetables, chickpeas, and avocado" loading="lazy" /><span>FUEL, WITH INTENTION</span></div><div className="card-eyebrow"><span>CALORIES</span><span>DAILY TARGET · {plan.kcal}</span></div><CalorieRing eaten={eaten} burned={burned} goal={plan.kcal} /><p className="calories-summary"><b>{eaten.toLocaleString()}</b> eaten <span>·</span> <b>{burned.toLocaleString()}</b> burned</p></section>
      <section className="app-card macros-card"><div className="card-photo"><img src="/images/nutrition-indian-meal.jpg" alt="Balanced meal with vegetables, grains, and protein" loading="lazy" /><span>THE BALANCED PLATE</span></div><div className="card-title-row"><div><span className="eyebrow">THE BIG PICTURE</span><h2>Macros</h2></div><span className="tiny-mark">01</span></div><MacroBar label="Protein" value={total(day.food, 2)} goal={plan.protein} color="#2f6c54" /><MacroBar label="Carbs" value={total(day.food, 3)} goal={plan.carbs} color="var(--accent)" /><MacroBar label="Fat" value={total(day.food, 4)} goal={plan.fat} color="#8b5a76" /><div className="macro-note">A guide, not a grade.</div></section>
      <section className="app-card water-card">
        <div className="card-photo"><img src="/images/hydration-water.jpg" alt="Water pouring into a clear glass" loading="lazy" /><span>SMALL SIPS, STEADY ENERGY</span></div>
        <div className="card-title-row"><div><span className="eyebrow">KEEP YOUR RHYTHM</span><h2>Hydration</h2></div><span className="water-total">{waterMl >= 1000 ? `${(waterMl / 1000).toFixed(1)} L` : `${waterMl} ml`}<small> / {waterGoalMl >= 1000 ? `${(waterGoalMl / 1000).toFixed(1)} L` : `${waterGoalMl} ml`}</small></span></div>
        <div className="hydration-meter" role="progressbar" aria-label="Daily hydration goal" aria-valuemin="0" aria-valuemax={waterGoalMl} aria-valuenow={waterMl}><i style={{ width: `${Math.min(100, waterMl / waterGoalMl * 100)}%` }} /></div>
        <div className="hydration-presets" aria-label="Quick add water">
          {[150, 250, 350, 500].map(amount => <button className="hydration-preset" type="button" key={amount} onClick={() => addDrink(amount)}>+ {amount} ml</button>)}
        </div>
        <form className="hydration-add" onSubmit={event => { event.preventDefault(); addDrink(drinkAmount); }}>
          <label className="sr-only" htmlFor="drink-volume">Drink volume in millilitres</label><input id="drink-volume" type="number" min="1" max="5000" step="1" value={drinkAmount} onChange={event => { setDrinkAmount(event.target.value); setWaterError(''); }} />
          <button className="button button-primary" type="submit" disabled={!Number.isFinite(Number(drinkAmount)) || Number(drinkAmount) < 1 || Number(drinkAmount) > 5000}>Add drink <span aria-hidden="true">+</span></button>
        </form>
        <div className="hydration-goal"><label htmlFor="hydration-goal">Daily goal (ml)</label><input id="hydration-goal" type="number" min="250" max="10000" step="250" value={goalDraft} onChange={event => { setGoalDraft(event.target.value); setGoalMessage(''); }} /><button type="button" className="button button-quiet" disabled={!Number.isFinite(Number(goalDraft)) || Number(goalDraft) < 250 || Number(goalDraft) > 10000} onClick={() => { saveHydrationGoal(Number(goalDraft)); setGoalMessage('Daily hydration goal saved.'); }}>Save goal</button></div>
        {goalMessage && <p className="settings-message" role="status">{goalMessage}</p>}
        <div className="hydration-entry-heading"><span>TODAY'S DRINKS</span><b>{drinks.length} logged</b></div>
        {!drinks.length ? <p className="hydration-empty">No drinks logged yet. Add one to start your day.</p> : <div className="hydration-entries">{drinks.map((drink, index) => <div className="hydration-entry" key={drink.id || index}>
          {editingWater === drink.id ? <><label className="sr-only" htmlFor={`water-edit-${drink.id}`}>Edit drink volume in millilitres</label><input id={`water-edit-${drink.id}`} type="number" min="1" max="5000" value={waterEditAmount} onChange={event => { setWaterEditAmount(event.target.value); setWaterError(''); }} /><button type="button" className="button button-quiet" onClick={() => saveWaterEdit(drink.id)}>Save</button><button type="button" className="button button-quiet" onClick={() => setEditingWater(null)}>Cancel</button></> : <><span>DRINK {index + 1}</span><b>{drink.ml} ml</b><button type="button" className="button button-quiet" aria-label={`Edit drink ${index + 1}`} onClick={() => { setEditingWater(drink.id); setWaterEditAmount(String(drink.ml)); setWaterError(''); }}>Edit</button><button type="button" className="remove-button" aria-label={`Remove drink ${index + 1}`} onClick={() => update(d => { d.waterEntries = d.waterEntries.filter(item => item.id !== drink.id); })}>×</button></>}
        </div>)}</div>}
        {waterError && <p className="form-error" role="alert">{waterError}</p>}
      </section>
      <section className="app-card week-card"><div className="card-photo"><img src="/images/workout-progress.jpg" alt="Runners training together at dusk" loading="lazy" /><span>SHOW UP, THEN REPEAT</span></div><div className="card-title-row"><div><span className="eyebrow">ONE WEEK AT A TIME</span><h2>Food log</h2></div><span className="chart-legend"><i /> KCAL</span></div><div className="week-chart">{week.map((item, i) => <div className="week-column" key={item.date}><div className="week-bar-wrap"><i style={{ transform: `scaleY(${item.value ? Math.max(.035, item.value / peak) : .025})` }} /></div><span className={i === 6 ? 'today-label' : ''}>{new Date(`${item.date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 1)}</span></div>)}</div><p className="focus-line"><span>YOUR TRAINING SPLIT</span><b>{SPLIT[new Date().getDay() % SPLIT.length]}</b></p></section>
      <section className="app-card today-training-card"><div className="card-title-row"><div><span className="eyebrow">TODAY'S MOVEMENT</span><h2>Training</h2></div><span className="water-total">{day.work.length}<small> logged</small></span></div>
        {day.work.length ? <div className="logged-list">{day.work.map((item, index) => <article className="logged-item" key={`${item[0]}-${index}`}><div><b>{item[0]}</b><span>{item[2]}{item[3] ? ` · ${item[3]} kg` : ''}</span></div><b>{item[1]} <small>kcal*</small></b></article>)}</div> : <div className="empty-state"><b>Movement, on your terms.</b><p>Log a workout to see today's effort here.</p></div>}
        <p className="food-note">*Workout energy is an estimate.</p>
      </section>
    </div>
    <section className="dashboard-feature-grid" aria-label="Daily inspiration">
      <article className="dashboard-feature nutrition-feature"><img src="/images/nutrition-curry.jpg" alt="Freshly prepared protein-rich Indian curry" loading="lazy" /><div className="feature-shade" /><div className="feature-copy"><span className="eyebrow">GOOD FOOD, BUILT IN</span><h2>A plate worth<br />looking forward to.</h2><p>Find a meal, set your serving, and let your daily totals take care of themselves.</p><button className="button button-primary" onClick={() => navigate('Food')}>Open food log <span aria-hidden="true">↗</span></button></div><span className="feature-index">02 / NOURISH</span></article>
      <article className="dashboard-feature training-feature"><img src="/images/workout-athlete.jpg" alt="Athlete training with a barbell in the gym" loading="lazy" /><div className="feature-shade" /><div className="feature-copy"><span className="eyebrow">TODAY'S MOVEMENT</span><h2>Make room<br />for one more rep.</h2><p>{SPLIT[new Date().getDay() % SPLIT.length]}</p><button className="button dashboard-hero-secondary" onClick={() => startWorkout('Gym')}>Start a session <span aria-hidden="true">↗</span></button></div><span className="feature-index">03 / TRAIN</span></article>
    </section>
    <section className="training-week-panel">
      <div className="training-week-image"><img src="/images/workout-dumbbells.jpg" alt="Athlete training with dumbbells in a focused gym session" loading="lazy" /><span>THE WORK, WEEK BY WEEK</span></div>
      <div className="training-week-copy"><span className="eyebrow">YOUR LAST SEVEN DAYS</span><h2>A week of showing up.</h2><p>Every session counts. Keep your training rhythm steady and let the small wins stack up.</p><div className="training-week-stats"><div><b>{weeklySessions}</b><span>SESSIONS</span></div><div><b>{weeklyTrainingDays}/7</b><span>ACTIVE DAYS</span></div><div><b>{Math.round(trainingWeek.reduce((sum, item) => sum + item.calories, 0))}</b><span>EST. KCAL</span></div></div>
        <div className="training-week-chart" role="img" aria-label={`${weeklySessions} sessions across ${weeklyTrainingDays} training days in the last week`}>{trainingWeek.map((item, index) => <div className="training-week-day" key={item.date}><div><i style={{ height: `${Math.max(7, item.sessions / peakSessions * 100)}%` }} /></div><span className={index === 6 ? 'today-label' : ''}>{new Date(`${item.date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 1)}</span></div>)}</div>
        <button className="button button-primary" onClick={() => startWorkout('Gym')}>Log your next session <span aria-hidden="true">↗</span></button>
      </div>
    </section>
    <section className="dashboard-consistency">
      <div className="consistency-photo"><img src="/images/workout-progress.jpg" alt="Athletes running together at dusk" loading="lazy" /><span>CONSISTENCY IS A PRACTICE</span></div>
      <div className="consistency-copy"><span className="eyebrow">THE LONG GAME</span><h2>One good day<br />becomes a rhythm.</h2><p>Every meal, session, and glass of water adds up. Keep the promise small; keep showing up.</p><div className="consistency-stats"><div><b>{streak}</b><span>DAY STREAK</span></div><div><b>{day.work.length}</b><span>SESSIONS TODAY</span></div><div><b>{Math.round(waterMl / 1000 * 10) / 10}L</b><span>WATER TODAY</span></div></div><button className="button button-primary" onClick={() => navigate('Progress')}>See your progress <span aria-hidden="true">↗</span></button></div>
    </section>
    <section className="recovery-feature"><div className="recovery-image"><img src="/images/recovery-mobility.jpg" alt="Athlete practicing a deep mobility stretch at sunset" loading="lazy" /></div><div><span className="eyebrow">REST IS PART OF THE WORK</span><h2>Leave space<br />to recover.</h2><p>Take a breath, move gently, and build a routine that lasts beyond today.</p><button className="button button-quiet recovery-action" onClick={() => startWorkout('Mobility')}>Explore mobility <span aria-hidden="true">↗</span></button></div><span className="recovery-index">04 / RESET</span></section>
  </div>;
}

function Food({ state, email, user, update }) {
  const [query, setQuery] = useState('');
  const [diet, setDiet] = useState('All');
  const [kind, setKind] = useState('All');
  const [category, setCategory] = useState('All categories');
  const [amounts, setAmounts] = useState({});
  const [editingFood, setEditingFood] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const day = dayOf(state, email, today());
  const foods = FOOD_LIST.filter(food => (diet === 'All' || (diet === 'Vegetarian' ? !!food[5] : !food[5])) && (kind === 'All' || food[6] === kind) && (category === 'All categories' || foodCategory(food) === category) && foodMatchesQuery(food, query));
  const foodPlan = caloriePlan(user.profile);
  const loggedKcal = total(day.food, 1);
  const loggedProtein = total(day.food, 2);
  const loggedCarbs = total(day.food, 3);
  const loggedFat = total(day.food, 4);
  const sourceForEntry = entry => FOOD_LIST.find(food => entry[0] === food[0] || entry[0].startsWith(`${food[0]} · `));
  const beginEdit = (entry, index) => {
    const source = sourceForEntry(entry);
    if (!source) return;
    const savedAmount = entry[0].match(/·\s*(\d+(?:\.\d+)?)\s*g$/);
    setEditingFood(index);
    setEditAmount(savedAmount ? savedAmount[1] : String(foodServingGrams(source)));
  };
  const saveEdit = index => {
    const entry = day.food[index];
    const source = entry && sourceForEntry(entry);
    const grams = Number(editAmount);
    if (!source || !Number.isFinite(grams) || grams <= 0 || grams > 5000) return;
    const macros = foodMacrosForGrams(source, grams);
    update(d => { d.food[index] = [`${source[0]} · ${grams} g`, ...macros]; });
    setEditingFood(null);
  };
  return <div className="screen-view">
    <ScreenPhotoHeading image="/images/nutrition-prep.jpg" alt="Fresh ingredients prepared on a kitchen counter" eyebrow="FUEL THAT FEELS GOOD" title="Food log" description="A little more awareness. A little less guesswork." trailing={<div className="hero-daily-total"><b>{total(day.food, 1).toLocaleString()}</b><span>KCAL TODAY</span></div>} />
    <section className="food-overview">
      <div className="food-overview-photo"><img src="/images/nutrition-bowl.jpg" alt="Vibrant bowl of vegetables, chickpeas, and avocado" loading="lazy" /><span>FRESH, BALANCED, YOURS</span></div>
      <div className="food-overview-copy"><span className="eyebrow">YOUR NUTRITION, AT A GLANCE</span><h2>Make your next meal<br />a little more mindful.</h2><p>Explore everyday ingredients and balanced meals. Your serving size and nutrition estimates update as you log.</p>
        <div className="food-macro-overview">
          <div className="food-macro-stat"><span>ENERGY</span><b>{loggedKcal.toLocaleString()}<small> / {foodPlan.kcal} kcal</small></b><div><i style={{ width: `${Math.min(100, loggedKcal / foodPlan.kcal * 100)}%` }} /></div></div>
          <div className="food-macro-stat"><span>PROTEIN</span><b>{loggedProtein}<small> / {foodPlan.protein} g</small></b><div><i style={{ width: `${Math.min(100, loggedProtein / foodPlan.protein * 100)}%` }} /></div></div>
          <div className="food-macro-stat"><span>CARBOHYDRATES</span><b>{loggedCarbs}<small> / {foodPlan.carbs} g</small></b><div><i style={{ width: `${Math.min(100, loggedCarbs / foodPlan.carbs * 100)}%` }} /></div></div>
          <div className="food-macro-stat"><span>FAT</span><b>{loggedFat}<small> / {foodPlan.fat} g</small></b><div><i style={{ width: `${Math.min(100, loggedFat / foodPlan.fat * 100)}%` }} /></div></div>
        </div>
        <button className="button button-primary" onClick={() => document.getElementById('food-search')?.focus()}>Find something good <span aria-hidden="true">↓</span></button>
      </div>
    </section>
    <section className="food-collections" aria-label="Browse food collections">
      <button type="button" className="food-collection" onClick={() => { setCategory('Meals & dishes'); setQuery(''); }}>
        <img src="/images/nutrition-indian-meal.jpg" alt="Colorful balanced meal with grains, vegetables, and protein" loading="lazy" /><span className="collection-shade" /><span className="collection-copy"><small>01 / EVERYDAY FUEL</small><b>Balanced meals</b></span><span className="collection-arrow">↗</span>
      </button>
      <button type="button" className="food-collection" onClick={() => { setCategory('Protein'); setQuery(''); }}>
        <img src="/images/nutrition-indian-meal.jpg" alt="Protein-rich meal with grains, vegetables, and salmon" loading="lazy" /><span className="collection-shade" /><span className="collection-copy"><small>02 / PROTEIN PICKS</small><b>Protein-rich plates</b></span><span className="collection-arrow">↗</span>
      </button>
      <button type="button" className="food-collection" onClick={() => { setCategory('Vegetables'); setQuery(''); }}>
        <img src="/images/nutrition-bowl.jpg" alt="Fresh vegetables and chickpeas arranged in a nourishing bowl" loading="lazy" /><span className="collection-shade" /><span className="collection-copy"><small>03 / COLOR ON YOUR PLATE</small><b>Fresh ingredients</b></span><span className="collection-arrow">↗</span>
      </button>
    </section>
    <div className="two-column">
      <section className="app-card food-picker"><div className="section-heading"><div><span className="eyebrow">THE FOOD LIST</span><h2>What did you eat?</h2></div><span className="tiny-mark">01</span></div>
        <label className="search-box"><span aria-hidden="true">⌕</span><input id="food-search" aria-label="Search food by name or ingredient" placeholder="Search food or ingredient..." value={query} onChange={e => setQuery(e.target.value)} /><kbd>⌘ K</kbd></label>
        <p className="food-note">Values are approximate estimates from FORGE’s built-in reference list, not verified product labels or a live food database. Amounts scale from each entry’s listed serving.</p>
        <div className="filter-row food-category-filters" role="group" aria-label="Food categories">{FOOD_CATEGORIES.map(item => <button type="button" className={`filter-chip ${category === item ? 'selected' : ''}`} aria-pressed={category === item} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div>
        <div className="filter-row" role="group" aria-label="Diet filters">{['All', 'Vegetarian', 'Non-veg'].map(item => <button className={`filter-chip ${diet === item ? 'selected' : ''}`} key={item} onClick={() => setDiet(item)}>{item}</button>)}</div>
        <div className="filter-row" role="group" aria-label="Food type filters">{[['All','All foods'],['Ingredient','Ingredients'],['Dish','Dishes']].map(([value,label]) => <button className={`filter-chip ${kind === value ? 'selected' : ''}`} key={value} onClick={() => setKind(value)}>{label}</button>)}</div>
        <div className="food-list">{foods.map((food, index) => {
          const amount = amounts[food[0]] ?? String(foodServingGrams(food));
          const grams = Number(amount);
          const validAmount = amount !== '' && Number.isFinite(grams) && grams > 0 && grams <= 5000;
          const macros = validAmount ? foodMacrosForGrams(food, grams) : [0, 0, 0, 0];
          const artwork = index < 6 || (query.trim() && index < 12) ? foodImage(food) : null;
          return <article className={`food-item ${artwork ? 'has-photo' : 'no-photo'}`} key={food[0]}>
            {artwork && <img className="food-item-photo" src={artwork[0]} alt={artwork[1]} loading="lazy" />}
            <div className="food-item-info">
              <b>{food[0]}</b>
              <span>{foodCategory(food)} · basis {foodServingGrams(food)} g <i>·</i> selected {grams} g <i>·</i> ~{macros[0]} kcal <i>·</i> P {macros[1]} g <i>·</i> C {macros[2]} g <i>·</i> F {macros[3]} g</span>
              <label className="food-portion">Amount <input type="number" min="1" max="5000" step="1" inputMode="numeric" aria-label={`${food[0]} amount in grams`} value={amount} onChange={event => setAmounts(current => ({ ...current, [food[0]]: event.target.value }))} /> g</label>
            </div>
            <button className="add-button" aria-label={`Add ${food[0]}${validAmount ? `, ${grams} grams, ${macros[0]} calories` : ''}`} disabled={!validAmount} onClick={() => update(d => d.food.push([`${food[0]} · ${grams} g`, ...macros]))}>+</button>
          </article>;
        })}{!foods.length && <p className="empty-note">Nothing found. Try another search or filter.</p>}</div>
      </section>
      <section className="app-card logged-card"><div className="section-heading"><div><span className="eyebrow">TODAY, SO FAR</span><h2>Your plate</h2></div><span className="logged-count">{day.food.length} {day.food.length === 1 ? 'item' : 'items'}</span></div>
        {!day.food.length ? <div className="empty-state"><span className="empty-mark">✳</span><b>Your log starts here.</b><p>Add a meal from the list when you're ready.</p></div> : <div className="logged-list">{day.food.map((food, i) => <article className="logged-item" key={`${food[0]}-${i}`}><div><b>{food[0]}</b><span>{food[1]} kcal <i>·</i> P {food[2]}g <i>·</i> C {food[3]}g <i>·</i> F {food[4]}g</span>
          {editingFood === i && <div className="record-edit-panel"><label className="field">Serving size in grams<input type="number" min="1" max="5000" step="1" value={editAmount} onChange={event => setEditAmount(event.target.value)} /></label><button className="button button-primary" disabled={!Number.isFinite(Number(editAmount)) || Number(editAmount) <= 0 || Number(editAmount) > 5000} onClick={() => saveEdit(i)}>Save portion</button><button className="button button-quiet" onClick={() => setEditingFood(null)}>Cancel</button></div>}
        </div><div className="record-actions">{editingFood !== i && <button className="button button-quiet" onClick={() => beginEdit(food, i)} disabled={!sourceForEntry(food)}>Edit</button>}<button className="remove-button" aria-label={`Remove ${food[0]}`} onClick={() => { update(d => d.food.splice(i, 1)); setEditingFood(null); }}>×</button></div></article>)}</div>}
        <div className="plate-total"><span>TOTAL ENERGY</span><b>{total(day.food, 1).toLocaleString()} <small>KCAL</small></b></div>
      </section>
    </div>
  </div>;
}

function Workout({ state, email, update, initialCategory = 'Gym' }) {
  const [category, setCategory] = useState(initialCategory);
  const [exercise, setExercise] = useState(null);
  const [amount, setAmount] = useState(3);
  const [reps, setReps] = useState(10);
  const [weightKg, setWeightKg] = useState('');
  const [editingWorkout, setEditingWorkout] = useState(null);
  const day = dayOf(state, email, today());
  const gym = category === 'Gym' || category === 'Hypertrophy';
  const history = Object.entries(state.logs[email] || {})
    .filter(([date, entry]) => date !== today() && entry.work?.length)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 7);
  const add = () => {
    if (!exercise || !Number.isFinite(amount) || amount <= 0 || (gym && (!Number.isFinite(reps) || reps <= 0))) return;
    const load = Number(weightKg);
    if (gym && weightKg !== '' && (!Number.isFinite(load) || load < 0 || load > 1000)) return;
    const calories = Math.round(gym ? exercise[1] * amount * reps : exercise[1] * amount);
    update(d => d.work.push([exercise[0], calories, gym ? `${amount}×${reps}` : `${amount} min`, gym && load ? load : null]));
    setExercise(null);
    setWeightKg('');
  };
  const beginEdit = (item, index) => {
    const [setCount, repCount] = String(item[2]).split('×').map(Number);
    setEditingWorkout({
      index,
      amount: String(Number.isFinite(setCount) ? setCount : Number.parseInt(item[2], 10) || 1),
      reps: String(Number.isFinite(repCount) ? repCount : 10),
      weight: item[3] == null ? '' : String(item[3]),
      strength: String(item[2]).includes('×'),
    });
  };
  const saveEdit = () => {
    if (!editingWorkout) return;
    const item = day.work[editingWorkout.index];
    if (!item) return setEditingWorkout(null);
    const count = Number(editingWorkout.amount);
    const repCount = Number(editingWorkout.reps);
    const load = Number(editingWorkout.weight);
    if (!Number.isFinite(count) || count <= 0 || count > 1000) return;
    if (editingWorkout.strength && (!Number.isFinite(repCount) || repCount <= 0 || repCount > 1000)) return;
    if (editingWorkout.strength && editingWorkout.weight !== '' && (!Number.isFinite(load) || load < 0 || load > 1000)) return;
    const factor = Object.values(EXERCISES).flat().find(([name]) => name === item[0])?.[1] || 0;
    const calories = Math.round(editingWorkout.strength ? factor * count * repCount : factor * count);
    const detail = editingWorkout.strength ? `${count}×${repCount}` : `${count} min`;
    update(d => { d.work[editingWorkout.index] = [item[0], calories, detail, editingWorkout.strength && load ? load : null]; });
    setEditingWorkout(null);
  };
  return <div className="screen-view">
    <ScreenPhotoHeading image="/images/workout-gym.jpg" alt="Strength training equipment in a modern gym" eyebrow="THE WORK YOU PUT IN" title="Workout log" description="Remember the effort, not just the outcome." trailing={<div className="hero-daily-total"><b>{Math.round(total(day.work, 1)).toLocaleString()}</b><span>KCAL BURNED</span></div>} />
    <section className="workout-paths" aria-label="Choose a training focus">{Object.keys(EXERCISES).map(name => {
      const [image, label, alt] = workoutCategoryArt[name];
      const selected = category === name;
      return <button type="button" className={`workout-path ${selected ? 'selected' : ''}`} aria-pressed={selected} key={name} onClick={() => { setCategory(name); setExercise(null); setAmount(name === 'Gym' || name === 'Hypertrophy' ? 3 : 30); }}>
        <img src={image} alt={alt} loading="lazy" /><span className="workout-path-shade" /><span className="workout-path-copy"><small>{selected ? 'SELECTED FOCUS' : 'TRAINING FOCUS'}</small><b>{label}</b><i>{name === 'Gym' ? 'Compound strength' : name === 'Hypertrophy' ? 'Muscle & volume' : name === 'Cardio' ? 'Build your engine' : name === 'Mobility' ? 'Move with freedom' : name === 'Recovery' ? 'Restore your energy' : 'Sport & conditioning'}</i></span><span className="workout-path-arrow" aria-hidden="true">↗</span>
      </button>;
    })}</section>
    <div className="two-column workout-columns">
      <section className="app-card workout-maker"><div className="section-heading"><div><span className="eyebrow">PICK YOUR MOVEMENT</span><h2>Make it count.</h2></div><span className="tiny-mark">01</span></div>
        <div className="category-tabs" role="tablist">{Object.keys(EXERCISES).map(name => <button role="tab" aria-selected={category === name} className={category === name ? 'selected' : ''} key={name} onClick={() => { setCategory(name); setExercise(null); setAmount(name === 'Gym' || name === 'Hypertrophy' ? 3 : 30); }}>{workoutCategoryArt[name][1]}</button>)}</div>
        <div className="exercise-grid">{EXERCISES[category].map(item => {
          const artwork = exerciseImage(item[0]);
          return <button className={`exercise-choice ${artwork ? 'has-photo' : 'no-photo'} ${exercise?.[0] === item[0] ? 'selected' : ''}`} key={item[0]} onClick={() => { setExercise(item); setAmount(gym ? 3 : 30); }}>{artwork && <img src={artwork[0]} alt={artwork[1]} loading="lazy" />}<span className="exercise-choice-copy"><b>{item[0]}</b><small>{gym ? 'Sets · reps · optional load' : 'Duration · estimated effort'}</small></span><i aria-hidden="true">{exercise?.[0] === item[0] ? '✓' : '↗'}</i></button>;
        })}</div>
        {exercise && <div className="exercise-config">
          <div className="config-title"><div><span className="eyebrow">YOUR SESSION</span><h3>{exercise[0]}</h3></div><button className="remove-button" aria-label="Close exercise setup" onClick={() => setExercise(null)}>×</button></div>
          <label className="field">{gym ? 'Sets' : 'Minutes'}<input type="number" min="1" max="1000" value={amount} onChange={e => setAmount(+e.target.value)} /></label>
          {gym && <><label className="field">Reps per set<input type="number" min="1" max="1000" value={reps} onChange={e => setReps(+e.target.value)} /></label><label className="field">Weight lifted (kg)<input type="number" min="0" max="1000" step=".5" value={weightKg} onChange={e => setWeightKg(e.target.value)} placeholder="Optional" /></label></>}
          <button className="button button-primary form-submit" disabled={amount <= 0 || (gym && reps <= 0)} onClick={add}>Log this workout <span aria-hidden="true">↗</span></button>
        </div>}
      </section>
      <section className="app-card workout-log"><div className="section-heading"><div><span className="eyebrow">TODAY'S EFFORT</span><h2>In the books.</h2></div><span className="logged-count">{day.work.length} {day.work.length === 1 ? 'session' : 'sessions'}</span></div>
        {!day.work.length ? <div className="empty-state"><span className="empty-mark">↗</span><b>Room for a first.</b><p>Log a session and celebrate showing up.</p></div> : <div className="logged-list">{day.work.map((item, i) => <article className="logged-item" key={`${item[0]}-${i}`}><div><b>{item[0]}</b><span>{item[2]}{item[3] ? ` · ${item[3]} kg` : ''} <i>·</i> {item[1]} kcal estimated</span>
          {editingWorkout?.index === i && <div className="record-edit-panel"><label className="field">{editingWorkout.strength ? 'Sets' : 'Minutes'}<input type="number" min="1" max="1000" value={editingWorkout.amount} onChange={event => setEditingWorkout({ ...editingWorkout, amount: event.target.value })} /></label>
            {editingWorkout.strength && <><label className="field">Reps per set<input type="number" min="1" max="1000" value={editingWorkout.reps} onChange={event => setEditingWorkout({ ...editingWorkout, reps: event.target.value })} /></label><label className="field">Weight lifted (kg)<input type="number" min="0" max="1000" step=".5" value={editingWorkout.weight} onChange={event => setEditingWorkout({ ...editingWorkout, weight: event.target.value })} /></label></>}
            <button className="button button-primary" onClick={saveEdit}>Save workout</button><button className="button button-quiet" onClick={() => setEditingWorkout(null)}>Cancel</button>
          </div>}
        </div><div className="record-actions">{editingWorkout?.index !== i && <button className="button button-quiet" onClick={() => beginEdit(item, i)}>Edit</button>}<button className="remove-button" aria-label={`Remove ${item[0]}`} onClick={() => { update(d => d.work.splice(i, 1)); setEditingWorkout(null); }}>×</button></div></article>)}</div>}
        <div className="plate-total"><span>ENERGY BURNED</span><b>{Math.round(total(day.work, 1)).toLocaleString()} <small>KCAL</small></b></div>
      </section>
    </div>
    <section className="app-card workout-history"><div className="card-photo"><img src="/images/workout-progress.jpg" alt="Runners training together at dusk" loading="lazy" /><span>THE WORK ADDS UP</span></div><div className="section-heading"><div><span className="eyebrow">RECENT RECORDS</span><h2>Training history</h2></div><span className="logged-count">Last 7 logged days</span></div>
      {!history.length ? <div className="empty-state"><b>Your earlier sessions will appear here.</b><p>History is built from workouts you log in FORGE.</p></div> : <div className="history-days">{history.map(([date, entry]) => <div className="history-day" key={date}><b>{new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</b><div>{entry.work.map((item, index) => <span key={`${item[0]}-${index}`}>{item[0]} · {item[2]}{item[3] ? ` · ${item[3]} kg` : ''}</span>)}</div></div>)}</div>}
    </section>
  </div>;
}

function Progress({ state, email, user, setState }) {
  const [weight, setWeight] = useState('');
  const [weightDate, setWeightDate] = useState(today());
  const [weightError, setWeightError] = useState('');
  const [editingWeight, setEditingWeight] = useState(null);
  const [weightEditValue, setWeightEditValue] = useState('');
  const [weightEditDate, setWeightEditDate] = useState('');
  const [range, setRange] = useState(30);
  const weighIns = state.weights[email] || [];
  const rangeStart = new Date();
  rangeStart.setDate(rangeStart.getDate() - (range - 1));
  const rangeStartKey = localDate(rangeStart);
  const points = weighIns.map((entry, index) => ({ date: entry[0], value: Number(entry[1]), id: entry[2] || `${entry[0]}-${index}`, index }))
    .filter(point => point.date >= rangeStartKey && point.date <= today() && Number.isFinite(point.value))
    .sort((a, b) => a.date.localeCompare(b.date) || a.index - b.index);
  const activeRangeDays = Object.entries(state.logs[email] || {}).filter(([date, log]) => date >= rangeStartKey && date <= today() && hasLog(log)).length;
  let streak = 0;
  for (let i = 0; i < 365; i += 1) {
    if (hasLog(dayOf(state, email, daysAgo(i)))) streak += 1;
    else if (i > 0) break;
  }
  const now = new Date();
  const monthDays = now.getDate();
  let active = 0;
  for (let i = 0; i < monthDays; i += 1) if (hasLog(dayOf(state, email, daysAgo(i)))) active += 1;
  const monthly = active / monthDays * 100;
  const grade = active === 0 ? 'STARTING' : monthly >= 80 ? 'Elite' : monthly >= 60 ? 'Gold' : monthly >= 40 ? 'Silver' : 'Bronze';
  const logs = Object.values(state.logs[email] || {});
  const waterGoal = Number(user.profile.hydrationGoalMl) || 2000;
  const badges = [['✳', '3-day streak', streak >= 3], ['✦', '7-day streak', streak >= 7], ['◉', 'First meal', logs.some(log => log.food.length)], ['◌', 'Daily water goal', logs.some(log => hydrationTotal(log) >= waterGoal)], ['↗', '5 workouts', logs.reduce((sum, log) => sum + log.work.length, 0) >= 5]];
  const chartValues = points.map(point => point.value);
  const latestWeight = [...weighIns].filter(entry => Number.isFinite(Number(entry[1]))).sort((a, b) => b[0].localeCompare(a[0]))[0];
  const low = Math.floor(Math.min(...chartValues, +user.profile.goal) - 1);
  const high = Math.ceil(Math.max(...chartValues, +user.profile.goal) + 1);
  const chartHeight = Math.max(1, high - low);
  const pointX = index => points.length < 2 ? 250 : 24 + index * 452 / (points.length - 1);
  const pointY = value => 148 - (value - low) / chartHeight * 118;
  const validateWeight = (value, date) => {
    if (!Number.isFinite(Number(value)) || Number(value) < 1 || Number(value) > 500) return 'Enter a weight between 1 and 500 kg.';
    const parsedDate = new Date(`${date}T12:00:00`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > today() || Number.isNaN(parsedDate.getTime()) || localDate(parsedDate) !== date) return 'Choose a valid measurement date, not in the future.';
    return '';
  };
  const addWeight = event => {
    event.preventDefault();
    const error = validateWeight(weight, weightDate);
    if (error) { setWeightError(error); return; }
    setState(s => { (s.weights[email] = s.weights[email] || []).push([weightDate, Number(weight), entryId()]); return s; });
    setWeight('');
    setWeightDate(today());
    setWeightError('');
  };
  const saveWeightEdit = () => {
    if (!editingWeight) return;
    const error = validateWeight(weightEditValue, weightEditDate);
    if (error) { setWeightError(error); return; }
    setState(s => { s.weights[email][editingWeight.index] = [weightEditDate, Number(weightEditValue), editingWeight.id]; return s; });
    setEditingWeight(null);
    setWeightError('');
  };
  return <div className="screen-view">
    <ScreenPhotoHeading image="/images/workout-progress.jpg" alt="Athletes running together at dusk" eyebrow="LOOK HOW FAR YOU'VE COME" title="Progress" description="Big changes are made of very ordinary days." trailing={<div className="hero-daily-total"><b>{streak.toString().padStart(2, '0')}</b><span>DAY STREAK</span></div>} />
    <section className="progress-feature"><img src="/images/workout-strength.jpg" alt="Athlete completing a focused strength session" loading="lazy" /><div className="progress-feature-shade" /><div><span className="eyebrow">PROGRESS IS PERSONAL</span><h2>Strong looks like<br />showing up for you.</h2><p>Track the small wins that make a lasting routine: movement, nourishment, and the days you keep your promise.</p></div><span className="progress-feature-index">YOUR OWN PACE / ALWAYS</span></section>
    <div className="progress-grid">
      <section className="app-card consistency-card"><div className="section-heading"><div><span className="eyebrow">CONSISTENCY OVER PERFECTION</span><h2>Your month, in motion.</h2></div><span className="tiny-mark">01</span></div>
        <div className="consistency-stat"><div className="consistency-count"><b>{active}</b><span>/ {monthDays}</span></div><span>active days this month</span></div>{active === 0 && <p className="progress-empty-note">No activity logged yet this month. Your first food or workout entry will show here.</p>}<div className="month-bar"><i style={{ transform: `scaleX(${monthly / 100})` }} /></div><div className="grade-row"><span>YOUR MONTHLY GRADE</span><b>{grade}</b></div>
      </section>
      <section className="app-card badge-card"><div className="section-heading"><div><span className="eyebrow">A FEW THINGS WORTH CELEBRATING</span><h2>Little milestones.</h2></div></div><div className="badge-list">{badges.map(([icon, label, earned]) => <div className={`badge-item ${earned ? 'earned' : ''}`} key={label}><span>{icon}</span><small>{label}</small></div>)}</div></section>
      <section className="app-card weight-card"><div className="section-heading"><div><span className="eyebrow">THE LONG VIEW</span><h2>Weight trend</h2></div><span className="weight-goal">GOAL · {user.profile.goal} KG</span></div>
        <div className="weight-latest"><span>LATEST WEIGH-IN</span><b>{latestWeight ? `${latestWeight[1]} kg` : 'Not recorded yet'}</b>{latestWeight && <small>{new Date(`${latestWeight[0]}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</small>}</div>
        <div className="range-controls" role="group" aria-label="Progress date range">{[[7, '7 days'], [30, '30 days'], [90, '90 days']].map(([days, label]) => <button type="button" className={`filter-chip ${range === days ? 'selected' : ''}`} aria-pressed={range === days} key={days} onClick={() => setRange(days)}>{label}</button>)}</div>
        <p className="range-summary">{points.length} measurement{points.length === 1 ? '' : 's'} in the last {range} days · {activeRangeDays} active {activeRangeDays === 1 ? 'day' : 'days'}</p>
        <form className="weight-entry" onSubmit={addWeight}><label className="field">Weight (kg)<input type="number" min="1" max="500" step=".1" placeholder="e.g. 68.5" value={weight} onChange={e => { setWeight(e.target.value); setWeightError(''); }} required /></label><label className="field">Measurement date<input type="date" max={today()} value={weightDate} onChange={e => { setWeightDate(e.target.value); setWeightError(''); }} required /></label><button className="button button-primary" type="submit" disabled={!weight || !weightDate}>Add weigh-in <span aria-hidden="true">+</span></button></form>
        {weightError && <p className="form-error" role="alert">{weightError}</p>}
        {points.length ? <div className="weight-chart"><div className="weight-axis-labels"><span>{high} kg</span><span>{Math.round((high + low) / 2)} kg</span><span>{low} kg</span></div><svg viewBox="0 0 500 170" role="img" aria-label={`Weight measurements in the last ${range} days, from ${low} to ${high} kilograms`}><path className="chart-baseline" d="M24 148H476" /><path className="weight-target" d={`M24 ${pointY(+user.profile.goal)}H476`} /><polyline className="weight-line" points={points.map((point, i) => `${pointX(i)},${pointY(point.value)}`).join(' ')} />{points.map((point, i) => <circle key={point.id} cx={pointX(i)} cy={pointY(point.value)} r="4" className="weight-point"><title>{point.date}: {point.value} kg</title></circle>)}</svg><div className="chart-dates"><span>{points[0].date}</span><span>{points[points.length - 1].date}</span></div></div> : <div className="weight-empty"><span>↗</span><b>No weigh-ins in this range.</b><small>Add a measurement above. Your 7, 30, and 90 day filters show only entries you record.</small></div>}
        {weighIns.length > 0 && <div className="weight-records"><h3>Recorded measurements</h3>{weighIns.map(([date, value], index) => {
          const id = weighIns[index][2] || `${date}-${index}`;
          return <article className="weight-record" key={id}>{editingWeight?.index === index ? <><label className="sr-only" htmlFor={`weight-date-${id}`}>Measurement date</label><input id={`weight-date-${id}`} type="date" max={today()} value={weightEditDate} onChange={event => { setWeightEditDate(event.target.value); setWeightError(''); }} /><label className="sr-only" htmlFor={`weight-value-${id}`}>Weight in kilograms</label><input id={`weight-value-${id}`} type="number" min="1" max="500" step=".1" value={weightEditValue} onChange={event => { setWeightEditValue(event.target.value); setWeightError(''); }} /><button type="button" className="button button-quiet" onClick={saveWeightEdit}>Save</button><button type="button" className="button button-quiet" onClick={() => setEditingWeight(null)}>Cancel</button></> : <><span>{new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span><b>{value} kg</b><button type="button" className="button button-quiet" aria-label={`Edit ${value} kg from ${date}`} onClick={() => { setEditingWeight({ index, id }); setWeightEditDate(date); setWeightEditValue(String(value)); setWeightError(''); }}>Edit</button><button type="button" className="remove-button" aria-label={`Remove weigh-in from ${date}`} onClick={() => { setState(s => { s.weights[email].splice(index, 1); return s; }); if (editingWeight?.index === index) setEditingWeight(null); }}>×</button></>}</article>;
        })}</div>}
      </section>
    </div>
  </div>;
}

function Settings({ state, email, user, setState, logout, editGoal }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [message, setMessage] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [targetValues, setTargetValues] = useState(() => {
    const currentTargets = caloriePlan(user.profile);
    return { kcal: String(currentTargets.kcal), protein: String(currentTargets.protein), carbs: String(currentTargets.carbs), fat: String(currentTargets.fat) };
  });
  const [targetMessage, setTargetMessage] = useState('');
  const saveTargets = event => {
    event.preventDefault();
    const targets = Object.fromEntries(Object.entries(targetValues).map(([key, value]) => [key, Number(value)]));
    if (Object.values(targets).some(value => !Number.isFinite(value) || value <= 0 || value > 20000)) {
      setTargetMessage('Enter a positive target for each field.');
      return;
    }
    setState(s => { s.users[email].profile.targets = targets; return s; });
    setTargetMessage('Daily targets saved.');
  };
  const changePassword = async () => {
    if (passwordSaving) return;
    if (next.length < 6) return setMessage('New password needs at least 6 characters.');
    setPasswordSaving(true);
    try {
      const check = await checkPassword(current, user);
      if (!check.valid) return setMessage('That current password does not match.');
      const passwordHash = await hashPassword(next);
      setState(s => { s.users[email].passwordHash = passwordHash; delete s.users[email].pw; return s; });
      setCurrent(''); setNext(''); setMessage('Password updated.');
    } catch (passwordError) {
      console.error('Unable to update FORGE password.', passwordError);
      setMessage('Unable to securely update your password in this browser. Try again.');
    } finally {
      setPasswordSaving(false);
    }
  };
  return <div className="screen-view">
    <ScreenPhotoHeading image="/images/workout-gym.jpg" alt="Dumbbells lined up in a bright, modern training space" eyebrow="MAKE FORGE FEEL LIKE YOURS" title="Settings" description="Your account, your goals, your look." />
    <section className="settings-profile-banner"><div className="settings-profile-photo"><img src="/images/workout-dumbbells.jpg" alt="Athlete working with free weights" loading="lazy" /></div><div className="settings-profile-copy"><span className="eyebrow">YOUR FORGE PROFILE</span><h2>{user.name}</h2><p>Built around your routine, your goals, and what feels sustainable.</p><div><span>{user.profile.type} plan</span><span>{user.profile.days} training days / week</span><span>Goal · {user.profile.goal} kg</span></div></div><span className="settings-profile-mark" aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</span></section>
    <div className="settings-grid">
      <section className="app-card settings-card"><div className="section-heading"><div><span className="eyebrow">THE LOOK & FEEL</span><h2>Appearance</h2></div><span className="tiny-mark">01</span></div>
        <span className="settings-label">Colour theme</span><div className="choice-row theme-options">{[['light', '☼', 'Light'], ['dark', '☾', 'Dark']].map(([value, glyph, label]) => <button className={`theme-choice ${state.theme === value ? 'selected' : ''}`} key={value} aria-pressed={state.theme === value} onClick={() => setState(s => { s.theme = value; return s; })}><span>{glyph}</span>{label}</button>)}</div>
        <span className="settings-label">Accent colour</span><div className="accent-options" role="group" aria-label="Accent colour">{ACCENTS.map(color => <button key={color} className={`accent-swatch ${state.accent === color ? 'selected' : ''}`} aria-label={`Use ${color} accent`} aria-pressed={state.accent === color} style={{ '--swatch': color }} onClick={() => setState(s => { s.accent = color; return s; })}>{state.accent === color && <span>✓</span>}</button>)}</div>
      </section>
      <section className="app-card settings-card targets-card"><div className="section-heading"><div><span className="eyebrow">YOUR DAILY PLAN</span><h2>Nutrition targets</h2></div><span className="tiny-mark">02</span></div>
        <p className="food-note">Targets start from your profile and can be personalized. Nutrition totals are estimates from the built-in food list.</p>
        <form className="target-form" onSubmit={saveTargets}>
          {[[['kcal', 'Calories', 'kcal'], ['protein', 'Protein', 'g']], [['carbs', 'Carbohydrates', 'g'], ['fat', 'Fat', 'g']]].map((row, index) => <div className="target-row" key={index}>{row.map(([key, label, unit]) => <label className="field" key={key}>{label} ({unit})<input type="number" min="1" max="20000" step="1" required value={targetValues[key]} onChange={event => { setTargetValues({ ...targetValues, [key]: event.target.value }); setTargetMessage(''); }} /></label>)}</div>)}
          <button className="button button-primary" type="submit">Save targets <span aria-hidden="true">↗</span></button><p className="settings-message" role="status">{targetMessage}</p>
        </form>
      </section>
      <section className="app-card settings-card"><div className="section-heading"><div><span className="eyebrow">KEEP IT YOURS</span><h2>Change password</h2></div></div>
        <label className="field">Current password<input type="password" autoComplete="current-password" value={current} onChange={e => setCurrent(e.target.value)} /></label><label className="field">New password<input type="password" autoComplete="new-password" value={next} onChange={e => setNext(e.target.value)} placeholder="At least 6 characters" /></label>
        <button className="button button-primary" onClick={changePassword} disabled={passwordSaving}>{passwordSaving ? 'Updating securely…' : 'Update password'} <span aria-hidden="true">↗</span></button><p className="settings-message" role="status">{message}</p>
      </section>
      <section className="app-card settings-card account-card"><div className="section-heading"><div><span className="eyebrow">YOUR STARTING POINT</span><h2>Your plan</h2></div></div>
        <div className="account-details"><span>BODYWEIGHT</span><b>{user.profile.weight} kg</b><span>GOAL WEIGHT</span><b>{user.profile.goal} kg</b><span>TRAINING STYLE</span><b>{user.profile.type}</b><span>GYM DAYS / WEEK</span><b>{user.profile.days}</b></div>
        <div className="account-actions"><button className="button button-quiet" onClick={editGoal}>Edit goal & plan <span aria-hidden="true">↗</span></button><button className="button button-danger" onClick={logout}>Log out <span aria-hidden="true">↗</span></button></div>
      </section>
    </div>
  </div>;
}

const NAV_ITEMS = [['Dashboard', '01'], ['Food', '02'], ['Workout', '03'], ['Progress', '04'], ['Settings', '05']];

function App() {
  const [state, setState] = useState(readState);
  const [storageError, setStorageError] = useState(false);
  const [page, setPage] = useState('land');
  const [tab, setTab] = useState('Dashboard');
  const [workoutFocus, setWorkoutFocus] = useState('Gym');
  const [profileDraft, setProfileDraft] = useState(null);
  const pendingFeatureRef = useRef(null);
  useEffect(() => {
    setStorageError(!saveState(state));
  }, [state]);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = state.theme;
    root.style.setProperty('--accent', state.accent);
  }, [state.theme, state.accent]);
  useEffect(() => { window.scrollTo(0, 0); }, [page, tab, state.session]);
  const updateState = updater => setState(current => {
    const draft = JSON.parse(JSON.stringify(current));
    return updater(draft) || draft;
  });
  const activeEmail = state.session;
  const user = activeEmail && state.users[activeEmail];
  useEffect(() => {
    if (user && pendingFeatureRef.current) {
      setTab(pendingFeatureRef.current);
      pendingFeatureRef.current = null;
    }
  }, [user]);
  const updateDay = callback => updateState(s => {
    const logs = (s.logs[activeEmail] = s.logs[activeEmail] || {});
    const day = (logs[today()] = logs[today()] || { food: [], work: [], waterEntries: [] });
    if (!Array.isArray(day.waterEntries)) day.waterEntries = [];
    callback(day);
    return s;
  });
  useEffect(() => {
    const handleKeys = event => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        const search = document.querySelector('.search-box input');
        if (search) { event.preventDefault(); search.focus(); }
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [tab]);
  const saveWarning = storageError && <div className="storage-warning" role="alert">FORGE could not save your latest changes in this browser. Check available storage and try again.</div>;
  if (!user) return <><style>{styles}</style>{saveWarning}{page === 'land' ? <Landing go={setPage} goFeature={feature => { pendingFeatureRef.current = feature; setPage('signup'); }} /> : <Auth mode={page} setMode={setPage} state={state} setState={updateState} go={setPage} />}</>;
  if (!user.profile) return <><style>{styles}</style>{saveWarning}<Setup user={user} initialProfile={profileDraft} save={profile => {
    updateState(s => { s.users[activeEmail].profile = { ...profileDraft, ...profile }; return s; });
    setProfileDraft(null);
  }} /></>;
  const plan = caloriePlan(user.profile);
  const startWorkout = category => {
    setWorkoutFocus(category);
    setTab('Workout');
  };
  const logout = () => { updateState(s => { s.session = null; return s; }); setTab('Dashboard'); setPage('land'); };
  const editGoal = () => {
    setProfileDraft(user.profile);
    updateState(s => { s.users[activeEmail].profile = null; return s; });
  };
  let content;
  if (tab === 'Dashboard') content = <Dashboard state={state} email={activeEmail} user={user} plan={plan} update={updateDay} navigate={setTab} startWorkout={startWorkout} saveHydrationGoal={ml => updateState(s => { s.users[activeEmail].profile.hydrationGoalMl = ml; return s; })} />;
  if (tab === 'Food') content = <Food state={state} email={activeEmail} user={user} update={updateDay} />;
  if (tab === 'Workout') content = <Workout state={state} email={activeEmail} update={updateDay} initialCategory={workoutFocus} />;
  if (tab === 'Progress') content = <Progress state={state} email={activeEmail} user={user} setState={updateState} />;
  if (tab === 'Settings') content = <Settings state={state} email={activeEmail} user={user} setState={updateState} logout={logout} editGoal={editGoal} />;
  return <><style>{styles}</style>{saveWarning}<div className="app-shell">
    <header className="app-header"><div className="app-header-inner"><a className="brand" href="#" onClick={event => { event.preventDefault(); setTab('Dashboard'); }}><DumbbellMark size={38} /><span>FORGE<small>DAILY, BUILT BETTER</small></span></a>
      <nav className="app-nav" aria-label="Main navigation">{NAV_ITEMS.map(([name, number]) => <button key={name} aria-current={tab === name ? 'page' : undefined} className={tab === name ? 'active' : ''} onClick={() => setTab(name)}><span className="nav-number">{number}</span>{name}</button>)}</nav>
      <button className="profile-button" onClick={() => setTab('Settings')} aria-label={`Account settings for ${user.name}`}><span>{user.name.slice(0, 1).toUpperCase()}</span><b>{user.name.split(' ')[0]}</b><i>↗</i></button>
    </div></header>
    <main className="app-main" key={tab}>{content}</main>
    <footer className="app-footer"><span><DumbbellMark size={26} /> FORGE</span><span>BUILT A DAY AT A TIME.</span></footer>
  </div></>;
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
button.add-button{width:44px;height:44px;min-height:44px}button.remove-button{width:44px;height:44px;min-height:44px}button.accent-swatch{width:44px;height:44px;min-height:44px}button.filter-chip{min-height:44px}
:root:not([data-theme=dark]){--bg:#fff}
:root{--bg:#fbfaf7;--fg:#101e37;--card:#fff;--line:#e3e4df;--muted:#566174;--accent:#1e3a8a;--accent-ink:#fff;--soft:#f0f1ed;--green:#2f6c54;--danger:#a72e48;--mascot-eye:#fff;--mascot-pupil:#101e37;--ease:cubic-bezier(.2,.8,.2,1);--ease-out:cubic-bezier(.16,1,.3,1);font-family:'DM Sans',system-ui,sans-serif;color:var(--fg);background:var(--bg);font-synthesis:none;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased}
:root[data-theme=dark]{--bg:#0c1424;--fg:#edf2f8;--card:#131f33;--line:#29384d;--muted:#b3bfd0;--soft:#19263a;--accent-ink:#fff;--green:#73b894;--danger:#ff879a;--mascot-pupil:#101e37}
*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:90px}body{margin:0;min-width:320px;background:var(--bg);color:var(--fg);font-family:'DM Sans',system-ui,sans-serif}button,input{font:inherit;color:inherit}button{min-height:44px}button:focus-visible,a:focus-visible,input:focus-visible{outline:3px solid color-mix(in srgb,var(--accent) 48%,white);outline-offset:3px}button:disabled{cursor:not-allowed;opacity:.48}.mascot{display:block;flex:none}.eyebrow,.setup-step,.date-label,.card-eyebrow,.tiny-mark,.nav-number,.story-step-label,.hero-foot,.hero-side-note,.marquee,.feature-index,.closing-index,.landing-footer,.form-error,.privacy-note,.logged-count,.water-footer,.chart-legend,.focus-line>span,.plate-total>span,.weight-goal,.grade-row,.settings-label,.settings-message,.account-details>span,.app-footer,.brand small,.header-actions,.auth-tabs,.filter-chip,.category-tabs,.empty-note{font-family:'DM Mono',monospace;letter-spacing:.075em}
.button{border:1px solid var(--line);border-radius:4px;background:transparent;display:inline-flex;align-items:center;justify-content:center;gap:18px;padding:0 18px;min-height:48px;text-decoration:none;font-size:14px;font-weight:700;cursor:pointer;transition:transform .18s var(--ease-out),background-color .18s var(--ease),border-color .18s var(--ease),color .18s var(--ease)}.button:hover{transform:translateY(-2px)}.button:active{transform:scale(.97)}.button-primary{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}.button-primary:hover{background:color-mix(in srgb,var(--accent) 88%,var(--fg));border-color:color-mix(in srgb,var(--accent) 88%,var(--fg))}.button-quiet{border-color:transparent;color:var(--fg)}.button-danger{color:var(--danger)}.button-large{min-height:56px;padding:0 22px}.button span{font-size:17px}
.brand{color:var(--fg);display:inline-flex;align-items:center;gap:9px;text-decoration:none;font-family:'Space Grotesk',sans-serif;font-weight:700;letter-spacing:.12em;font-size:16px;line-height:1}.brand small{display:block;color:var(--muted);font-size:8px;letter-spacing:.12em;margin-top:5px}.brand-button{border:0;background:transparent;padding:0;cursor:pointer}.site-header{height:78px;padding:0 clamp(20px,5vw,76px);display:flex;align-items:center;justify-content:space-between;position:relative;z-index:5}.header-actions{display:flex;align-items:center;gap:8px}.header-actions .button{letter-spacing:0;font-family:'DM Sans',sans-serif}
.landing{overflow-x:clip;overflow-y:visible}.landing-header{position:absolute;inset:0 0 auto;border-bottom:1px solid color-mix(in srgb,var(--fg) 10%,transparent)}.hero{min-height:min(920px,100svh);min-height:max(740px,100svh);position:relative;isolation:isolate;display:flex;align-items:center;padding:140px clamp(24px,12vw,180px) 100px;background:var(--bg)}.hero-content{position:relative;z-index:2;max-width:890px}.hero h1,.auth-aside h1,.setup-card h1,.view-heading h1,.closing h2,.manifesto h2{font-family:'Space Grotesk',sans-serif;font-weight:700;letter-spacing:-.09em}.hero h1{font-size:clamp(90px,17.5vw,248px);line-height:.74;margin:32px 0 28px;display:flex;flex-direction:column;align-items:flex-start}.hero h1>span{display:block;animation:hero-in .85s var(--ease-out) both}.hero h1>span:nth-child(2){animation-delay:90ms}.hero h1>span:nth-child(3){animation-delay:170ms}.hero h1>span:nth-child(4){animation-delay:250ms}.headline-outline{color:transparent;-webkit-text-stroke:1.5px var(--fg);margin-left:.42em}.headline-accent{color:var(--accent)}.period{color:var(--fg)}.hero-content>p{font-size:clamp(16px,2vw,20px);color:var(--muted);max-width:440px;margin:0;line-height:1.6}.hero-cta{display:flex;align-items:center;gap:18px;margin-top:30px}.hero-cta>span{font-size:12px;color:var(--muted)}.hero-glow{position:absolute;z-index:-1;width:46vw;height:46vw;max-width:560px;max-height:560px;border-radius:50%;background:color-mix(in srgb,var(--accent) 12%,transparent);opacity:.7;transform:translate3d(0,var(--scroll-shift,0),0)}.hero-glow-a{right:5%;top:13%}.hero-glow-b{width:22vw;height:22vw;left:39%;bottom:0;opacity:.45}.hero-side-note{position:absolute;right:clamp(24px,6vw,84px);top:43%;font-size:10px;line-height:1.8;color:var(--muted);text-align:right}.hero-dumbbell{position:absolute;right:15%;bottom:18%;animation:mascot-float 4.8s ease-in-out infinite;opacity:.9}.hero-foot{position:absolute;bottom:28px;left:clamp(24px,5vw,76px);right:clamp(24px,5vw,76px);display:flex;justify-content:space-between;font-size:9px;color:var(--muted)}
.marquee{overflow:hidden;border-block:1px solid var(--line);padding:22px 0;white-space:nowrap;font-family:'Space Grotesk',sans-serif;font-size:clamp(18px,3vw,34px);font-weight:700;letter-spacing:-.025em}.marquee-track{display:flex;width:max-content;animation:marquee 34s linear infinite}.marquee-track>span{padding-right:18px}.marquee i{font-style:normal;color:var(--accent);padding:0 16px}
.story-section{height:300vh;position:relative}.story-sticky{height:100svh;min-height:620px;position:sticky;top:0;display:grid;align-items:center;overflow:hidden}.story-shell{position:relative;max-width:1200px;width:100%;margin:auto;padding:30px clamp(24px,8vw,110px);display:grid;grid-template-columns:.9fr 1.1fr;gap:4vw;align-items:center}.story-copy{position:relative;z-index:2}.story-number{color:var(--accent);margin-right:14px}.story-copy .eyebrow{font-size:10px;color:var(--muted)}.story-copy h2{font-family:'Space Grotesk',sans-serif;font-size:clamp(44px,6vw,76px);letter-spacing:-.075em;line-height:.98;margin:25px 0 17px;animation:story-in .42s var(--ease-out) both}.story-copy p{color:var(--muted);font-size:16px;line-height:1.7;max-width:400px;margin:0}.story-progress{height:2px;background:var(--line);margin:34px 0 12px;max-width:350px;overflow:hidden}.story-progress span{display:block;width:100%;height:100%;background:var(--accent);transform-origin:left}.story-step-label{max-width:350px;display:flex;justify-content:space-between;font-size:9px;color:var(--muted)}.story-art{min-width:0;aspect-ratio:1.2;position:relative;display:grid;place-items:center}.story-art:before{content:'';position:absolute;width:75%;aspect-ratio:1;border:1px solid var(--line);border-radius:50%}.story-art:after{content:'';position:absolute;width:58%;aspect-ratio:1;border:1px dashed var(--line);border-radius:50%;transform:rotate(-24deg)}.phone-visual{position:relative;z-index:1;width:min(320px,78%);background:var(--card);border:1px solid var(--line);border-radius:18px;padding:18px;box-shadow:0 28px 85px color-mix(in srgb,var(--fg) 12%,transparent);transform:rotate(2deg);animation:float-slow 5s ease-in-out infinite}.phone-top{display:flex;justify-content:space-between;font:9px 'DM Mono',monospace;letter-spacing:.08em;color:var(--muted)}.phone-ring{width:155px;height:155px;margin:12px auto 14px;position:relative;display:grid;place-items:center}.phone-ring svg{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg);fill:none;stroke:var(--line);stroke-width:5}.phone-ring svg circle+circle{stroke:var(--accent);stroke-dasharray:346;stroke-linecap:round;transition:stroke-dashoffset .25s}.phone-ring>div{text-align:center}.phone-ring b{font:700 32px 'Space Grotesk',sans-serif;display:block;letter-spacing:-.06em}.phone-ring small{font:9px 'DM Mono',monospace;color:var(--muted)}.meal-row{border-top:1px solid var(--line);padding:12px 0;display:grid;grid-template-columns:28px 1fr auto;align-items:center;gap:8px;font-size:12px}.meal-row>i{color:var(--accent);font-style:normal}.meal-row span small{display:block;color:var(--muted);font-size:10px;margin-top:3px}.meal-row>b{font:500 11px 'DM Mono',monospace}.lift-visual,.streak-visual{width:100%;max-width:440px;position:relative;z-index:1}.lift-caption{font:9px 'DM Mono',monospace;color:var(--muted);letter-spacing:.08em}.lift-caption b{color:var(--fg);display:block;font-size:12px;margin-top:6px}.lift-visual svg,.streak-visual svg{width:100%;overflow:visible}.lift-visual svg path{stroke:var(--accent);stroke-width:7;stroke-linecap:round;fill:none}.lift-visual svg .lift-shadow{stroke:var(--fg);opacity:.18;transform:translateY(8px)}.lift-visual svg .lift-orbit{fill:var(--card);stroke:var(--line);stroke-width:1}.lift-visual svg .lift-smile{stroke:var(--accent);stroke-width:3}.lift-stat{display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--line);padding-top:12px}.lift-stat>span{font:9px 'DM Mono',monospace;color:var(--muted)}.lift-stat>b{font:600 27px 'Space Grotesk',sans-serif}.lift-stat small{font-size:12px;color:var(--muted)}.chart-grid{stroke:var(--line);stroke-width:1;fill:none}.chart-line{fill:none;stroke:var(--accent);stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;transition:stroke-dashoffset .25s}.chart-dot{fill:var(--accent)}.streak-label{position:absolute;top:35%;left:32%;display:flex;flex-direction:column}.streak-label>b{font:700 50px 'Space Grotesk',sans-serif;letter-spacing:-.08em;color:var(--accent)}.streak-label>span{font:9px 'DM Mono',monospace;letter-spacing:.1em}.streak-label>small{font-size:10px;color:var(--muted);margin-top:8px}.story-watermark{position:absolute;right:0;bottom:-75px;font:700 clamp(170px,32vw,370px)/1 'Space Grotesk',sans-serif;letter-spacing:-.12em;color:color-mix(in srgb,var(--accent) 5%,transparent);pointer-events:none}
.manifesto{padding-top:130px;padding-bottom:140px}.section-wrap{max-width:1110px;margin:auto;padding-left:26px;padding-right:26px}.manifesto>.eyebrow{font-size:10px;color:var(--muted)}.manifesto h2{font-size:clamp(45px,8vw,100px);line-height:.94;margin:23px 0 62px;max-width:900px}.manifesto h2 em,.closing h2 em,.auth-aside h1 em,.setup-card h1 em{color:var(--accent);font-style:normal}.feature-grid{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}.feature-card{position:relative;padding:24px 20px 34px 0;min-height:210px;border-right:1px solid var(--line);margin-right:20px;opacity:0;transform:translateY(18px);transition:opacity .5s var(--ease-out),transform .5s var(--ease-out);transition-delay:var(--delay,0ms)}.feature-card:last-child{border:0;margin:0}.feature-card.revealed,.manifesto>[data-reveal].revealed,.closing-inner.revealed{opacity:1;transform:translateY(0)}.feature-index{font-size:10px;color:var(--muted)}.feature-index span{color:var(--accent)}.feature-card h3{font:600 21px 'Space Grotesk',sans-serif;letter-spacing:-.04em;margin:35px 0 9px}.feature-card p{font-size:13px;line-height:1.65;color:var(--muted);max-width:230px;margin:0}.feature-arrow{position:absolute;right:22px;top:22px;color:var(--accent);font-size:18px}.closing{padding:90px 24px 80px;background:var(--soft);text-align:center;position:relative}.closing-inner{display:flex;align-items:center;flex-direction:column;opacity:0;transform:translateY(18px);transition:opacity .6s var(--ease-out),transform .6s var(--ease-out)}.closing-inner .eyebrow{font-size:9px;color:var(--muted);margin-top:20px}.closing h2{font-size:clamp(56px,10vw,120px);line-height:.86;margin:24px 0 30px}.closing-index{position:absolute;bottom:24px;left:28px;font-size:9px;color:var(--muted)}.landing-footer,.app-footer{display:flex;align-items:center;justify-content:space-between;padding:20px clamp(24px,5vw,76px);font-size:9px;color:var(--muted)}.landing-footer>span:first-child,.app-footer>span:first-child{display:flex;align-items:center;gap:8px;color:var(--fg);font:700 12px 'Space Grotesk',sans-serif;letter-spacing:.12em}
.auth-page,.setup-page{min-height:100svh}.auth-header{border-bottom:1px solid var(--line)}.auth-layout{max-width:1100px;margin:auto;padding:70px 28px 100px;display:grid;grid-template-columns:1fr .82fr;gap:9vw;align-items:center;min-height:calc(100svh - 78px)}.auth-aside{position:relative;min-height:460px;padding-top:45px}.auth-aside .eyebrow{font-size:10px;color:var(--muted)}.auth-aside h1{font-size:clamp(64px,9vw,115px);line-height:.86;margin:27px 0;animation:hero-in .65s var(--ease-out) both}.auth-aside>p{color:var(--muted);font-size:15px;line-height:1.7;max-width:340px}.auth-aside-mark{position:absolute;right:5%;bottom:8%;opacity:.82;animation:mascot-float 4s ease-in-out infinite}.auth-card{background:var(--card);border:1px solid var(--line);padding:clamp(24px,4vw,42px);box-shadow:0 20px 60px color-mix(in srgb,var(--fg) 5%,transparent);animation:hero-in .5s var(--ease-out) both}.auth-card>.eyebrow,.setup-card>.eyebrow{color:var(--muted);font-size:10px}.auth-card h2,.setup-card h1{font:600 clamp(27px,3vw,34px)/1.15 'Space Grotesk',sans-serif;letter-spacing:-.06em;margin:17px 0 8px}.form-intro{color:var(--muted);font-size:13px;line-height:1.6;margin:0 0 24px}.auth-tabs{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid var(--line);margin-bottom:19px;letter-spacing:0}.auth-tabs button{background:transparent;border:0;border-bottom:2px solid transparent;color:var(--muted);font-size:13px;cursor:pointer}.auth-tabs button.selected{border-color:var(--accent);color:var(--fg);font-weight:700}.field{display:block;color:var(--fg);font-size:12px;font-weight:600;margin:16px 0}.field input{display:block;width:100%;height:48px;margin-top:7px;padding:0 13px;background:var(--bg);border:1px solid var(--line);border-radius:3px;font-size:14px}.field input::placeholder{color:color-mix(in srgb,var(--muted) 70%,transparent)}.field input:focus{border-color:var(--accent);outline:3px solid color-mix(in srgb,var(--accent) 15%,transparent)}.form-error{color:var(--danger);min-height:20px;margin:8px 0;font-size:10px;letter-spacing:0}.form-submit{width:100%;margin-top:10px}.privacy-note{text-align:center;font-size:9px;color:var(--muted);margin:17px 0 0;letter-spacing:0}
.setup-page{padding-bottom:60px}.setup-step{font-size:9px;color:var(--muted)}.setup-step b{color:var(--accent);margin-left:12px}.setup-card{width:min(690px,calc(100% - 40px));margin:52px auto;padding:clamp(24px,5vw,52px);background:var(--card);border:1px solid var(--line);animation:hero-in .5s var(--ease-out) both}.setup-card h1{font-size:clamp(34px,6vw,54px);max-width:540px}.setup-card h1 em{color:var(--accent)}.field-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.input-unit{position:relative;display:block}.input-unit i{position:absolute;right:14px;top:22px;font-style:normal;font-family:'DM Mono',monospace;font-size:11px;color:var(--muted)}.input-unit input{padding-right:45px}.setup-group{border:0;padding:0;margin:24px 0}.setup-group legend{font-size:12px;font-weight:700;padding:0 0 10px}.physique-options{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.physique-option{display:flex;align-items:flex-start;flex-direction:column;text-align:left;background:var(--bg);border:1px solid var(--line);padding:13px;cursor:pointer;transition:transform .18s var(--ease-out),border-color .18s,background .18s}.physique-option:hover{transform:translateY(-2px)}.physique-option.selected{border:1.5px solid var(--accent);background:color-mix(in srgb,var(--accent) 6%,var(--bg))}.physique-glyph{font-size:23px;color:var(--accent);margin-bottom:10px}.physique-option b{font-size:13px}.physique-option small{font-size:10px;color:var(--muted);margin-top:5px}.choice-row{display:flex;gap:9px}.choice-button{flex:1;background:var(--bg);border:1px solid var(--line);font-size:12px;cursor:pointer;transition:background .18s,border .18s}.choice-button.selected{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 7%,var(--bg))}.days-field{position:relative}.days-number{float:right;font:700 14px 'Space Grotesk',sans-serif;color:var(--accent)}.days-number small{font:11px 'DM Mono',monospace}.days-field input[type=range]{display:block;width:100%;height:8px;margin-top:15px;accent-color:var(--accent)}
.app-shell{min-height:100svh}.app-header{height:74px;position:sticky;z-index:10;top:0;background:color-mix(in srgb,var(--bg) 92%,transparent);backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}.app-header-inner{height:100%;max-width:1320px;margin:auto;padding:0 clamp(18px,4vw,52px);display:flex;align-items:center;justify-content:space-between;gap:22px}.app-header .brand{font-size:14px}.app-header .brand .mascot{width:34px;height:34px}.app-header .brand small{font-size:7px}.app-nav{display:flex;align-items:center;gap:3px}.app-nav button{background:transparent;border:0;border-bottom:2px solid transparent;padding:0 13px;color:var(--muted);font-size:12px;cursor:pointer;transition:color .18s,border-color .18s}.app-nav button:hover,.app-nav button.active{color:var(--fg)}.app-nav button.active{border-color:var(--accent)}.nav-number{font-size:8px;color:var(--accent);margin-right:7px}.profile-button{display:flex;align-items:center;gap:9px;background:transparent;border:0;font-size:12px;cursor:pointer}.profile-button>span{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:var(--accent);color:var(--accent-ink);font:700 12px 'Space Grotesk',sans-serif}.profile-button b{font-weight:600}.profile-button i{font-style:normal;color:var(--muted)}.app-main{max-width:1200px;margin:auto;padding:52px clamp(20px,4vw,56px) 78px;min-height:calc(100svh - 138px);animation:screen-in .32s var(--ease-out) both}.view-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-bottom:30px}.view-heading .eyebrow{font-size:9px;color:var(--muted)}.view-heading h1{font-size:clamp(45px,7vw,70px);line-height:.98;margin:12px 0 9px}.heading-dot,.wave{color:var(--accent)}.view-heading p{font-size:14px;color:var(--muted);margin:0}.date-label{font-size:9px;color:var(--muted);padding-bottom:7px;letter-spacing:.04em}.daily-total,.streak-summary{display:flex;align-items:flex-end;flex-direction:column}.daily-total>b,.streak-summary>b{font:600 30px 'Space Grotesk',sans-serif;letter-spacing:-.06em}.daily-total>span,.streak-summary>span{font:9px 'DM Mono',monospace;color:var(--muted);letter-spacing:.08em}.dashboard-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.app-card{background:var(--card);border:1px solid var(--line);padding:clamp(20px,3vw,30px);min-width:0}.card-eyebrow,.tiny-mark{font-size:9px;color:var(--muted)}.card-eyebrow{display:flex;justify-content:space-between}.calories-card{display:flex;align-items:center;flex-direction:column;justify-content:center;min-height:328px}.calorie-ring{position:relative;width:205px;height:205px;margin:12px 0}.calorie-ring svg{width:100%;height:100%;transform:rotate(-90deg);overflow:visible}.ring-track,.ring-value{fill:none;stroke-width:8}.ring-track{stroke:var(--line)}.ring-value{stroke:var(--accent);stroke-linecap:round;transition:stroke-dashoffset .75s var(--ease-out)}.ring-copy{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column}.ring-copy>b{font:600 43px 'Space Grotesk',sans-serif;letter-spacing:-.08em}.ring-copy>span{font:9px 'DM Mono',monospace;color:var(--muted);letter-spacing:.1em}.calories-summary{color:var(--muted);font-size:12px;margin:0}.calories-summary b{color:var(--fg);font-weight:600}.calories-summary span{padding:0 6px;color:var(--accent)}.card-title-row,.section-heading{display:flex;align-items:center;justify-content:space-between;gap:12px}.card-title-row h2,.section-heading h2{font:600 22px 'Space Grotesk',sans-serif;letter-spacing:-.05em;margin:6px 0 0}.card-title-row .eyebrow,.section-heading .eyebrow{font-size:9px;color:var(--muted)}.macro-item{margin-top:22px}.macro-copy{display:flex;justify-content:space-between;font-size:12px;margin-bottom:9px}.macro-copy>b{font:500 11px 'DM Mono',monospace}.macro-copy small{font-size:10px;color:var(--muted)}.macro-track,.month-bar{height:5px;border-radius:5px;background:var(--soft);overflow:hidden}.macro-track i{display:block;width:100%;height:100%;background:var(--macro);transform-origin:left;border-radius:5px;transition:transform .65s var(--ease-out)}.macro-note{font:9px 'DM Mono',monospace;color:var(--muted);margin-top:20px}.water-card>p{font-size:12px;color:var(--muted);margin:18px 0 14px}.water-total{font:600 22px 'Space Grotesk',sans-serif}.water-total small{font:11px 'DM Mono',monospace;color:var(--muted)}.water-cups{display:grid;grid-template-columns:repeat(8,1fr);gap:8px}.water-cup{height:51px;background:transparent;border:1px solid var(--line);border-radius:3px 3px 9px 9px;padding:4px;display:flex;align-items:flex-end;overflow:hidden;cursor:pointer;transition:border-color .18s,transform .18s var(--ease-out)}.water-cup:hover{transform:translateY(-2px);border-color:var(--accent)}.water-cup:active{transform:scale(.97)}.water-cup span{display:block;height:100%;width:100%;background:transparent;transform:scaleY(.1);transform-origin:bottom;transition:transform .25s var(--ease-out),background .2s}.water-cup.filled span{transform:scaleY(1);background:var(--accent)}.water-footer{display:flex;justify-content:space-between;margin-top:18px;font-size:8px;color:var(--muted)}.chart-legend{font-size:8px;color:var(--muted)}.chart-legend i{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--accent);margin-right:5px}.week-chart{height:160px;display:flex;gap:16px;align-items:stretch;margin-top:18px}.week-column{flex:1;display:flex;flex-direction:column;align-items:center;gap:7px}.week-bar-wrap{flex:1;width:100%;display:flex;align-items:flex-end;background:linear-gradient(to top,transparent 32%,var(--line) 33%,transparent 34%,transparent 65%,var(--line) 66%,transparent 67%)}.week-bar-wrap i{display:block;width:100%;height:100%;background:var(--accent);transform-origin:bottom;border-radius:2px 2px 0 0;transition:transform .7s var(--ease-out)}.week-column>span{font:9px 'DM Mono',monospace;color:var(--muted)}.week-column>span.today-label{color:var(--accent);font-weight:700}.focus-line{margin:18px 0 0;border-top:1px solid var(--line);padding-top:14px;display:flex;justify-content:space-between;gap:12px}.focus-line>span{font-size:8px;color:var(--muted);flex:none}.focus-line>b{font-size:10px;font-weight:600;text-align:right}.dashboard-grid .app-card{min-height:280px}.skeleton-card{height:280px;background:linear-gradient(100deg,var(--card) 30%,var(--soft) 50%,var(--card) 70%);background-size:200% 100%;animation:skeleton 1.2s linear infinite;border:1px solid var(--line)}
.two-column{display:grid;grid-template-columns:1.08fr .92fr;gap:14px;align-items:start}.section-heading{margin-bottom:22px}.section-heading .tiny-mark{color:var(--accent)}.daily-total{padding-bottom:5px}.search-box{height:48px;display:flex;align-items:center;gap:10px;padding:0 12px;border:1px solid var(--line);background:var(--bg)}.search-box>span{font-size:21px;color:var(--muted)}.search-box input{flex:1;min-width:0;height:42px;border:0;background:transparent;outline:0;font-size:13px}.search-box input:focus-visible{outline:0}.search-box kbd{font:9px 'DM Mono',monospace;color:var(--muted);border:1px solid var(--line);padding:4px}.filter-row{display:flex;gap:7px;margin:15px 0}.filter-chip{padding:0 12px;min-height:36px;border:1px solid var(--line);background:transparent;border-radius:40px;font-size:9px;letter-spacing:.03em;cursor:pointer;transition:background .18s,border-color .18s,color .18s}.filter-chip.selected{background:var(--fg);color:var(--bg);border-color:var(--fg)}.food-list,.logged-list{max-height:440px;overflow:auto;scrollbar-width:thin;scrollbar-color:var(--line) transparent}.food-item,.logged-item{min-height:65px;border-top:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:10px;animation:list-in .28s var(--ease-out) both}.food-item>div,.logged-item>div{display:flex;flex-direction:column;gap:5px}.food-item b,.logged-item b{font-size:12px;font-weight:600}.food-item>div>span,.logged-item>div>span{font:9px 'DM Mono',monospace;color:var(--muted);letter-spacing:.01em}.food-item i,.logged-item i{font-style:normal;color:var(--accent)}.add-button{flex:none;width:38px;height:38px;min-height:38px;border:1px solid var(--line);background:transparent;font:20px 'DM Sans',sans-serif;cursor:pointer;transition:background .18s,border-color .18s,color .18s,transform .18s var(--ease-out)}.add-button:hover{background:var(--accent);border-color:var(--accent);color:white}.add-button:active{transform:scale(.94)}.logged-count{font-size:9px;color:var(--muted);white-space:nowrap}.empty-state{min-height:210px;display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center}.empty-mark{font-size:26px;color:var(--accent);margin-bottom:13px}.empty-state>b{font:600 17px 'Space Grotesk',sans-serif}.empty-state>p{font-size:12px;color:var(--muted);margin:8px 0}.plate-total{border-top:1px solid var(--line);margin-top:15px;padding-top:17px;display:flex;align-items:center;justify-content:space-between}.plate-total>span{font-size:8px;color:var(--muted)}.plate-total>b{font:600 17px 'Space Grotesk',sans-serif}.plate-total small{font:9px 'DM Mono',monospace;color:var(--muted)}.remove-button{border:0;background:transparent;width:40px;height:40px;min-height:40px;font-size:22px;color:var(--muted);cursor:pointer;transition:color .15s,transform .15s}.remove-button:hover{color:var(--danger);transform:rotate(6deg)}.empty-note{color:var(--muted);font-size:10px}
.category-tabs{display:flex;border-bottom:1px solid var(--line);gap:12px;margin-bottom:18px}.category-tabs button{border:0;border-bottom:2px solid transparent;background:transparent;padding:0 11px;color:var(--muted);font-size:10px;letter-spacing:.05em;cursor:pointer}.category-tabs button.selected{border-color:var(--accent);color:var(--fg)}.exercise-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.exercise-choice{min-height:52px;padding:0 12px;background:var(--bg);border:1px solid var(--line);text-align:left;font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;transition:transform .18s var(--ease-out),border-color .18s,background .18s}.exercise-choice:hover{transform:translateY(-2px);border-color:var(--accent)}.exercise-choice.selected{background:color-mix(in srgb,var(--accent) 8%,var(--bg));border-color:var(--accent)}.exercise-choice>span{color:var(--accent)}.exercise-config{border-top:1px solid var(--line);margin-top:23px;padding-top:20px;animation:list-in .22s var(--ease-out) both}.config-title{display:flex;justify-content:space-between;align-items:center}.config-title .eyebrow{font:9px 'DM Mono',monospace;color:var(--muted)}.config-title h3{font:600 18px 'Space Grotesk',sans-serif;margin:5px 0}.exercise-config .field{margin:12px 0}.exercise-config .form-submit{margin-top:5px}.workout-log .empty-state{min-height:245px}.workout-columns .app-card{min-height:400px}
.progress-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.consistency-stat{margin-top:32px;display:flex;align-items:baseline;gap:12px}.consistency-stat>b{font:600 55px 'Space Grotesk',sans-serif;letter-spacing:-.08em}.consistency-stat>b small{font-size:20px;color:var(--muted)}.consistency-stat>span{font-size:12px;color:var(--muted)}.month-bar{height:8px}.month-bar i{display:block;width:100%;height:100%;transform-origin:left;background:var(--accent);transition:transform .7s var(--ease-out)}.grade-row{display:flex;justify-content:space-between;margin-top:17px;font-size:9px;color:var(--muted)}.grade-row>b{font:600 12px 'Space Grotesk',sans-serif;color:var(--accent)}.badge-list{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:25px}.badge-item{min-width:0;text-align:center;opacity:.42;filter:grayscale(1)}.badge-item.earned{opacity:1;filter:none}.badge-item>span{width:48px;height:48px;margin:auto auto 9px;border-radius:50%;display:grid;place-items:center;background:var(--soft);color:var(--accent);font-size:21px}.badge-item small{font:8px 'DM Mono',monospace;letter-spacing:0;display:block;line-height:1.5;color:var(--muted)}.weight-card{grid-column:1/-1}.weight-goal{font-size:8px;color:var(--muted)}.weight-entry{display:flex;align-items:center;gap:10px;max-width:440px;margin:20px 0}.weight-entry .field{flex:1;margin:0}.weight-entry .field input{margin:0}.weight-entry .button{flex:none}.weight-chart{height:190px;padding-top:10px}.weight-chart svg{width:100%;height:155px;overflow:visible}.chart-baseline{stroke:var(--line);stroke-width:1}.weight-target{stroke:var(--muted);stroke-width:1;stroke-dasharray:4 5;opacity:.7}.weight-line{fill:none;stroke:var(--accent);stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.weight-point{fill:var(--card);stroke:var(--accent);stroke-width:2}.chart-dates{display:flex;justify-content:space-between;font:8px 'DM Mono',monospace;color:var(--muted)}.weight-empty{height:160px;display:flex;align-items:center;justify-content:center;flex-direction:column;color:var(--muted);gap:8px}.weight-empty>span{font-size:24px;color:var(--accent)}.weight-empty>b{font-size:13px;color:var(--fg)}.weight-empty>small{font-size:11px}
.settings-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.settings-card{min-height:260px}.settings-label{display:block;margin:24px 0 10px;font-size:9px;color:var(--muted)}.theme-options{margin:0}.theme-choice{flex:1;display:flex;align-items:center;justify-content:center;gap:9px;background:var(--bg);border:1px solid var(--line);font-size:12px;cursor:pointer;transition:border-color .18s,background .18s}.theme-choice.selected{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 7%,var(--bg))}.theme-choice>span{font-size:17px;color:var(--accent)}.accent-options{display:flex;gap:13px;flex-wrap:wrap}.accent-swatch{width:36px;height:36px;min-height:36px;border-radius:50%;border:3px solid var(--card);outline:1px solid var(--line);background:var(--swatch);display:grid;place-items:center;color:#fff;cursor:pointer;transition:transform .18s var(--ease-out),outline-color .18s}.accent-swatch:hover{transform:scale(1.08)}.accent-swatch.selected{outline:2px solid var(--swatch)}.accent-swatch>span{font-size:14px}.settings-card .field{margin:12px 0}.settings-card>.button{margin-top:8px}.settings-message{font-size:9px;color:var(--green);min-height:12px;margin:12px 0 0;letter-spacing:0}.account-details{display:grid;grid-template-columns:1fr auto;gap:13px;padding:18px 0}.account-details>span{font-size:8px;color:var(--muted)}.account-details>b{font-size:11px;text-align:right;text-transform:capitalize}.account-actions{border-top:1px solid var(--line);padding-top:14px;display:flex;justify-content:space-between;gap:8px}.account-actions .button{font-size:11px;padding:0 10px;min-height:44px}.settings-grid .account-card{grid-column:1/-1}.app-footer{padding:18px clamp(20px,4vw,56px);border-top:1px solid var(--line);font-size:8px}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.revealed{opacity:1!important;transform:translateY(0)!important}.manifesto>[data-reveal]{opacity:0;transform:translateY(18px);transition:opacity .5s var(--ease-out),transform .5s var(--ease-out)}.manifesto h2[data-reveal]{transition-delay:80ms}
@keyframes hero-in{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}@keyframes story-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes screen-in{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}@keyframes list-in{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}@keyframes marquee{to{transform:translateX(-50%)}}@keyframes mascot-float{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-10px) rotate(3deg)}}@keyframes float-slow{0%,100%{transform:translateY(0) rotate(2deg)}50%{transform:translateY(-7px) rotate(1deg)}}@keyframes skeleton{to{background-position:-200% 0}}@keyframes draw-line{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@media(max-width:850px){.hero{padding-left:9vw}.hero h1{font-size:clamp(86px,19vw,160px)}.hero-side-note{display:none}.hero-dumbbell{right:9%;bottom:13%;opacity:.65}.story-shell{grid-template-columns:1fr 1fr;padding-inline:5vw;gap:2vw}.feature-grid{grid-template-columns:1fr 1fr}.feature-card:nth-child(2){border-right:0;margin-right:0}.feature-card:nth-child(1),.feature-card:nth-child(2){border-bottom:1px solid var(--line)}.feature-card:nth-child(3),.feature-card:nth-child(4){padding-top:22px}.auth-layout{gap:5vw}.app-header-inner{gap:10px}.app-nav button{padding:0 8px}.nav-number{display:none}.app-header .brand small{display:none}}
@media(max-width:650px){.site-header{height:66px;padding-inline:18px}.landing-header .button{padding:0 11px;min-height:42px;gap:8px;font-size:12px}.landing-header .brand small{display:none}.hero{min-height:790px;min-height:100svh;padding:130px 22px 100px;align-items:center}.hero h1{font-size:clamp(75px,21vw,132px);margin:29px 0 22px}.hero-content>p{max-width:320px;font-size:15px}.hero-cta{align-items:flex-start;flex-direction:column;gap:12px}.hero-cta .button{min-height:52px}.hero-dumbbell{right:5%;bottom:11%;opacity:.38}.hero-dumbbell .mascot{width:104px;height:104px}.hero-foot{bottom:20px;font-size:7px;left:20px;right:20px}.hero-foot span:last-child{max-width:120px;text-align:right}.hero-glow{width:70vw;height:70vw}.marquee{padding:17px 0}.story-section{height:255vh}.story-sticky{min-height:680px}.story-shell{grid-template-columns:1fr;padding:40px 24px 70px;gap:12px;align-content:center}.story-copy h2{font-size:clamp(45px,12vw,65px);margin:18px 0 12px}.story-copy p{font-size:14px;max-width:380px}.story-progress{margin-top:20px}.story-art{max-height:315px;aspect-ratio:1.4}.story-art:before{width:66%}.story-watermark{font-size:220px;right:-20px;bottom:-55px}.phone-visual{width:235px;padding:12px}.phone-ring{width:115px;height:115px;margin:9px auto}.phone-ring b{font-size:25px}.meal-row{padding:8px 0;font-size:10px}.meal-row span small{font-size:8px}.lift-visual,.streak-visual{max-width:370px}.streak-label{top:35%;left:30%}.streak-label>b{font-size:38px}.manifesto{padding-top:80px;padding-bottom:90px}.manifesto h2{font-size:clamp(43px,11vw,72px);margin:18px 0 38px}.feature-grid{grid-template-columns:1fr}.feature-card,.feature-card:nth-child(2){min-height:164px;border-right:0;border-bottom:1px solid var(--line);margin:0;padding:18px 0}.feature-card:nth-child(3){border-bottom:1px solid var(--line)}.feature-card h3{margin:22px 0 7px}.feature-card p{max-width:320px}.closing{padding-top:68px;padding-bottom:82px}.closing h2{font-size:clamp(58px,14vw,86px)}.closing-index{left:20px;bottom:18px}.landing-footer{padding:16px 20px;font-size:7px}.landing-footer .mascot{width:24px;height:24px}
.auth-header{padding-inline:18px}.auth-layout{display:block;padding:24px 18px 48px;min-height:unset}.auth-aside{min-height:0;padding:25px 0 22px}.auth-aside h1{font-size:65px;margin:17px 0 10px}.auth-aside>p{font-size:13px;max-width:300px}.auth-aside-mark{right:3%;bottom:10%;opacity:.36}.auth-aside-mark .mascot{width:73px;height:73px}.auth-card{padding:24px 20px}.setup-card{margin:24px auto;padding:24px 19px}.setup-card h1{font-size:36px}.field-grid{gap:10px}.field-grid .field{font-size:11px}.physique-options{gap:6px}.physique-option{padding:10px 8px}.physique-option small{font-size:9px}.setup-step{font-size:8px}.app-header{height:auto;min-height:72px}.app-header-inner{padding:8px 14px;flex-wrap:wrap;justify-content:space-between;gap:0}.app-header .brand{height:44px}.profile-button{height:44px}.profile-button b,.profile-button i{display:none}.app-nav{order:2;width:100%;height:46px;overflow:auto;scrollbar-width:none;justify-content:space-between}.app-nav::-webkit-scrollbar{display:none}.app-nav button{flex:1;padding:0 8px;font-size:10px;white-space:nowrap}.nav-number{display:inline;margin-right:4px;font-size:7px}.app-main{padding:34px 16px 55px;min-height:calc(100svh - 162px)}.view-heading{align-items:flex-start;margin-bottom:23px}.view-heading h1{font-size:48px;margin:10px 0 7px}.view-heading p{font-size:12px;max-width:260px}.view-heading .eyebrow{font-size:8px}.date-label{display:none}.daily-total>b,.streak-summary>b{font-size:22px}.daily-total>span,.streak-summary>span{font-size:7px}.dashboard-grid,.two-column,.progress-grid,.settings-grid{grid-template-columns:1fr;gap:10px}.app-card{padding:20px}.dashboard-grid .app-card{min-height:unset}.calories-card{min-height:310px!important}.water-cups{gap:6px}.water-cup{height:45px}.week-chart{height:130px}.focus-line{align-items:flex-start;flex-direction:column;gap:8px}.focus-line>b{text-align:left}.food-picker,.logged-card,.workout-maker,.workout-log{min-height:unset!important}.logged-card{min-height:300px!important}.workout-log .empty-state{min-height:190px}.progress-grid .weight-card,.settings-grid .account-card{grid-column:auto}.badge-list{gap:3px}.badge-item>span{width:42px;height:42px}.badge-item small{font-size:7px}.consistency-stat{margin-top:24px}.weight-entry{max-width:none}.weight-entry .button{padding-inline:12px;font-size:11px;gap:7px}.weight-goal{font-size:7px}.settings-card{min-height:unset}.account-actions{flex-direction:column}.account-actions .button{width:100%}.app-footer{padding:15px 18px}.app-footer>span:last-child{font-size:7px}}
@media(max-width:380px){.hero h1{font-size:19vw}.physique-option b{font-size:11px}.physique-option small{font-size:8px}.filter-chip{padding-inline:9px}.badge-item>span{width:36px;height:36px}.badge-item small{font-size:6px}.app-nav button{font-size:9px}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;transition-delay:0ms!important}.hero-glow{transform:none}.marquee-track{animation:none}.story-copy h2,.feature-card,.manifesto>[data-reveal],.closing-inner{opacity:1;transform:none}}
:root{font-size:17px}
body{font-size:16px;line-height:1.5}
.app-nav button,.profile-button{font-size:14px}
.view-heading p{font-size:16px}
.search-box input{font-size:16px}
.filter-chip{font-size:12px;min-height:44px;padding-inline:16px}
.food-note{font-size:14px;color:var(--muted);margin:0 0 10px}
.food-item b,.logged-item b{font-size:16px}
.food-item>div>span,.logged-item>div>span{font-size:13px;letter-spacing:0;line-height:1.4}
.food-item{min-height:unset;padding:12px 0}
.food-item .food-item-info{min-width:0;gap:7px}
.food-item-info>b{line-height:1.35}
.food-portion{display:flex;align-items:center;gap:8px;margin:0;color:var(--muted);font:12px 'DM Mono',monospace;letter-spacing:.02em}
.food-portion input{width:88px;min-height:38px;padding:5px 9px;border:1px solid var(--line);background:var(--bg);font:14px 'DM Sans',sans-serif}
.food-item .add-button{width:44px;height:44px;min-height:44px;flex-shrink:0}
.food-item .add-button:disabled{opacity:.4;cursor:not-allowed}
.food-note{font-size:14px;color:var(--muted);line-height:1.5}
.macro-copy{font-size:14px}
.macro-copy>b,.macro-copy small{font-size:12px}
.water-card>p{font-size:14px}
@media(max-width:650px){.app-nav button{font-size:11px}.filter-chip{font-size:12px}.food-item>div>span,.logged-item>div>span{font-size:12px}}
.landing-header{color:#fff;border-bottom:0;background:linear-gradient(180deg,rgba(7,13,22,.48),rgba(7,13,22,.16));backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}.landing-header .brand,.landing-header .brand small{color:#fff}.landing-header .button-quiet{color:#fff}
.hero{min-height:100svh;min-height:max(740px,100svh);padding:150px clamp(24px,10vw,150px) 110px;background:#101820;color:#fff;overflow:hidden}.hero-image,.training-section>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.hero-image{object-position:center 42%;transform:translate3d(0,var(--hero-shift,0),0) scale(1.045);will-change:transform}.hero-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(7,13,22,.78),rgba(7,13,22,.2) 72%),linear-gradient(0deg,rgba(7,13,22,.56),transparent 35%)}.hero-content{max-width:1000px}.hero-content .eyebrow,.hero-foot,.hero-side-note{color:rgba(255,255,255,.78)}.hero h1{display:block;color:#fff;font-size:clamp(72px,12vw,168px);line-height:.78;letter-spacing:-.09em;margin:32px 0 24px}.hero h1>span{display:block}.hero .headline-outline{-webkit-text-stroke:1px rgba(255,255,255,.8);margin-left:.24em}.hero .headline-accent{color:#fff;margin-left:.45em}.hero-content>p{color:rgba(255,255,255,.84);max-width:420px}.hero-side-note{top:auto;bottom:29%;right:clamp(24px,7vw,90px)}.hero-dumbbell{right:11%;bottom:14%;opacity:.82}.hero-foot{z-index:2}.story-section{background:var(--bg)}.story-sticky{background:var(--bg)}.story-shell{max-width:1360px;grid-template-columns:.85fr 1.15fr;gap:7vw}.story-copy{max-width:480px}.story-copy h2{max-width:450px}.story-art{margin:0;width:100%;aspect-ratio:1.18;position:relative;overflow:hidden;background:var(--soft)}.story-art:before,.story-art:after{display:none}.story-art img{width:100%;height:100%;object-fit:cover;animation:photo-in .8s var(--ease-out) both;transform:scale(calc(1.035 - var(--story-phase,0)*.025))}.story-art:after{display:block;content:'';position:absolute;inset:45% 0 0;width:auto;aspect-ratio:auto;border:0;border-radius:0;background:linear-gradient(0deg,rgba(6,13,23,.56),transparent)}.story-art figcaption{position:absolute;z-index:1;left:22px;right:22px;bottom:20px;display:flex;justify-content:space-between;color:#fff;font:10px 'DM Mono',monospace;letter-spacing:.1em}.story-progress span{transform:scaleX(var(--story-progress-value,.05));transition:transform .15s linear}.story-watermark{bottom:-100px}.editorial-section,.progress-section{max-width:1440px;margin:auto;padding:clamp(80px,11vw,150px) clamp(24px,8vw,112px);display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(44px,8vw,120px);align-items:center}.nutrition-section{padding-top:clamp(70px,9vw,125px)}.editorial-image,.progress-image{margin:0;position:relative;min-height:480px;overflow:hidden;background:var(--soft)}.editorial-image img,.progress-image img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.nutrition-image img{object-position:55% center}.image-index{position:absolute;left:20px;bottom:18px;background:var(--bg);padding:10px 12px;color:var(--fg);font:9px 'DM Mono',monospace;letter-spacing:.1em}.editorial-copy{max-width:500px}.editorial-copy .eyebrow,.progress-copy .eyebrow{color:var(--muted);font-size:10px}.editorial-copy h2,.progress-copy h2{font:700 clamp(48px,7vw,88px)/.91 'Space Grotesk',sans-serif;letter-spacing:-.085em;margin:24px 0}.editorial-copy h2 em,.progress-copy h2 em,.training-overlay h2 em{font-style:normal;color:var(--accent)}.editorial-copy>p,.progress-copy>p{max-width:420px;color:var(--muted);font-size:15px;line-height:1.8}.nutrition-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:18px 0;margin-top:32px}.nutrition-metrics>div{display:flex;flex-direction:column;gap:5px}.nutrition-metrics b{font:600 clamp(23px,3vw,34px)/1 'Space Grotesk',sans-serif;letter-spacing:-.06em}.nutrition-metrics b span{font-size:.6em;color:var(--accent)}.nutrition-metrics>div>span,.metric-note{font:9px 'DM Mono',monospace;color:var(--muted);letter-spacing:.05em}.metric-note{display:block;margin-top:12px;letter-spacing:0}.training-section{height:min(850px,90svh);min-height:640px;position:relative;isolation:isolate;overflow:hidden;background:#111820;color:#fff;display:flex;align-items:center;padding:70px clamp(24px,12vw,180px)}.training-section>img{z-index:-2;object-position:center 42%;transform:scale(1.02)}.training-section:before{content:'';position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,rgba(6,13,23,.75),rgba(6,13,23,.16) 80%),linear-gradient(0deg,rgba(6,13,23,.4),transparent 42%)}.training-overlay{max-width:560px}.training-overlay .eyebrow,.training-caption{font:10px 'DM Mono',monospace;color:rgba(255,255,255,.78);letter-spacing:.12em}.training-overlay h2{font:700 clamp(65px,10vw,128px)/.82 'Space Grotesk',sans-serif;letter-spacing:-.09em;margin:30px 0}.training-overlay h2 em{color:#fff}.training-overlay p{max-width:400px;color:rgba(255,255,255,.83);line-height:1.7;margin-bottom:24px}.training-caption{position:absolute;right:clamp(24px,5vw,70px);bottom:26px}.progress-section{grid-template-columns:.88fr 1.12fr;padding-top:clamp(90px,12vw,165px);padding-bottom:clamp(90px,12vw,165px)}.progress-copy{max-width:480px}.progress-image{min-height:540px}.progress-image figcaption{position:absolute;bottom:20px;left:20px;color:#fff;font:10px 'DM Mono',monospace;letter-spacing:.12em}.progress-timeline{list-style:none;padding:0;margin:30px 0 0;border-top:1px solid var(--line)}.progress-timeline li{display:flex;align-items:center;gap:20px;border-bottom:1px solid var(--line);padding:15px 0}.progress-timeline li>span{font:10px 'DM Mono',monospace;color:var(--accent)}.progress-timeline li div{display:flex;flex-direction:column;gap:3px}.progress-timeline li b{font-size:13px}.progress-timeline li small{font-size:11px;color:var(--muted)}.manifesto{padding-top:90px}.auth-layout{max-width:1240px;grid-template-columns:1fr .82fr;gap:clamp(40px,8vw,120px)}.auth-aside{min-height:0;align-self:center;padding:35px 0}.auth-aside-mark{right:4%;bottom:28%}.auth-faq{max-width:440px;margin-top:55px}.auth-faq>.eyebrow{display:block;margin-bottom:10px}.auth-faq details{border-top:1px solid var(--line);padding:0}.auth-faq details:last-child{border-bottom:1px solid var(--line)}.auth-faq summary{cursor:pointer;list-style:none;padding:15px 25px 15px 0;position:relative;font-size:13px;font-weight:600}.auth-faq summary::-webkit-details-marker{display:none}.auth-faq summary:after{content:'+';position:absolute;right:4px;top:12px;color:var(--accent);font-size:18px;font-weight:400}.auth-faq details[open] summary:after{content:'−'}.auth-faq summary:focus-visible{outline:2px solid var(--accent);outline-offset:3px}.auth-faq details p{max-width:380px;margin:0;padding:0 0 15px;color:var(--muted);font-size:12px;line-height:1.65}.editorial-copy[data-reveal],.progress-copy[data-reveal]{opacity:0;transform:translateY(18px);transition:opacity .6s var(--ease-out),transform .6s var(--ease-out)}.editorial-copy[data-reveal].revealed,.progress-copy[data-reveal].revealed{opacity:1;transform:translateY(0)}.nutrition-metrics>div{transition:transform .35s var(--ease-out)}.nutrition-metrics>div:hover{transform:translateY(-3px)}.button{transition:transform .2s var(--ease-out),background-color .2s,color .2s,border-color .2s}.button:hover{transform:translateY(-2px)}.button:active{transform:translateY(0) scale(.98)}
@keyframes photo-in{from{opacity:.72;transform:scale(1.07)}to{opacity:1;transform:scale(1.035)}}
.nutrition-metrics>div{opacity:0;transform:translateY(8px);transition:opacity .45s var(--ease-out),transform .45s var(--ease-out)}.editorial-copy.revealed .nutrition-metrics>div{opacity:1;transform:translateY(0)}.editorial-copy.revealed .nutrition-metrics>div:nth-child(2){transition-delay:80ms}.editorial-copy.revealed .nutrition-metrics>div:nth-child(3){transition-delay:160ms}
@media(max-width:850px){.hero{padding-left:7vw}.story-shell{grid-template-columns:.85fr 1.15fr;padding-inline:5vw;gap:4vw}.editorial-section,.progress-section{padding-inline:6vw;gap:5vw}.editorial-image{min-height:400px}.progress-image{min-height:440px}.auth-layout{grid-template-columns:1fr .9fr}.auth-faq{margin-top:35px}}
@media(max-width:650px){.hero{padding:125px 22px 100px;min-height:100svh}.hero h1{font-size:clamp(62px,14vw,100px);line-height:.84;margin:26px 0 20px}.hero .headline-outline{margin-left:.2em}.hero .headline-accent{margin-left:.38em}.hero-image{object-position:58% center}.hero-shade{background:linear-gradient(90deg,rgba(7,13,22,.72),rgba(7,13,22,.12)),linear-gradient(0deg,rgba(7,13,22,.55),transparent 50%)}.hero-dumbbell{right:4%;bottom:10%;opacity:.6}.hero-dumbbell .mascot{width:82px;height:82px}.hero-side-note{display:none}.story-section{height:255vh}.story-sticky{min-height:650px}.story-shell{grid-template-columns:1fr;padding:32px 22px 60px;gap:20px;align-content:center}.story-copy h2{font-size:clamp(42px,11vw,60px);margin:15px 0 10px}.story-copy p{font-size:13px}.story-progress{margin:16px 0 9px}.story-art{aspect-ratio:1.55;max-height:245px}.story-art figcaption{left:13px;right:13px;bottom:12px;font-size:8px}.story-watermark{font-size:190px;bottom:-60px}.editorial-section,.progress-section{grid-template-columns:1fr;padding:75px 22px;gap:30px}.editorial-image{min-height:370px}.editorial-copy h2,.progress-copy h2{font-size:clamp(49px,12vw,72px);margin:18px 0}.editorial-copy>p,.progress-copy>p{font-size:14px}.nutrition-metrics{margin-top:24px;gap:8px}.nutrition-metrics b{font-size:26px}.nutrition-metrics>div>span{font-size:8px}.training-section{min-height:680px;height:82svh;padding:65px 24px;align-items:flex-end;padding-bottom:95px}.training-section>img{object-position:57% center}.training-overlay h2{font-size:clamp(63px,15vw,92px);margin:24px 0}.training-caption{right:20px;bottom:19px;font-size:8px}.progress-section{padding-top:78px;padding-bottom:85px}.progress-image{min-height:380px}.progress-timeline{margin-top:22px}.manifesto{padding-top:75px;padding-bottom:80px}.auth-layout{display:block;padding:18px 18px 48px;min-height:unset}.auth-aside{padding:22px 0 26px}.auth-aside h1{font-size:65px;margin:17px 0 10px}.auth-aside>p{max-width:320px}.auth-aside-mark{right:2%;bottom:auto;top:4%;opacity:.25}.auth-faq{margin-top:28px}.auth-faq summary{min-height:48px;display:flex;align-items:center}.auth-faq details p{font-size:12px}.auth-card{padding:24px 20px}}
@media(prefers-reduced-motion:reduce){.hero-image{transform:scale(1.02)}.story-section{height:auto}.story-sticky{position:relative;top:auto;height:auto;min-height:0}.story-art img{animation:none;transform:none}.editorial-copy[data-reveal],.progress-copy[data-reveal]{opacity:1;transform:none}.nutrition-metrics>div{opacity:1;transform:none;transition:none}.button:hover,.nutrition-metrics>div:hover{transform:none}}
.app-header .brand .mascot{transform-style:preserve-3d;filter:drop-shadow(0 5px 6px color-mix(in srgb,var(--accent) 24%,transparent));animation:site-mascot-3d 5s ease-in-out infinite}
.editorial-section,.progress-section{padding:clamp(48px,6vw,84px) clamp(24px,4vw,64px);gap:clamp(30px,5vw,72px)}
.nutrition-section{padding-top:clamp(42px,5vw,72px)}
.editorial-image{min-height:440px}
.progress-image{min-height:470px}
.story-section{height:180vh}.story-sticky{min-height:100svh}
@keyframes site-mascot-3d{0%,100%{transform:perspective(500px) rotateY(-12deg) rotateX(4deg) translateY(0)}50%{transform:perspective(500px) rotateY(18deg) rotateX(-3deg) translateY(-3px)}}
.dumbbell-mark{display:block;flex:none}
.brand .dumbbell-mark{transform-style:preserve-3d;filter:drop-shadow(0 5px 6px color-mix(in srgb,var(--accent) 24%,transparent));animation:site-mascot-3d 5s ease-in-out infinite}
.record-actions{display:flex;align-items:center;gap:4px;flex:none}
.record-actions .button{min-height:40px;padding-inline:12px}
.record-edit-panel{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:end;gap:8px;margin-top:14px;padding:14px;border:1px solid var(--line);background:var(--soft)}
.record-edit-panel .field{margin:0}
.record-edit-panel .field input{min-height:42px}
.record-edit-panel .button{min-height:42px;padding-inline:12px}
.workout-history{margin-top:16px}
.history-days{display:grid;gap:0}
.history-day{display:grid;grid-template-columns:minmax(130px,.3fr) 1fr;gap:18px;padding:14px 0;border-top:1px solid var(--line)}
.history-day>div{display:flex;flex-wrap:wrap;gap:8px 18px;color:var(--muted);font-size:13px}
.range-controls{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}
.range-summary{color:var(--muted);font-size:13px;margin:6px 0 14px}
.target-form{display:grid;gap:14px}
.target-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.target-row .field{margin:0}
.target-form .settings-message{min-height:20px;margin:0}
.nutrition-image,.progress-image,.story-art{background:var(--soft)}
.hero{background:#101820}
@media(max-width:650px){.record-edit-panel{grid-template-columns:1fr}.history-day{grid-template-columns:1fr;gap:7px}.target-row{gap:8px}.hero-dumbbell .dumbbell-mark{width:82px;height:82px}.auth-aside-mark .dumbbell-mark{width:73px;height:73px}}
@media(prefers-reduced-motion:reduce){.brand .dumbbell-mark{animation:none;transform:none}}
@media(max-width:850px){.editorial-section,.progress-section{padding-inline:5vw;gap:4vw}}
@media(max-width:650px){.editorial-section,.progress-section{padding:44px 22px;gap:24px}.nutrition-section{padding-top:38px}.editorial-image,.progress-image{min-height:300px}.story-section{height:165vh}}
@media(prefers-reduced-motion:reduce){.story-section{height:auto}.story-sticky{position:relative;top:auto;height:auto;min-height:0}}

/* Photo-led landing refresh */
.landing{background:#0b0e12;color:#f5f5f4}
.landing .site-header{background:linear-gradient(180deg,rgba(8,11,15,.76),rgba(8,11,15,0));}
.hero{height:100svh;min-height:700px;max-height:1100px;padding:150px 7vw 92px;isolation:isolate}
.hero-image{inset:0;width:100%;height:100%;object-fit:cover;object-position:62% 45%;transform:translateY(var(--hero-shift,0)) scale(1.04);will-change:transform}
.hero-shade{background:linear-gradient(90deg,rgba(7,10,14,.82) 0%,rgba(7,10,14,.56) 42%,rgba(7,10,14,.08) 100%),linear-gradient(0deg,rgba(7,10,14,.62),transparent 28%,rgba(7,10,14,.12))}
.hero-content{width:min(100%,1150px);margin:auto;transform:none}
.hero-content .eyebrow{font-size:12px;letter-spacing:.19em;margin-bottom:25px}
.hero h1{max-width:1050px;margin:0;font-size:clamp(3.5rem,8vw,7.5rem);line-height:.88;letter-spacing:-.065em}
.hero h1>span{display:block}
.hero .headline-outline{-webkit-text-stroke:1.5px rgba(255,255,255,.82);color:transparent}
.hero .headline-accent{color:#f4f4f2}
.hero-content>p{max-width:520px;margin:28px 0 0;color:rgba(255,255,255,.84);font-size:clamp(16px,1.4vw,20px);line-height:1.65}
.hero-cta{display:flex;align-items:center;gap:13px;margin-top:32px}
.hero-cta .button{min-height:54px}
.hero-secondary{color:#fff;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.58);backdrop-filter:blur(8px)}
.hero-secondary:hover{background:rgba(255,255,255,.16)}
.hero-side-note{right:5.8vw;bottom:30%;font-size:10px;letter-spacing:.18em;color:rgba(255,255,255,.72)}
.hero-foot{left:7vw;right:7vw;bottom:30px;color:rgba(255,255,255,.65)}
.marquee{overflow:hidden;background:#11161c;border-block:1px solid rgba(255,255,255,.08)}
.marquee-track{color:#aeb7c1}
.section-wrap{width:min(1280px,100% - 12vw);margin-inline:auto}
.workout-showcase{padding-top:125px;padding-bottom:125px}
.showcase-heading{display:grid;grid-template-columns:1fr minmax(260px,.55fr);column-gap:70px;align-items:end;margin-bottom:45px}
.showcase-heading .eyebrow{grid-column:1/-1;margin-bottom:22px}
.showcase-heading h2,.nutrition-copy h2,.progress-copy h2{margin:0;font-size:clamp(2.7rem,5.3vw,5.4rem);line-height:.96;letter-spacing:-.055em}
.showcase-heading h2 em,.nutrition-copy h2 em{font-family:var(--serif);font-weight:400}
.showcase-heading p{max-width:430px;margin:0 0 6px;color:#b1bac3;font-size:16px;line-height:1.7}
.workout-photo-grid{display:grid;grid-template-columns:1.2fr .8fr;grid-template-rows:310px 310px;gap:16px}
.cinema-panel{position:relative;display:block;overflow:hidden;width:100%;height:100%;min-height:0;padding:0;text-align:left;color:#fff;background:#171c22;border:0;cursor:pointer}
.workout-panel-wide{grid-row:span 2}
.cinema-panel::after{position:absolute;inset:0;content:"";background:linear-gradient(0deg,rgba(4,7,10,.82),rgba(4,7,10,.08) 72%)}
.cinema-panel img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.2,.7,.2,1),filter .6s}
.workout-panel-wide img{object-position:55% center}
.workout-panel:nth-child(2) img{object-position:center 42%}
.workout-panel:nth-child(3) img{object-position:center 48%}
.cinema-panel:hover img,.cinema-panel:focus-visible img{transform:scale(1.045)}
.panel-copy{position:absolute;z-index:1;left:clamp(20px,3vw,42px);right:24px;bottom:clamp(20px,3vw,42px);display:flex;flex-direction:column;align-items:flex-start}
.panel-kicker,.panel-link{font-size:10px;font-weight:700;letter-spacing:.16em}
.panel-kicker{color:rgba(255,255,255,.72)}
.panel-copy b{margin-top:13px;font-size:clamp(1.8rem,3.1vw,3.1rem);line-height:.98;letter-spacing:-.04em}
.workout-panel:not(.workout-panel-wide) .panel-copy b{font-size:clamp(1.6rem,2.4vw,2.4rem)}
.panel-link{display:flex;align-items:center;gap:10px;margin-top:18px}
.panel-link i{font-style:normal;font-size:16px}
.nutrition-showcase{display:grid;grid-template-columns:minmax(310px,.82fr) minmax(440px,1.18fr);gap:7vw;align-items:center;padding:120px max(6vw,calc((100vw - 1280px)/2));background:#f0f0ed;color:#171c20}
.nutrition-copy{max-width:480px}
.nutrition-copy .eyebrow{color:#515d65}
.nutrition-copy h2{margin:22px 0}
.nutrition-copy>p{color:#515960;font-size:16px;line-height:1.75}
.nutrition-points{display:grid;gap:0;margin:30px 0;padding:0;list-style:none;border-top:1px solid #cfd2d0}
.nutrition-points li{display:flex;gap:16px;align-items:center;padding:14px 0;border-bottom:1px solid #cfd2d0;font-size:14px}
.nutrition-points li span{font-size:10px;font-weight:700;letter-spacing:.1em;color:#64727c}
.nutrition-copy small{display:block;max-width:370px;margin-top:15px;color:#677077;font-size:11px;line-height:1.55}
.nutrition-mosaic{position:relative;min-height:640px}
.nutrition-photo{position:absolute;margin:0;overflow:hidden;background:#d9ded9;box-shadow:0 20px 60px rgba(0,0,0,.13)}
.nutrition-photo img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .7s}
.nutrition-photo:hover img{transform:scale(1.035)}
.nutrition-photo figcaption{position:absolute;left:14px;right:14px;bottom:14px;color:#fff;font-size:9px;font-weight:700;letter-spacing:.14em;text-shadow:0 1px 8px rgba(0,0,0,.7)}
.nutrition-photo-main{left:0;top:0;width:70%;height:72%}
.nutrition-photo-protein{right:0;top:10%;width:43%;height:48%;border:7px solid #f0f0ed}
.nutrition-photo-prep{left:16%;bottom:0;width:56%;height:36%;border:7px solid #f0f0ed}
.progress-showcase{position:relative;display:flex;align-items:center;min-height:650px;padding:110px max(8vw,calc((100vw - 1200px)/2));overflow:hidden;background:#12171c}
.progress-photo,.progress-shade{position:absolute;inset:0;width:100%;height:100%}
.progress-photo{object-fit:cover;object-position:center 50%}
.progress-shade{background:linear-gradient(90deg,rgba(5,9,13,.86),rgba(5,9,13,.48) 55%,rgba(5,9,13,.1)),linear-gradient(0deg,rgba(5,9,13,.35),transparent 40%)}
.progress-copy{position:relative;z-index:1;max-width:670px}
.progress-copy .eyebrow{margin-bottom:24px}
.progress-copy h2{font-size:clamp(2.8rem,5.5vw,5.6rem)}
.progress-copy p{max-width:490px;margin:24px 0 30px;color:rgba(255,255,255,.78);font-size:17px;line-height:1.7}
.progress-caption{position:absolute;right:6vw;bottom:32px;color:rgba(255,255,255,.7);font-size:10px;font-weight:700;letter-spacing:.15em}
.manifesto{padding-top:100px;padding-bottom:100px}
.landing-footer{display:flex;align-items:center;justify-content:space-between;gap:20px}
.landing-footer a{color:inherit;text-decoration:none;font-size:9px;letter-spacing:.12em;opacity:.65}
.landing-footer a:hover{opacity:1}
.landing button:focus-visible,.landing a:focus-visible{outline:2px solid #fff;outline-offset:4px}
.landing [data-reveal]{transition:opacity .65s ease,transform .65s cubic-bezier(.2,.7,.2,1)}
@media(max-width:850px){
  .hero{padding-inline:6vw}
  .hero-image{object-position:58% center}
  .hero-shade{background:linear-gradient(90deg,rgba(7,10,14,.78),rgba(7,10,14,.25)),linear-gradient(0deg,rgba(7,10,14,.6),transparent 45%)}
  .section-wrap{width:calc(100% - 10vw)}
  .showcase-heading{grid-template-columns:1fr;gap:20px}
  .showcase-heading .eyebrow{margin-bottom:0}
  .nutrition-showcase{grid-template-columns:1fr;gap:45px;padding:90px 7vw}
  .nutrition-mosaic{width:min(100%,680px);min-height:600px;margin:auto}
}
@media(max-width:600px){
  .hero{height:92svh;min-height:680px;max-height:none;padding:132px 24px 88px}
  .hero-image{object-position:58% center}
  .hero-shade{background:linear-gradient(90deg,rgba(7,10,14,.73),rgba(7,10,14,.28)),linear-gradient(0deg,rgba(7,10,14,.68),transparent 52%)}
  .hero-content .eyebrow{max-width:285px;font-size:9px;line-height:1.7;letter-spacing:.14em}
  .hero h1{font-size:clamp(3.25rem,14vw,5.4rem);line-height:.91}
  .hero-content>p{max-width:370px;margin-top:21px;font-size:16px}
  .hero-cta{align-items:stretch;flex-wrap:wrap;gap:10px;margin-top:24px}
  .hero-cta .button{min-height:48px;padding:0 15px;font-size:12px}
  .hero-side-note{display:none}
  .hero-foot{left:24px;right:24px;bottom:20px;font-size:8px;letter-spacing:.09em}
  .hero-foot span:last-child{display:none}
  .workout-showcase{padding-top:76px;padding-bottom:76px}
  .showcase-heading{margin-bottom:26px}
  .showcase-heading h2,.nutrition-copy h2,.progress-copy h2{font-size:clamp(2.65rem,12vw,4.1rem)}
  .showcase-heading p{font-size:14px}
  .workout-photo-grid{grid-template-columns:1fr 1fr;grid-template-rows:350px 230px;gap:10px}
  .workout-panel-wide{grid-column:1/-1;grid-row:auto}
  .panel-copy{left:16px;right:12px;bottom:17px}
  .panel-copy b,.workout-panel:not(.workout-panel-wide) .panel-copy b{font-size:clamp(1.35rem,6vw,2rem)}
  .panel-kicker,.panel-link{font-size:8px;letter-spacing:.1em}
  .panel-link{gap:5px;margin-top:12px}
  .nutrition-showcase{gap:36px;padding:76px 24px}
  .nutrition-copy>p{font-size:14px}
  .nutrition-mosaic{min-height:440px}
  .nutrition-photo-main{width:76%;height:69%}
  .nutrition-photo-protein{width:45%;height:46%;border-width:5px}
  .nutrition-photo-prep{left:10%;width:62%;height:34%;border-width:5px}
  .nutrition-photo figcaption{left:9px;right:8px;bottom:9px;font-size:7px;letter-spacing:.08em}
  .progress-showcase{min-height:580px;padding:80px 24px}
  .progress-photo{object-position:56% center}
  .progress-shade{background:linear-gradient(90deg,rgba(5,9,13,.78),rgba(5,9,13,.3)),linear-gradient(0deg,rgba(5,9,13,.52),transparent 60%)}
  .progress-copy p{font-size:15px}
  .progress-caption{right:24px;bottom:20px;font-size:8px}
  .manifesto{padding-top:76px;padding-bottom:76px}
  .landing-footer{flex-wrap:wrap;justify-content:center}
  .landing-footer>span:nth-child(2){display:none}
}
@media(prefers-reduced-motion:reduce){
  .landing *, .landing *::before, .landing *::after{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
  .hero-image{transform:scale(1.02)!important}
  .cinema-panel img,.nutrition-photo img{transition:none}
}

/* Shared FORGE visual language for auth, setup, and signed-in screens. */
:root:not([data-theme=dark]){--bg:#f0f3f7;--fg:#111a27;--card:#fff;--line:#d8e0e9;--muted:#566579;--soft:#e9eef4;--accent-ink:#fff;--green:#5cb59b;--danger:#d97389}
:root[data-theme=dark]{--bg:#090f18;--fg:#f3f6fb;--card:#121c28;--line:#263545;--muted:#a6b4c4;--soft:#1b2938;--accent:#3c7cff;--accent-ink:#fff;--green:#5fc5a2;--danger:#ff879a;--mascot-pupil:#101e37}
.app-shell{background:var(--bg);color:var(--fg)}
.app-header{height:78px;background:color-mix(in srgb,var(--bg) 88%,transparent);border-bottom:1px solid color-mix(in srgb,var(--line) 74%,transparent);box-shadow:0 8px 32px rgba(4,12,24,.06)}
:root[data-theme=dark] .app-header{box-shadow:0 8px 32px rgba(0,0,0,.18)}
.app-header-inner{max-width:1440px}
.app-header .brand{font-size:16px;letter-spacing:.14em}
.app-header .brand small{font-size:8px}
.app-header .brand .dumbbell-mark{width:40px;height:40px;color:var(--accent)}
.app-nav{gap:5px}
.app-nav button{min-height:42px;padding:0 14px;border:1px solid transparent;border-radius:4px;font-size:13px;font-weight:600}
.app-nav button.active{color:var(--fg);background:color-mix(in srgb,var(--accent) 10%,var(--card));border-color:color-mix(in srgb,var(--accent) 28%,var(--line))}
.app-nav button.active .nav-number{color:var(--accent)}
.nav-number{font-size:9px}
.profile-button{font-size:13px}
.profile-button>span{width:36px;height:36px;box-shadow:0 0 0 4px color-mix(in srgb,var(--accent) 12%,transparent)}
.app-main{max-width:1320px;padding-top:38px;min-height:calc(100svh - 150px)}
.screen-in{animation:screen-in .42s var(--ease-out) both}
.dashboard-hero{position:relative;isolation:isolate;min-height:340px;display:flex;align-items:center;overflow:hidden;margin-bottom:26px;padding:44px clamp(24px,5vw,60px);background:#0b1420;color:#fff}
.dashboard-hero>img,.dashboard-hero-shade{position:absolute;inset:0;width:100%;height:100%}
.dashboard-hero>img{z-index:-2;object-fit:cover;object-position:55% 45%;transform:scale(1.02)}
.dashboard-hero-shade{z-index:-1;background:linear-gradient(90deg,rgba(5,11,19,.91),rgba(5,11,19,.69) 45%,rgba(5,11,19,.12)),linear-gradient(0deg,rgba(5,11,19,.6),transparent 50%)}
.dashboard-hero-content{max-width:720px}
.dashboard-hero .eyebrow{font-size:10px;letter-spacing:.17em;color:rgba(255,255,255,.7)}
.dashboard-hero h1{margin:19px 0 10px;font:700 clamp(3rem,7vw,5.8rem)/.95 'Space Grotesk',sans-serif;letter-spacing:-.075em}
.dashboard-hero h1 span{color:#6ea0ff}
.dashboard-hero-content>p{margin:0;color:rgba(255,255,255,.78);font-size:16px;line-height:1.6}
.dashboard-hero-actions{display:flex;flex-wrap:wrap;gap:11px;margin-top:23px}
.dashboard-hero .button{min-height:48px}
.dashboard-hero-secondary{border-color:rgba(255,255,255,.5);color:#fff;background:rgba(255,255,255,.08)}
.dashboard-hero-secondary:hover{background:rgba(255,255,255,.18)}
.dashboard-hero-meta{position:absolute;right:28px;bottom:24px;display:flex;flex-direction:column;align-items:flex-end;gap:8px;color:rgba(255,255,255,.8);font:10px 'DM Mono',monospace;letter-spacing:.1em}
.dashboard-hero-meta span:first-child{font:500 13px 'DM Sans',sans-serif;letter-spacing:0}
.dashboard-section-label{display:flex;justify-content:space-between;gap:12px;margin:0 2px 13px;color:var(--muted);font:10px 'DM Mono',monospace;letter-spacing:.13em}
.dashboard-grid{gap:16px}
.app-card{border:1px solid var(--line);border-radius:3px;background:var(--card);box-shadow:0 10px 28px rgba(18,35,55,.035);transition:border-color .2s,transform .2s,box-shadow .2s}
:root[data-theme=dark] .app-card{box-shadow:0 10px 28px rgba(0,0,0,.12)}
.dashboard-grid>.app-card{padding:clamp(22px,3vw,34px)}
.dashboard-grid>.app-card:hover,.settings-grid>.app-card:hover,.two-column>.app-card:hover,.progress-grid>.app-card:hover{border-color:color-mix(in srgb,var(--accent) 26%,var(--line));box-shadow:0 16px 34px rgba(18,35,55,.07)}
.calories-card{position:relative;min-height:350px;background:linear-gradient(145deg,var(--card),color-mix(in srgb,var(--accent) 5%,var(--card)))}
.card-eyebrow{width:100%;font-size:10px}
.calorie-ring{width:224px;height:224px;margin:15px 0}
.ring-track,.ring-value{stroke-width:7}
.ring-track{stroke:color-mix(in srgb,var(--line) 85%,transparent)}
.ring-value{stroke:var(--accent);filter:drop-shadow(0 0 7px color-mix(in srgb,var(--accent) 42%,transparent))}
.ring-copy>b{font-size:48px}
.ring-copy>span{font-size:10px}
.calories-summary{font-size:13px}
.card-title-row h2,.section-heading h2{font-size:25px}
.macro-item{margin-top:25px}
.macro-copy{font-size:14px}
.macro-copy>b{font-size:13px}
.macro-track,.month-bar{height:8px;border-radius:10px}
.macro-track i{background:var(--accent)!important;border-radius:10px}
.macro-item:nth-of-type(2) .macro-track i{background:#54b99a!important}
.macro-item:nth-of-type(3) .macro-track i{background:#66a8ff!important}
.macro-item:nth-of-type(4) .macro-track i{background:#9c87ef!important}
.macro-note{font-size:12px}
.water-card>p{font-size:14px;color:var(--muted)}
.water-cups{gap:9px}
.water-cup{width:34px;height:42px;border-color:color-mix(in srgb,var(--accent) 52%,var(--line));border-radius:5px 5px 12px 12px}
.water-cup.filled{background:color-mix(in srgb,var(--accent) 14%,var(--card))}
.water-cup.filled span{background:var(--accent)}
.week-chart{height:158px}
.week-bar-wrap i{background:linear-gradient(180deg,color-mix(in srgb,var(--accent) 66%,white),var(--accent))}
.week-column>span{font-size:11px}
.week-column>span.today-label{color:var(--accent)}
.today-training-card .empty-state{min-height:185px}
.empty-state b{font-size:16px}
.empty-state p{font-size:13px}
.app-footer{border-top:1px solid var(--line);color:var(--muted);font-size:9px}
.app-footer>span:first-child{color:var(--fg)}
.view-heading{margin-bottom:34px}
.view-heading .eyebrow{font-size:10px;letter-spacing:.14em}
.view-heading h1{font-size:clamp(3rem,6.4vw,5.4rem);letter-spacing:-.075em}
.view-heading p{font-size:16px;line-height:1.6}
.daily-total>b,.streak-summary>b{font-size:38px}
.app-main .two-column,.app-main .progress-grid,.app-main .settings-grid{gap:16px}
.app-main .section-heading{margin-bottom:18px}
.app-main .section-heading h2{font-size:25px}
.app-main .section-heading .eyebrow,.app-main .tiny-mark{font-size:10px}
.food-item,.logged-item,.history-day{border-color:var(--line)}
.food-item>div>span,.logged-item>div>span{line-height:1.6}
.food-note,.range-summary{line-height:1.7}
.exercise-choice,.filter-chip,.category-tabs button,.theme-choice,.choice-button{transition:background-color .2s,border-color .2s,color .2s,transform .2s}
.exercise-choice:hover,.theme-choice:hover,.choice-button:hover{transform:translateY(-1px)}
.weight-card svg,.chart-svg{max-width:100%}
.auth-page,.setup-page{position:relative;isolation:isolate;overflow:hidden;min-height:100svh;background:#0a111a;color:#f3f6fb}
.auth-page::before,.setup-page::before{position:fixed;z-index:-2;inset:0;content:"";background:url('/images/hero-training.jpg') center 44%/cover no-repeat;opacity:.16}
.auth-page::after,.setup-page::after{position:fixed;z-index:-1;inset:0;content:"";background:linear-gradient(110deg,rgba(7,13,22,.96),rgba(7,13,22,.91) 55%,rgba(7,13,22,.8))}
.auth-header{border:0;background:rgba(6,12,20,.4);backdrop-filter:blur(14px)}
.auth-page .brand,.setup-page .brand{color:#fff}
.auth-page .brand small,.setup-page .brand small{color:#a6b4c4}
.auth-page .dumbbell-mark,.setup-page .dumbbell-mark{color:#78a5ff}
.auth-page .button-quiet{color:#edf2f8}
.auth-layout{max-width:1240px;gap:clamp(40px,8vw,120px);padding-top:46px;padding-bottom:70px}
.auth-aside{color:#f3f6fb}
.auth-aside .eyebrow{color:#9dacc0}
.auth-aside h1{font-size:clamp(4rem,8vw,7.4rem);letter-spacing:-.08em}
.auth-aside h1 em{color:#8bb2ff;font-style:normal}
.auth-aside>p{color:#bec8d5;font-size:16px}
.auth-aside-mark{color:#78a5ff;opacity:.5}
.auth-faq>.eyebrow{color:#9dacc0}
.auth-faq details{border-color:rgba(255,255,255,.16)}
.auth-faq summary{color:#f3f6fb;font-size:14px}
.auth-faq details p{color:#bbc6d5;font-size:13px}
.auth-card,.setup-card{color:#f3f6fb;background:rgba(17,27,40,.9);border:1px solid rgba(180,204,233,.2);box-shadow:0 28px 80px rgba(0,0,0,.32);backdrop-filter:blur(18px)}
.auth-card h2,.setup-card h1{color:#fff;font-size:clamp(30px,3vw,38px)}
.auth-card>.eyebrow,.setup-card>.eyebrow{color:#9dacc0}
.auth-card .form-intro,.setup-card .form-intro{color:#b8c4d2;font-size:14px}
.auth-tabs{border-color:rgba(255,255,255,.15)}
.auth-tabs button{color:#aeb9c8;font-size:14px}
.auth-tabs button.selected{color:#fff}
.field{color:#e8edf4;font-size:13px}
.field input{color:#f5f7fa;background:#0d1723;border-color:#344356;border-radius:3px;font-size:15px}
.field input:focus{border-color:#77a4ff;outline-color:rgba(75,130,255,.2)}
.privacy-note{color:#9dacc0}
.setup-step{color:#aab6c4}
.setup-step b{color:#8bb2ff}
.setup-card h1 em{color:#8bb2ff}
.setup-group legend{color:#eff3f8;font-size:14px}
.physique-option,.choice-button{color:#edf2f8;background:#0d1723;border-color:#344356}
.physique-option.selected,.choice-button.selected{background:rgba(68,122,219,.16);border-color:#6d9cff}
.physique-option b{color:#fff}
.physique-option small{color:#aab6c4}
.days-number{color:#8bb2ff}
.setup-page .button-quiet{color:#edf2f8}
.landing .site-header{z-index:5}
.landing .site-header .button-primary,.auth-page .button-primary,.setup-page .button-primary{background:#275fce;border-color:#275fce}
.app-shell button:not(:disabled):hover{transition-duration:.2s}
@media(max-width:900px){
  .app-header-inner{gap:10px}
  .app-nav{overflow-x:auto;scrollbar-width:none}
  .app-nav::-webkit-scrollbar{display:none}
  .app-nav button{padding-inline:10px;white-space:nowrap}
  .dashboard-hero{min-height:320px}
  .dashboard-hero-meta{right:20px}
  .weight-entry{grid-template-columns:1fr 1fr}
  .weight-entry .button{grid-column:1/-1}
}
@media(max-width:650px){
  .app-header{height:auto;position:sticky}
  .app-header-inner{min-height:66px;flex-wrap:wrap;padding:9px 16px 0;gap:6px}
  .app-header .brand{font-size:14px}
  .app-header .brand .dumbbell-mark{width:34px;height:34px}
  .app-header .brand small{font-size:7px}
  .profile-button{margin-left:auto}
  .profile-button b,.profile-button>i{display:none}
  .app-nav{order:3;width:100%;justify-content:space-between;gap:2px;padding-bottom:7px}
  .app-nav button{min-height:39px;flex:1;padding-inline:5px;font-size:10px}
  .nav-number{display:none}
  .app-main{padding:24px 16px 52px}
  .dashboard-hero{min-height:420px;margin-bottom:19px;align-items:flex-start;padding:40px 24px}
  .dashboard-hero>img{object-position:59% center}
  .dashboard-hero-shade{background:linear-gradient(90deg,rgba(5,11,19,.9),rgba(5,11,19,.62)),linear-gradient(0deg,rgba(5,11,19,.72),transparent 75%)}
  .dashboard-hero h1{font-size:clamp(3.1rem,13vw,4.8rem)}
  .dashboard-hero-content>p{max-width:300px;font-size:15px}
  .dashboard-hero-meta{left:24px;right:24px;bottom:18px;align-items:flex-start;font-size:8px}
  .dashboard-hero-meta span:first-child{font-size:12px}
  .dashboard-section-label{font-size:8px;letter-spacing:.1em}
  .dashboard-grid{grid-template-columns:1fr;gap:12px}
  .dashboard-grid>.app-card{padding:22px}
  .calories-card{min-height:320px}
  .view-heading{align-items:flex-start;gap:12px}
  .view-heading h1{font-size:clamp(2.8rem,12vw,4rem)}
  .view-heading p{font-size:14px}
  .daily-total>b,.streak-summary>b{font-size:28px}
  .date-label{max-width:110px;text-align:right;line-height:1.6}
  .screen-photo-heading{min-height:280px;margin-bottom:19px;padding:26px 20px}
  .screen-photo-heading>img{object-position:58% center}
  .screen-photo-copy h1{font-size:clamp(2.8rem,12vw,4rem)}
  .screen-photo-copy p{max-width:270px;font-size:13px}
  .screen-photo-trailing{right:18px;top:20px;bottom:auto}
  .hero-daily-total>b{font-size:24px}
  .hero-daily-total>span{font-size:8px}
  .food-category-filters{flex-wrap:nowrap;overflow:auto;scrollbar-width:none}
  .food-category-filters::-webkit-scrollbar{display:none}
  .food-category-filters .filter-chip{flex:0 0 auto}
  .hydration-goal{grid-template-columns:1fr 80px}
  .hydration-goal .button{grid-column:1/-1}
  .hydration-entry{grid-template-columns:minmax(48px,1fr) auto auto auto;gap:2px}
  .hydration-entry>span{font-size:8px}
  .hydration-entry .button{padding-inline:6px}
  .consistency-count>b{font-size:68px}
  .weight-entry{grid-template-columns:1fr}
  .weight-entry .button{grid-column:auto}
  .weight-record{grid-template-columns:1fr auto auto auto;gap:4px}
  .weight-record>span{font-size:10px}
  .weight-record .button{padding-inline:6px;font-size:10px}
  .weight-record>input{font-size:11px}
  .auth-layout{grid-template-columns:1fr;padding:32px 18px 50px;gap:28px}
  .auth-aside{padding:18px 0 0;min-height:auto}
  .auth-aside h1{font-size:clamp(3.4rem,15vw,5.6rem);margin:17px 0}
  .auth-aside>p{font-size:14px}
  .auth-aside-mark{display:none}
  .auth-faq{margin-top:27px}
  .auth-card{padding:25px 20px}
  .setup-card{margin:28px auto;padding:24px 20px}
}
@media(max-width:380px){
  .dashboard-hero-actions{gap:8px}
  .dashboard-hero-actions .button{padding-inline:12px;font-size:12px}
  .app-nav button{font-size:9px}
  .dashboard-section-label span:last-child{display:none}
}
@media(prefers-reduced-motion:reduce){
  .dashboard-hero>img{transform:none}
  .app-card,.exercise-choice,.theme-choice,.choice-button{transition:none}
}
.screen-photo-heading{position:relative;isolation:isolate;display:flex;align-items:flex-end;min-height:264px;overflow:hidden;margin:0 0 26px;padding:32px clamp(22px,4vw,46px);background:#0b1420;color:#fff}
.screen-photo-heading>img,.screen-photo-shade{position:absolute;z-index:-2;inset:0;width:100%;height:100%}
.screen-photo-heading>img{object-fit:cover;object-position:center 48%}
.screen-photo-shade{z-index:-1;background:linear-gradient(90deg,rgba(5,11,19,.87),rgba(5,11,19,.52) 60%,rgba(5,11,19,.22)),linear-gradient(0deg,rgba(5,11,19,.66),transparent 68%)}
.screen-photo-copy{max-width:720px}
.screen-photo-copy .eyebrow{color:rgba(255,255,255,.72);font-size:10px;letter-spacing:.15em}
.screen-photo-copy h1{margin:14px 0 8px;font:700 clamp(3rem,6vw,5rem)/.96 'Space Grotesk',sans-serif;letter-spacing:-.075em}
.screen-photo-copy h1 span{color:#83aaff}
.screen-photo-copy p{max-width:560px;margin:0;color:rgba(255,255,255,.8);font-size:15px;line-height:1.6}
.screen-photo-trailing{position:absolute;right:clamp(22px,4vw,46px);bottom:34px;text-align:right}
.hero-daily-total{display:flex;flex-direction:column;align-items:flex-end}
.hero-daily-total>b{font:600 clamp(28px,4vw,42px)/1 'Space Grotesk',sans-serif;letter-spacing:-.06em}
.hero-daily-total>span{margin-top:6px;font:10px 'DM Mono',monospace;color:rgba(255,255,255,.72);letter-spacing:.12em}
.food-category-filters{padding:10px 0 4px}
.food-picker{min-width:0}
.food-category-filters{flex-wrap:wrap;max-width:100%}
.food-category-filters .filter-chip{flex:0 0 auto}
.food-category-filters .filter-chip{white-space:nowrap}
.food-item-info>span{display:block}
.hydration-meter{height:9px;overflow:hidden;margin:18px 0;background:var(--soft);border-radius:8px}
.hydration-meter i{display:block;height:100%;background:linear-gradient(90deg,#4f8df8,#68b8ff);border-radius:inherit;transition:width .35s var(--ease-out)}
.hydration-presets{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}
.hydration-preset{min-height:42px;padding:5px;border:1px solid var(--line);background:var(--soft);border-radius:3px;color:var(--fg);font:600 11px 'DM Mono',monospace;cursor:pointer}
.hydration-preset:hover{border-color:var(--accent);color:var(--accent)}
.hydration-add{display:grid;grid-template-columns:minmax(70px,.7fr) 1fr;gap:8px;margin-top:13px}
.hydration-add input,.hydration-goal input,.hydration-entry input{min-width:0;height:44px;padding:0 10px;border:1px solid var(--line);border-radius:3px;background:var(--bg)}
.hydration-add .button{min-height:44px}
.hydration-goal{display:grid;grid-template-columns:1fr 90px auto;align-items:center;gap:8px;margin-top:14px;padding-top:13px;border-top:1px solid var(--line)}
.hydration-goal label,.hydration-entry-heading{font:10px 'DM Mono',monospace;letter-spacing:.08em;color:var(--muted)}
.hydration-goal input{height:38px}
.hydration-goal .button{min-height:38px;padding-inline:10px;font-size:11px}
.hydration-entry-heading{display:flex;justify-content:space-between;gap:8px;margin:19px 0 5px}
.hydration-entry-heading b{font-weight:400}
.hydration-empty{color:var(--muted);font-size:13px;line-height:1.6}
.hydration-entries{max-height:170px;overflow:auto}
.hydration-entry{display:grid;grid-template-columns:minmax(55px,1fr) auto auto auto;align-items:center;gap:4px;padding:7px 0;border-bottom:1px solid var(--line)}
.hydration-entry>span{font:9px 'DM Mono',monospace;color:var(--muted);letter-spacing:.04em}
.hydration-entry>b{font:600 13px 'Space Grotesk',sans-serif}
.hydration-entry .button{min-height:36px;padding-inline:8px;font-size:11px}
.hydration-entry .remove-button{width:36px;height:36px;min-height:36px}
.consistency-stat{display:flex;flex-direction:column;align-items:flex-start;gap:4px;margin:24px 0 16px}
.consistency-count{display:flex;align-items:baseline;gap:9px}
.consistency-count>b{font:700 clamp(58px,8vw,84px)/.95 'Space Grotesk',sans-serif;letter-spacing:-.08em}
.consistency-count>span{font:500 clamp(20px,3vw,28px) 'Space Grotesk',sans-serif;color:var(--muted)}
.consistency-stat>span{font-size:14px;color:var(--muted)}
.progress-empty-note{color:var(--muted);font-size:12px;line-height:1.55}
.weight-latest{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin:20px 0 12px;padding:15px;background:var(--soft)}
.weight-latest>span{font:9px 'DM Mono',monospace;color:var(--muted);letter-spacing:.08em}
.weight-latest>b{font:600 23px 'Space Grotesk',sans-serif}
.weight-latest>small{font-size:11px;color:var(--muted)}
.weight-entry{display:grid;grid-template-columns:1fr 1fr auto;align-items:end;gap:10px}
.weight-entry .field{margin:8px 0}
.weight-entry .field input{height:44px}
.weight-entry .button{min-height:44px}
.weight-chart{position:relative;padding-left:54px;overflow:hidden}
.weight-chart svg{display:block;width:100%;height:auto;min-height:110px;overflow:visible}
.weight-axis-labels{position:absolute;inset:8px auto 19px 0;display:flex;flex-direction:column;justify-content:space-between;color:var(--muted);font:9px 'DM Mono',monospace}
.weight-line{fill:none;stroke:var(--accent);stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.weight-point{fill:var(--accent);stroke:var(--card);stroke-width:2}
.weight-target{stroke:var(--green);stroke-width:1.5;stroke-dasharray:5 5}
.chart-baseline{stroke:var(--line);stroke-width:1}
.chart-dates{display:flex;justify-content:space-between;gap:12px;color:var(--muted);font:9px 'DM Mono',monospace}
.weight-records{margin-top:22px}
.weight-records h3{margin:0 0 8px;font:600 16px 'Space Grotesk',sans-serif}
.weight-record{display:grid;grid-template-columns:1fr auto auto auto;align-items:center;gap:6px;padding:8px 0;border-top:1px solid var(--line)}
.weight-record>span{font-size:12px;color:var(--muted)}
.weight-record>b{font:600 13px 'Space Grotesk',sans-serif}
.weight-record>input{min-width:0;width:100%;height:40px;padding:0 7px;border:1px solid var(--line);background:var(--bg);color:var(--fg)}
.weight-record .button{min-height:36px;padding-inline:8px;font-size:11px}
.weight-record .remove-button{width:36px;height:36px;min-height:36px}
.weight-empty{display:flex;flex-direction:column;align-items:flex-start;gap:6px;padding:24px 0;color:var(--muted)}
.weight-empty>b{color:var(--fg);font-size:14px}
.weight-empty>small{font-size:12px;line-height:1.5}
.settings-grid>.app-card{min-width:0}
.storage-warning{position:sticky;z-index:30;top:0;padding:11px 20px;background:#711f35;color:#fff;text-align:center;font-size:13px}
.app-card{border-radius:10px;box-shadow:0 14px 36px rgba(18,35,55,.055)}
:root[data-theme=dark] .app-card{box-shadow:0 14px 36px rgba(0,0,0,.18)}
.card-photo{height:112px;position:relative;overflow:hidden;margin:calc(-1 * clamp(22px,3vw,34px)) calc(-1 * clamp(22px,3vw,34px)) 23px;background:var(--soft)}
.card-photo img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .7s var(--ease-out)}
.app-card:hover .card-photo img{transform:scale(1.04)}
.card-photo:after{content:"";position:absolute;inset:35% 0 0;background:linear-gradient(0deg,rgba(8,16,26,.72),transparent)}
.card-photo>span{position:absolute;z-index:1;left:18px;bottom:13px;color:#fff;font:9px 'DM Mono',monospace;letter-spacing:.13em}
.calories-card .card-photo img{object-position:center 48%}
.calories-card .card-photo{align-self:stretch}
.macros-card .card-photo img{object-position:center 45%}
.water-card .card-photo img{object-position:center 57%}
.week-card .card-photo img{object-position:center 45%}
.dashboard-feature-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:16px;margin-top:18px}
.dashboard-feature{min-height:390px;position:relative;isolation:isolate;display:flex;align-items:flex-end;overflow:hidden;padding:clamp(24px,4vw,42px);background:#101820;color:#fff}
.dashboard-feature>img,.feature-shade{position:absolute;z-index:-2;inset:0;width:100%;height:100%;object-fit:cover}
.dashboard-feature>img{transition:transform .8s var(--ease-out)}
.dashboard-feature:hover>img{transform:scale(1.04)}
.feature-shade{z-index:-1;background:linear-gradient(90deg,rgba(5,11,19,.82),rgba(5,11,19,.2)),linear-gradient(0deg,rgba(5,11,19,.7),transparent 80%)}
.feature-copy{max-width:430px}
.feature-copy .eyebrow{color:rgba(255,255,255,.75);font-size:9px;letter-spacing:.15em}
.feature-copy h2,.recovery-feature h2{font:700 clamp(2.4rem,4.6vw,4.1rem)/.93 'Space Grotesk',sans-serif;letter-spacing:-.075em;margin:16px 0}
.feature-copy p,.recovery-feature p{max-width:360px;color:rgba(255,255,255,.82);font-size:14px;line-height:1.65}
.feature-copy .button{margin-top:8px}
.feature-index{position:absolute;top:21px;right:22px;color:rgba(255,255,255,.74);font-size:9px}
.training-week-panel{display:grid;grid-template-columns:.82fr 1.18fr;gap:clamp(25px,5vw,58px);align-items:center;margin-top:18px;padding:clamp(20px,3vw,30px);background:var(--card);border:1px solid var(--line);box-shadow:0 14px 36px rgba(18,35,55,.05)}
.training-week-image{position:relative;min-height:330px;overflow:hidden;background:var(--soft)}
.training-week-image img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.training-week-image:after{content:"";position:absolute;inset:55% 0 0;background:linear-gradient(0deg,rgba(5,11,19,.72),transparent)}
.training-week-image>span{position:absolute;z-index:1;left:17px;bottom:15px;color:#fff;font:8px 'DM Mono',monospace;letter-spacing:.11em}
.training-week-copy{padding:5px 4px}
.training-week-copy>.eyebrow{font:9px 'DM Mono',monospace;letter-spacing:.13em;color:var(--muted)}
.training-week-copy h2{font:700 clamp(2.1rem,4vw,3.4rem)/.96 'Space Grotesk',sans-serif;letter-spacing:-.07em;margin:13px 0}
.training-week-copy>p{max-width:470px;color:var(--muted);font-size:13px;line-height:1.65}
.training-week-stats{display:flex;gap:clamp(20px,4vw,46px);margin:20px 0}
.training-week-stats>div{display:flex;flex-direction:column;gap:4px}
.training-week-stats b{font:600 23px 'Space Grotesk',sans-serif}
.training-week-stats span{font:8px 'DM Mono',monospace;letter-spacing:.08em;color:var(--muted)}
.training-week-chart{height:86px;display:grid;grid-template-columns:repeat(7,1fr);align-items:end;gap:10px;margin:16px 0 18px}
.training-week-day{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:7px}
.training-week-day>div{width:min(100%,38px);height:63px;display:flex;align-items:flex-end;background:var(--soft)}
.training-week-day i{width:100%;display:block;background:linear-gradient(0deg,var(--accent),color-mix(in srgb,var(--accent) 56%,white));min-height:5px}
.training-week-day>span{font:9px 'DM Mono',monospace;color:var(--muted)}
.training-week-day>span.today-label{color:var(--accent)}
.dashboard-consistency{display:grid;grid-template-columns:1fr 1fr;margin-top:18px;background:#101820;color:#fff;min-height:390px}
.consistency-photo{position:relative;min-height:330px;overflow:hidden}
.consistency-photo img{width:100%;height:100%;position:absolute;inset:0;object-fit:cover}
.consistency-photo:after{content:"";position:absolute;inset:55% 0 0;background:linear-gradient(0deg,rgba(5,11,19,.7),transparent)}
.consistency-photo>span{position:absolute;z-index:1;left:24px;bottom:20px;color:#fff;font:9px 'DM Mono',monospace;letter-spacing:.13em}
.consistency-copy{align-self:center;padding:clamp(25px,5vw,58px)}
.consistency-copy .eyebrow,.recovery-feature .eyebrow{font-size:9px;color:rgba(255,255,255,.68)}
.consistency-copy h2{font:700 clamp(2.5rem,4.6vw,4.4rem)/.92 'Space Grotesk',sans-serif;letter-spacing:-.08em;margin:17px 0}
.consistency-copy>p{max-width:390px;color:rgba(255,255,255,.72);font-size:14px;line-height:1.7}
.consistency-stats{display:flex;gap:clamp(16px,3vw,38px);margin:25px 0}
.consistency-stats>div{display:flex;flex-direction:column;gap:5px}
.consistency-stats b{font:600 24px 'Space Grotesk',sans-serif}
.consistency-stats span{font:8px 'DM Mono',monospace;letter-spacing:.08em;color:rgba(255,255,255,.64)}
.recovery-feature{position:relative;display:grid;grid-template-columns:.95fr 1.05fr;align-items:center;gap:clamp(28px,6vw,80px);margin:18px 0 14px;padding:clamp(25px,5vw,54px);overflow:hidden;background:#18222b;color:#fff}
.recovery-image{height:300px;overflow:hidden}
.recovery-image img{width:100%;height:100%;object-fit:cover;object-position:center 40%}
.recovery-feature>div:last-of-type{max-width:460px}
.recovery-feature h2{font-size:clamp(2.7rem,5vw,4.8rem)}
.recovery-feature p{color:rgba(255,255,255,.7)}
.recovery-action{border-color:rgba(255,255,255,.35);color:#fff}
.recovery-index{position:absolute;right:24px;top:22px;color:rgba(255,255,255,.55);font:9px 'DM Mono',monospace;letter-spacing:.11em}
.food-overview{display:grid;grid-template-columns:.9fr 1.1fr;gap:clamp(26px,5vw,64px);align-items:center;margin:22px 0 20px;padding:clamp(20px,3vw,32px);background:var(--card);border:1px solid var(--line);box-shadow:0 14px 36px rgba(18,35,55,.05)}
.food-overview-photo{position:relative;min-height:340px;overflow:hidden;background:var(--soft)}
.food-overview-photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.food-overview-photo:after{content:"";position:absolute;inset:60% 0 0;background:linear-gradient(0deg,rgba(5,11,19,.72),transparent)}
.food-overview-photo>span{position:absolute;left:18px;bottom:16px;z-index:1;color:#fff;font:9px 'DM Mono',monospace;letter-spacing:.12em}
.food-overview-copy{padding:8px 0}
.food-overview-copy>.eyebrow{font-size:9px;letter-spacing:.13em}
.food-overview-copy h2{font:700 clamp(2rem,4vw,3.4rem)/.98 'Space Grotesk',sans-serif;letter-spacing:-.07em;margin:16px 0 10px}
.food-overview-copy>p{max-width:460px;color:var(--muted);font-size:13px;line-height:1.7}
.food-macro-overview{display:grid;grid-template-columns:1fr 1fr;gap:13px 20px;margin:21px 0}
.food-macro-stat{min-width:0}
.food-macro-stat>span{font:9px 'DM Mono',monospace;letter-spacing:.08em;color:var(--muted)}
.food-macro-stat>b{display:block;margin:5px 0 8px;font:600 16px 'Space Grotesk',sans-serif}
.food-macro-stat>b small{font:400 10px 'DM Sans',sans-serif;color:var(--muted)}
.food-macro-stat>div{height:5px;background:var(--soft);overflow:hidden}
.food-macro-stat i{display:block;height:100%;background:var(--accent)}
.food-collections{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:17px 0 25px}
.food-collection{height:186px;position:relative;isolation:isolate;overflow:hidden;border:0;padding:0;text-align:left;color:#fff;background:#17222b;cursor:pointer}
.food-collection>img,.collection-shade{position:absolute;z-index:-2;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .6s var(--ease-out)}
.food-collection:hover>img{transform:scale(1.05)}
.collection-shade{z-index:-1;background:linear-gradient(0deg,rgba(6,13,23,.78),rgba(6,13,23,.06) 75%)}
.collection-copy{position:absolute;left:17px;bottom:17px;display:flex;flex-direction:column;gap:5px}
.collection-copy small{font:8px 'DM Mono',monospace;letter-spacing:.11em;color:rgba(255,255,255,.7)}
.collection-copy b{font:600 19px 'Space Grotesk',sans-serif}
.collection-arrow{position:absolute;right:16px;top:15px;font-size:18px}
.food-item{display:grid;grid-template-columns:58px minmax(0,1fr) 44px;align-items:center;gap:12px}
.food-item.no-photo{grid-template-columns:minmax(0,1fr) 44px}
.food-item-photo{width:58px;height:58px;object-fit:cover;border-radius:4px;background:var(--soft)}
.food-item-info{min-width:0}
.food-item-info>b{display:block}
.food-item-info>span{font-size:10px;overflow-wrap:anywhere}
.food-portion{display:inline-flex;align-items:center;gap:7px;margin-top:7px;font-size:10px}
.food-portion input{width:76px;height:34px;padding:0 8px;border:1px solid var(--line);background:var(--bg);color:var(--fg)}
.workout-paths{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:18px 0}
.workout-path{height:180px;position:relative;isolation:isolate;overflow:hidden;border:1px solid transparent;padding:0;text-align:left;color:#fff;background:#141d24;cursor:pointer}
.workout-path>img,.workout-path-shade{position:absolute;z-index:-2;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .6s var(--ease-out)}
.workout-path:hover>img{transform:scale(1.05)}
.workout-path-shade{z-index:-1;background:linear-gradient(0deg,rgba(5,11,19,.84),rgba(5,11,19,.02) 80%)}
.workout-path.selected{border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)}
.workout-path-copy{position:absolute;left:16px;right:14px;bottom:15px;display:flex;flex-direction:column;gap:3px}
.workout-path-copy small{font:8px 'DM Mono',monospace;letter-spacing:.1em;color:rgba(255,255,255,.7)}
.workout-path-copy b{font:600 23px 'Space Grotesk',sans-serif}
.workout-path-copy i{font-style:normal;font-size:11px;color:rgba(255,255,255,.74)}
.workout-path-arrow{position:absolute;right:14px;top:12px;font-size:17px;color:#fff}
.exercise-choice{display:grid;grid-template-columns:70px minmax(0,1fr) 20px;align-items:center;gap:12px;padding:8px;text-align:left}
.exercise-choice.no-photo{grid-template-columns:minmax(0,1fr) 20px}
.exercise-choice>img{width:70px;height:58px;object-fit:cover;background:var(--soft)}
.exercise-choice-copy{display:flex;flex-direction:column;gap:4px;min-width:0}
.exercise-choice-copy>b{font-size:13px}
.exercise-choice-copy>small{font-size:10px;color:var(--muted)}
.exercise-choice>i{font-style:normal}
.workout-history{margin-top:17px}
.workout-history .card-photo{height:138px}
.progress-feature{position:relative;isolation:isolate;min-height:310px;display:flex;align-items:center;overflow:hidden;margin:20px 0;padding:clamp(26px,5vw,52px);background:#111a23;color:#fff}
.progress-feature>img,.progress-feature-shade{position:absolute;z-index:-2;inset:0;width:100%;height:100%;object-fit:cover}
.progress-feature-shade{z-index:-1;background:linear-gradient(90deg,rgba(5,11,19,.84),rgba(5,11,19,.15)),linear-gradient(0deg,rgba(5,11,19,.45),transparent 70%)}
.progress-feature>div:last-of-type{max-width:530px}
.progress-feature .eyebrow{font:9px 'DM Mono',monospace;letter-spacing:.13em;color:rgba(255,255,255,.7)}
.progress-feature h2{font:700 clamp(2.5rem,5vw,4.6rem)/.92 'Space Grotesk',sans-serif;letter-spacing:-.08em;margin:16px 0}
.progress-feature p{max-width:440px;color:rgba(255,255,255,.77);font-size:13px;line-height:1.7}
.progress-feature-index{position:absolute;right:22px;bottom:18px;font:8px 'DM Mono',monospace;letter-spacing:.12em;color:rgba(255,255,255,.72)}
.settings-profile-banner{display:grid;grid-template-columns:160px 1fr auto;align-items:center;gap:22px;margin:20px 0;padding:18px;background:var(--card);border:1px solid var(--line);box-shadow:0 14px 36px rgba(18,35,55,.05)}
.settings-profile-photo{height:124px;overflow:hidden}
.settings-profile-photo img{width:100%;height:100%;object-fit:cover}
.settings-profile-copy .eyebrow{font-size:9px;letter-spacing:.12em}
.settings-profile-copy h2{margin:7px 0;font:600 25px 'Space Grotesk',sans-serif}
.settings-profile-copy p{margin:0 0 12px;color:var(--muted);font-size:12px}
.settings-profile-copy>div{display:flex;flex-wrap:wrap;gap:8px}
.settings-profile-copy>div span{padding:6px 9px;background:var(--soft);font:8px 'DM Mono',monospace;letter-spacing:.05em}
.settings-profile-mark{width:58px;height:58px;display:grid;place-items:center;border:1px solid color-mix(in srgb,var(--accent) 38%,var(--line));border-radius:50%;color:var(--accent);font:600 27px 'Space Grotesk',sans-serif}
@media(max-width:850px){
  .dashboard-feature-grid{grid-template-columns:1fr 1fr}
  .dashboard-feature{min-height:350px}
  .training-week-panel{grid-template-columns:.8fr 1.2fr;gap:24px}
  .training-week-image{min-height:290px}
  .food-overview{grid-template-columns:.8fr 1.2fr;gap:25px}
  .food-overview-photo{min-height:310px}
  .workout-paths{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media(max-width:650px){
  .card-photo{height:100px;margin:-22px -22px 19px}
  .dashboard-feature-grid,.dashboard-consistency,.recovery-feature,.food-overview{grid-template-columns:1fr}
  .dashboard-feature-grid{gap:12px}
  .dashboard-feature{min-height:340px;padding:25px}
  .consistency-photo{min-height:245px}
  .consistency-copy{padding:28px 23px}
  .consistency-stats{gap:18px}
  .consistency-stats b{font-size:21px}
  .consistency-stats span{font-size:7px}
  .training-week-panel{grid-template-columns:1fr;gap:18px;padding:14px}
  .training-week-image{min-height:220px}
  .training-week-copy{padding:4px}
  .training-week-stats{gap:22px}
  .training-week-stats b{font-size:21px}
  .training-week-stats span{font-size:7px}
  .training-week-chart{gap:7px}
  .recovery-feature{gap:22px;padding:20px}
  .recovery-image{height:225px}
  .recovery-feature h2{font-size:clamp(2.7rem,12vw,4rem)}
  .recovery-index{right:18px;top:17px}
  .food-overview{gap:19px;margin-top:17px;padding:14px}
  .food-overview-photo{min-height:225px}
  .food-overview-copy{padding:0 5px 7px}
  .food-overview-copy h2{font-size:clamp(2rem,9vw,3rem)}
  .food-collections{grid-template-columns:1fr 1fr;gap:8px}
  .food-collection{height:155px}
  .food-collection:last-child{grid-column:1/-1}
  .collection-copy{left:12px;bottom:12px}
  .collection-copy b{font-size:16px}
  .food-item{grid-template-columns:48px minmax(0,1fr) 40px;gap:9px}
  .food-item-photo{width:48px;height:50px}
  .food-item-info>span{font-size:9px}
  .food-portion input{width:64px}
  .workout-paths{grid-template-columns:1fr 1fr;gap:8px}
  .workout-path{height:155px}
  .workout-path-copy{left:12px;bottom:12px}
  .workout-path-copy b{font-size:20px}
  .category-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;border:0}
  .category-tabs button{min-width:0;min-height:40px;padding:0 4px;border:1px solid var(--line);white-space:nowrap}
  .category-tabs button.selected{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 8%,var(--bg))}
  .exercise-choice{grid-template-columns:58px minmax(0,1fr) 18px;gap:9px}
  .exercise-choice.no-photo{grid-template-columns:minmax(0,1fr) 18px}
  .exercise-choice>img{width:58px;height:52px}
  .progress-feature{min-height:290px;margin:15px 0;padding:25px 21px}
  .settings-profile-banner{grid-template-columns:82px 1fr;gap:13px;padding:12px}
  .settings-profile-photo{height:96px}
  .settings-profile-copy h2{font-size:21px}
  .settings-profile-mark{display:none}
  .settings-profile-copy>div{gap:5px}
  .settings-profile-copy>div span{font-size:7px;padding:5px 6px}
}
@media(prefers-reduced-motion:reduce){
  .card-photo img,.dashboard-feature>img,.food-collection>img,.workout-path>img{transition:none}
}
`;

export default App;
