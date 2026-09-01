/* ===================================================================
   Vinícius Andrey — brutalist / scrapbook portfolio
   Vanilla JS + Three.js (WebGL hero) + GSAP ScrollTrigger (reveals)
   =================================================================== */

const WHATSAPP_NUMBER = "5511952762479";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------- Procedural sound design (no audio files) ----------------
   Every sound below is synthesized on the fly with the Web Audio API —
   short noise bursts and oscillators shaped with gain/filter envelopes.
   Off by default; only ever starts after the visitor taps the mute button,
   which satisfies the browser's user-gesture requirement for audio. ------- */
const SFX = (() => {
  let ctx = null;
  let enabled = false;

  function ensureCtx() {
    if (!ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      ctx = new Ctx();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function noiseBuffer(duration) {
    const c = ensureCtx();
    const size = Math.max(1, Math.floor(c.sampleRate * duration));
    const buffer = c.createBuffer(1, size, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  function stamp() {
    if (!enabled) return;
    const c = ensureCtx();
    if (!c) return;
    const t = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(170, t);
    osc.frequency.exponentialRampToValueAtTime(48, t + 0.14);
    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  function typeClick() {
    if (!enabled) return;
    const c = ensureCtx();
    if (!c) return;
    const t = c.currentTime;
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(0.02);
    const filt = c.createBiquadFilter();
    filt.type = "highpass";
    filt.frequency.value = 2200;
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.16, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    src.connect(filt).connect(gain).connect(c.destination);
    src.start(t);
  }

  function paperTear() {
    if (!enabled) return;
    const c = ensureCtx();
    if (!c) return;
    const t = c.currentTime;
    const dur = 0.45;
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(dur);
    const filt = c.createBiquadFilter();
    filt.type = "bandpass";
    filt.Q.value = 1.1;
    filt.frequency.setValueAtTime(3200, t);
    filt.frequency.exponentialRampToValueAtTime(500, t + dur);
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.24, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(filt).connect(gain).connect(c.destination);
    src.start(t);
    src.stop(t + dur);
  }

  function scratch() {
    if (!enabled) return;
    const c = ensureCtx();
    if (!c) return;
    const t = c.currentTime;
    const dur = 1.4;
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(dur);
    const filt = c.createBiquadFilter();
    filt.type = "bandpass";
    filt.frequency.value = 2400;
    filt.Q.value = 5;
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.05, t + 0.1);
    gain.gain.setValueAtTime(0.05, t + dur - 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(filt).connect(gain).connect(c.destination);
    src.start(t);
    src.stop(t + dur);
  }

  function blip() {
    if (!enabled) return;
    const c = ensureCtx();
    if (!c) return;
    const t = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(660, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.08);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.14);
  }

  return {
    setEnabled(v) {
      enabled = v;
      if (v) ensureCtx();
    },
    isEnabled: () => enabled,
    stamp,
    typeClick,
    paperTear,
    scratch,
    blip,
  };
})();

/* ---------------- Sound toggle button ---------------- */
const soundToggle = document.getElementById("soundToggle");
soundToggle?.addEventListener("click", () => {
  const next = !SFX.isEnabled();
  SFX.setEnabled(next);
  soundToggle.setAttribute("aria-pressed", String(next));
  soundToggle.querySelector(".sound-toggle__icon").textContent = next ? "\u{1F50A}" : "\u{1F507}";
  if (next) SFX.blip();
});

/* ---------------- Nav / mobile menu ---------------- */
const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobileMenu");
burger?.addEventListener("click", () => {
  mobileMenu.classList.toggle("is-open");
});
mobileMenu?.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => mobileMenu.classList.remove("is-open"))
);

/* ---------------- Custom cursor: scissors + a lamp that follows it ---------------- */
const cursorDot = document.getElementById("cursorDot");
const cursorIcon = cursorDot?.querySelector(".cursor-dot__icon");
const isDesktopPointer = matchMedia("(hover:hover) and (pointer:fine)").matches;

if (cursorDot && isDesktopPointer) {
  let cx = 0, cy = 0, tx = 0, ty = 0;
  const root = document.documentElement;

  window.addEventListener("mousemove", (e) => {
    tx = e.clientX;
    ty = e.clientY;
    if (!prefersReducedMotion) {
      const nx = (tx / window.innerWidth - 0.5) * 2; // -1..1
      const ny = (ty / window.innerHeight - 0.5) * 2;
      root.style.setProperty("--lx", (-nx).toFixed(3));
      root.style.setProperty("--ly", (-ny).toFixed(3));
    }
  });

  const loopCursor = () => {
    const dx = tx - cx, dy = ty - cy;
    cx += dx * 0.2;
    cy += dy * 0.2;
    cursorDot.style.transform = `translate(${cx}px, ${cy}px)`;
    if (cursorIcon && (Math.abs(dx) > 0.6 || Math.abs(dy) > 0.6)) {
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 45;
      cursorIcon.style.setProperty("--cursor-r", `${angle.toFixed(1)}deg`);
    }
    requestAnimationFrame(loopCursor);
  };
  loopCursor();

  window.addEventListener("mousedown", () => cursorDot.classList.add("is-cutting"));
  window.addEventListener("mouseup", () => cursorDot.classList.remove("is-cutting"));

  document.querySelectorAll("a, button").forEach((el) => {
    el.addEventListener("mouseenter", () => cursorDot.classList.add("is-active"));
    el.addEventListener("mouseleave", () => cursorDot.classList.remove("is-active"));
  });
  document.querySelectorAll("input, textarea, select").forEach((el) => {
    el.addEventListener("mouseenter", () => cursorDot.classList.add("is-hidden"));
    el.addEventListener("mouseleave", () => cursorDot.classList.remove("is-hidden"));
  });
}

/* ---------------- Cinematic intro ---------------- */
(function intro() {
  const el = document.getElementById("intro");
  if (!el) return;
  const finish = () => el.classList.add("is-done");

  if (prefersReducedMotion || !window.gsap) {
    finish();
    return;
  }
  const mark = el.querySelector(".intro__mark");
  const bars = el.querySelectorAll(".intro__bar");
  const tl = gsap.timeline({ onComplete: finish });
  tl.set(bars, { scaleY: 1 })
    .to(mark, { opacity: 1, duration: 0.35, ease: "power1.out" })
    .to(mark, { opacity: 1, duration: 0.45 })
    .to(mark, { opacity: 0, duration: 0.25, ease: "power1.in" }, ">-0.05")
    .to(
      bars,
      { scaleY: 0, duration: 0.6, ease: "power4.inOut", stagger: 0 },
      "<"
    )
    .call(() => SFX.paperTear(), [], "<")
    .set(el, { pointerEvents: "none" });

  // hard safety net: never let a slow/failed load block the page
  setTimeout(finish, 3000);
})();

/* ---------------- Tilt on hover (polaroids & work cards) ---------------- */
if (matchMedia("(hover:hover) and (pointer:fine)").matches && !prefersReducedMotion) {
  document.querySelectorAll(".work-card, .polaroid").forEach((el) => {
    const max = 6;
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--tx", `${(py * -max).toFixed(2)}deg`);
      el.style.setProperty("--ty", `${(px * max).toFixed(2)}deg`);
    });
    el.addEventListener("mouseleave", () => {
      el.style.setProperty("--tx", "0deg");
      el.style.setProperty("--ty", "0deg");
    });
  });
}

/* ---------------- Scroll reveal ---------------- */
const revealSelectors = [".sec__kicker", ".pull-quote", ".about__photo", ".scrap-form"];
document.querySelectorAll(revealSelectors.join(",")).forEach((el, i) => {
  el.classList.add("reveal");
  el.style.transitionDelay = `${(i % 6) * 0.06}s`;
});

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-revealed");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

/* ---------------- WhatsApp forms ---------------- */
function sendToWhatsapp(text) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener");
}

document.getElementById("testimonialForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const nome = f.get("nome") || "";
  const cargo = f.get("cargo") || "";
  const dep = f.get("depoimento") || "";
  sendToWhatsapp(
    `Olá Vinícius! Quero deixar um depoimento.\n\nNome: ${nome}\nCargo/Empresa: ${cargo}\n\n"${dep}"`
  );
  e.target.reset();
});

document.getElementById("contactForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const nome = f.get("nome") || "";
  const email = f.get("email") || "";
  const empresa = f.get("empresa") || "";
  const tipo = f.get("tipo") || "";
  const msg = f.get("mensagem") || "";
  sendToWhatsapp(
    `Olá Vinícius! Vim pelo portfolio.\n\nNome: ${nome}\nE-mail: ${email}\nEmpresa: ${empresa}\nTipo de projeto: ${tipo}\n\nMensagem:\n${msg}`
  );
  e.target.reset();
});

/* ---------------- Film reel scroll nav ---------------- */
(function reelNav() {
  const reelFill = document.getElementById("reelFill");
  const links = Array.from(document.querySelectorAll(".reel__chapters a"));
  if (!reelFill || !links.length) return;

  const sections = links
    .map((a) => document.getElementById(a.dataset.chapter))
    .filter(Boolean);

  const setActive = (id) => {
    links.forEach((a) => a.classList.toggle("is-active", a.dataset.chapter === id));
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
  );
  sections.forEach((s) => io.observe(s));

  let ticking = false;
  const updateFill = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    reelFill.style.height = `${Math.min(100, Math.max(0, pct))}%`;
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(updateFill);
      ticking = true;
    }
  });
  updateFill();
})();

/* ---------------- GSAP scroll pin-fade for hero canvas ---------------- */
let heroProgress = 0;
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.create({
    trigger: ".hero",
    start: "top top",
    end: "bottom top",
    scrub: true,
    onUpdate: (self) => { heroProgress = self.progress; },
  });
}

/* ---------------- Cinematic scroll effects ---------------- */
if (window.gsap && window.ScrollTrigger && !prefersReducedMotion) {
  // parallax drift on every collage cutout — each section's fragments
  // move at a slightly different speed than the page, for depth
  document.querySelectorAll(".collage-cutout").forEach((el, i) => {
    const dir = i % 2 === 0 ? -1 : 1;
    gsap.to(el, {
      yPercent: dir * (14 + (i % 3) * 4),
      ease: "none",
      scrollTrigger: {
        trigger: el.closest(".sec") || el,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.6,
      },
    });
  });

  // section titles reveal like a film subtitle card: masked slide-up
  document.querySelectorAll(".sec__title").forEach((title) => {
    const inner = document.createElement("span");
    inner.className = "sec__title-inner";
    inner.innerHTML = title.innerHTML;
    title.innerHTML = "";
    title.appendChild(inner);
    gsap.fromTo(
      inner,
      { yPercent: 115 },
      {
        yPercent: 0,
        duration: 0.9,
        ease: "power4.out",
        scrollTrigger: { trigger: title, start: "top 88%" },
      }
    );
  });

  // project photos "open like a curtain" the first time they scroll into view
  document.querySelectorAll(".work-card__photo img").forEach((img) => {
    gsap.fromTo(
      img,
      { clipPath: "inset(0 0 100% 0)" },
      {
        clipPath: "inset(0 0 0% 0)",
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: img, start: "top 90%" },
      }
    );
  });

  /* ---- one signature motion per section ---- */

  // SOBRE — the portrait "develops" like an instant photo: blurred,
  // over-exposed and grey, sharpening into full contrast
  document.querySelectorAll(".polaroid__img--photo img").forEach((img) => {
    gsap.fromTo(
      img,
      { filter: "grayscale(1) contrast(.6) brightness(1.8) blur(6px)", opacity: 0.5 },
      {
        filter: "grayscale(0) contrast(1) brightness(1) blur(0px)",
        opacity: 1,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: { trigger: img, start: "top 85%" },
      }
    );
  });
  // index cards slide in from alternating sides, like files into a drawer
  gsap.utils.toArray(".index-card").forEach((card, i) => {
    gsap.fromTo(
      card,
      { opacity: 0, x: i % 2 === 0 ? -50 : 50 },
      {
        opacity: 1,
        x: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: card, start: "top 94%" },
      }
    );
  });

  // ATUAÇÃO — stub cards flip in like index cards turning face-up
  gsap.utils.toArray(".stub").forEach((el, i) => {
    gsap.fromTo(
      el,
      { opacity: 0, rotateY: -85, transformPerspective: 800 },
      {
        opacity: 1,
        rotateY: 0,
        duration: 0.8,
        delay: (i % 4) * 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%" },
      }
    );
  });

  // RECORTES — project cards pop up and settle, like photos tossed onto a table
  gsap.utils.toArray(".work-card").forEach((card, i) => {
    gsap.fromTo(
      card,
      { opacity: 0, y: 70, scale: 0.82 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.75,
        delay: (i % 2) * 0.1,
        ease: "back.out(1.5)",
        scrollTrigger: { trigger: card, start: "top 92%" },
      }
    );
  });

  // TRAJETÓRIA — receipt rows print out top-to-bottom, dot-matrix style
  gsap.utils.toArray(".receipt__row").forEach((row, i) => {
    gsap.fromTo(
      row,
      { opacity: 0, clipPath: "inset(0 0 100% 0)" },
      {
        opacity: 1,
        clipPath: "inset(0 0 0% 0)",
        duration: 0.4,
        delay: i * 0.1,
        ease: "steps(5)",
        scrollTrigger: { trigger: ".receipt", start: "top 78%" },
      }
    );
  });

  // SKILLS — ransom letters drop and bounce into place
  gsap.utils.toArray(".rletter").forEach((el, i) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: -55 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        delay: (i % 9) * 0.05,
        ease: "bounce.out",
        scrollTrigger: { trigger: el, start: "top 96%" },
      }
    );
  });

  // CERTIFICAÇÕES — each badge stamps down with a quick impact flash
  gsap.utils.toArray(".stamp-badge").forEach((el, i) => {
    const stampTl = gsap.timeline({
      delay: (i % 3) * 0.08,
      scrollTrigger: { trigger: el, start: "top 92%" },
    });
    stampTl
      .call(() => SFX.stamp())
      .fromTo(el, { opacity: 0, scale: 1.7 }, { opacity: 1, scale: 1, duration: 0.28, ease: "power4.out" })
      .fromTo(el, { filter: "brightness(2.2)" }, { filter: "brightness(1)", duration: 0.3 }, "<");
  });

  // DEPOIMENTOS — the notecard quote and testimonial rows type themselves out
  const note = document.querySelector(".notecard p");
  if (note) {
    const fullText = note.textContent;
    note.textContent = "";
    ScrollTrigger.create({
      trigger: note,
      start: "top 85%",
      once: true,
      onEnter: () => {
        let i = 0;
        const step = () => {
          const ch = fullText[i - 1];
          note.textContent = fullText.slice(0, i);
          if (ch && ch !== " ") SFX.typeClick();
          i++;
          if (i <= fullText.length) setTimeout(step, 16);
        };
        step();
      },
    });
  }

  // CONTATO — postage stamps drift toward the cursor like little magnets
  document.querySelectorAll(".postage").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const mx = (e.clientX - r.left - r.width / 2) * 0.15;
      const my = (e.clientY - r.top - r.height / 2) * 0.15;
      el.style.setProperty("--mx", `${mx.toFixed(1)}px`);
      el.style.setProperty("--my", `${my.toFixed(1)}px`);
    });
    el.addEventListener("mouseleave", () => {
      el.style.setProperty("--mx", "0px");
      el.style.setProperty("--my", "0px");
    });
  });

  // FOOTER — the name signs itself in as the page ends
  const sigText = document.querySelector(".signature__text");
  const sigTip = document.querySelector(".signature__tip");
  if (sigText && sigTip) {
    const sigTl = gsap.timeline({
      scrollTrigger: { trigger: ".footer", start: "top 85%", once: true },
    });
    sigTl
      .call(() => SFX.scratch())
      .to(sigTip, { opacity: 1, left: "0%", duration: 0.1 })
      .to(sigText, { clipPath: "inset(0 0% 0 0)", duration: 1.5, ease: "power1.inOut" }, "<")
      .to(sigTip, { left: "100%", duration: 1.5, ease: "power1.inOut" }, "<")
      .to(sigTip, { opacity: 0, duration: 0.3 });
  }

  window.addEventListener("load", () => ScrollTrigger.refresh());
}

/* ===================================================================
   WebGL hero scene — floating "torn collage" shards
   =================================================================== */
(function initHeroScene() {
  const canvas = document.getElementById("webgl");
  if (!canvas || !window.THREE) return;

  const isSmall = window.innerWidth < 720;
  const SHARD_COUNT = prefersReducedMotion ? 0 : isSmall ? 14 : 26;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 9);

  const PALETTES = [
    ["#efe6d2", "#cbb083"],
    ["#f4ecd9", "#a9822f"],
    ["#e6d9bb", "#5b5a3a"],
    ["#faf6ec", "#8a6a45"],
  ];

  function makeShardTexture(variant, palette) {
    const size = 512;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, size, size);

    // jagged torn polygon
    const margin = size * 0.14;
    const jag = size * 0.05;
    const pts = [];
    const perSide = 6;
    const edges = [
      [margin, margin, size - margin, margin], // top
      [size - margin, margin, size - margin, size - margin], // right
      [size - margin, size - margin, margin, size - margin], // bottom
      [margin, size - margin, margin, margin], // left
    ];
    edges.forEach(([x1, y1, x2, y2]) => {
      for (let i = 0; i < perSide; i++) {
        const t = i / perSide;
        const x = x1 + (x2 - x1) * t + (Math.random() - 0.5) * jag;
        const y = y1 + (y2 - y1) * t + (Math.random() - 0.5) * jag;
        pts.push([x, y]);
      }
    });

    ctx.beginPath();
    pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])));
    ctx.closePath();
    ctx.save();
    ctx.clip();

    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, palette[0]);
    grad.addColorStop(1, palette[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    if (variant === "halftone") {
      ctx.fillStyle = "rgba(20,15,10,0.35)";
      const step = 22;
      for (let y = 0; y < size; y += step) {
        for (let x = 0; x < size; x += step) {
          const r = 2 + Math.random() * 5;
          ctx.beginPath();
          ctx.arc(x + (Math.random() - 0.5) * 6, y + (Math.random() - 0.5) * 6, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (variant === "love") {
      ctx.fillStyle = "rgba(20,15,10,0.4)";
      ctx.font = "italic 34px Georgia, serif";
      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.rotate(-0.12);
      ctx.translate(-size / 2, -size / 2);
      for (let y = -40; y < size + 40; y += 46) {
        for (let x = -40; x < size + 40; x += 96) {
          ctx.fillText("love", x, y);
        }
      }
      ctx.restore();
    } else if (variant === "greek") {
      ctx.strokeStyle = "rgba(20,15,10,0.4)";
      ctx.lineWidth = 4;
      const gm = margin + 14;
      const step = 30;
      for (let x = gm; x < size - gm; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, gm);
        ctx.lineTo(x, gm + 14);
        ctx.lineTo(x + step / 2, gm + 14);
        ctx.lineTo(x + step / 2, gm);
        ctx.stroke();
      }
    } else if (variant === "type") {
      ctx.fillStyle = "rgba(20,15,10,0.45)";
      ctx.font = "22px 'Courier New', monospace";
      const lines = ["SOFTWARE", "DADOS", "IA", "01010", "NEGÓCIOS"];
      for (let y = 60; y < size - 30; y += 40) {
        ctx.fillText(lines[Math.floor(Math.random() * lines.length)], 20, y);
      }
    }

    // fine grain
    for (let i = 0; i < 140; i++) {
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.06})`;
      ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
    }
    ctx.restore();

    ctx.strokeStyle = "rgba(20,15,10,0.35)";
    ctx.lineWidth = 3;
    ctx.stroke();

    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

  const variants = ["halftone", "love", "greek", "type", "plain"];
  const shards = [];
  const group = new THREE.Group();

  function spawnShard(mat, aspect) {
    const base = 0.9 + Math.random() * 1.8;
    const w = aspect >= 1 ? base : base * aspect;
    const h = aspect >= 1 ? base / aspect : base;
    const geo = new THREE.PlaneGeometry(w, h);
    const mesh = new THREE.Mesh(geo, mat);

    const radiusX = 6.5, radiusY = 3.6;
    mesh.position.set(
      (Math.random() * 2 - 1) * radiusX,
      (Math.random() * 2 - 1) * radiusY,
      -Math.random() * 7
    );
    mesh.rotation.z = Math.random() * Math.PI;
    mesh.rotation.y = (Math.random() - 0.5) * 0.6;

    mesh.userData = {
      baseX: mesh.position.x,
      baseY: mesh.position.y,
      baseZ: mesh.position.z,
      speed: 0.15 + Math.random() * 0.35,
      phase: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.15,
      flyDir: new THREE.Vector3(
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4,
        4 + Math.random() * 6
      ),
    };

    group.add(mesh);
    shards.push(mesh);
  }

  for (let i = 0; i < SHARD_COUNT; i++) {
    const variant = variants[Math.floor(Math.random() * variants.length)];
    const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
    const tex = makeShardTexture(variant, palette);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    spawnShard(mat, 1);
  }

  // real collage fragments cut from the moodboard, mixed into the floating field
  if (!prefersReducedMotion) {
    const PHOTO_SHARDS = isSmall
      ? [["assets/cutouts/nike.png", 190 / 205]]
      : [
          ["assets/cutouts/fresco_oval.png", 345 / 500],
          ["assets/cutouts/ruin_painting.png", 240 / 330],
          ["assets/cutouts/angelwing.png", 266 / 300],
          ["assets/cutouts/nike.png", 190 / 205],
          ["assets/cutouts/quadriga.png", 250 / 318],
          ["assets/cutouts/love_wreath.png", 336 / 285],
        ];
    const loader = new THREE.TextureLoader();
    PHOTO_SHARDS.forEach(([url, aspect]) => {
      loader.load(url, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace ?? tex.colorSpace;
        const mat = new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          opacity: 0.95,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        spawnShard(mat, aspect);
      });
    });
  }

  scene.add(group);

  // mouse parallax
  let mouseX = 0, mouseY = 0;
  window.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  });

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener("resize", onResize);

  const clock = new THREE.Clock();
  let heroVisible = true;
  let rafId = null;
  let lastOpacity = -1;

  const heroIO = new IntersectionObserver(
    (entries) => {
      heroVisible = entries[0].isIntersecting;
      if (heroVisible && rafId === null) {
        rafId = requestAnimationFrame(animate);
      }
    },
    { threshold: 0 }
  );
  heroIO.observe(document.querySelector(".hero"));

  function animate() {
    if (!heroVisible) {
      rafId = null;
      return;
    }
    rafId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    camera.position.x += (mouseX * 1.1 - camera.position.x) * 0.03;
    camera.position.y += (-mouseY * 0.7 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, -2);

    shards.forEach((m) => {
      const d = m.userData;
      const drift = prefersReducedMotion ? 0 : Math.sin(t * d.speed + d.phase) * 0.35;
      m.position.x = d.baseX + drift + d.flyDir.x * heroProgress;
      m.position.y = d.baseY + Math.cos(t * d.speed * 0.8 + d.phase) * 0.25 + d.flyDir.y * heroProgress;
      m.position.z = d.baseZ + d.flyDir.z * heroProgress;
      m.rotation.z += d.spin * 0.01;
      m.material.opacity = 0.92 * (1 - heroProgress);
    });

    const nextOpacity = Math.max(0, 1 - heroProgress * 1.1);
    if (Math.abs(nextOpacity - lastOpacity) > 0.01) {
      canvas.style.opacity = String(nextOpacity);
      lastOpacity = nextOpacity;
    }
    renderer.render(scene, camera);
  }
  animate();
})();
