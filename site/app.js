/* lcv-leo.lcv.dev — page engine (vanilla, no build step) */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============ about.yaml — content mirrored from the profile README ============ */
  // Each line is a list of [cssClass, text] segments, pre-tokenized for highlighting.
  const K = "y-key", S = "y-str", P = "y-punc", A = "y-arrow", T = "y-tag";
  const YAML = [
    [[K, "name"], [P, ": "], [S, "Leonardo Cardozo Vargas"]],
    [[K, "role"], [P, ": "], [S, "Founder, Full-Stack & Edge Developer"]],
    [[K, "location"], [P, ": "], [S, "Brazil"]],
    [[K, "organization"], [P, ": "], [S, "LCV Ideas & Software — https://www.lcv.dev"]],
    [[K, "stack"], [P, ":"]],
    [[P, "  "], [K, "languages"], [P, ": ["], [S, "TypeScript, JavaScript, Rust, Python, SQL"], [P, "]"]],
    [[P, "  "], [K, "frontend"], [P, ":  ["], [S, "React 19, Vite, TipTap, PWA/Workbox, DOMPurify"], [P, "]"]],
    [[P, "  "], [K, "edge"], [P, ":      ["], [S, "CF Workers, Pages, Hono, D1, Secrets Store, Cron"], [P, "]"]],
    [[P, "  "], [K, "desktop"], [P, ":   ["], [S, "Tauri (Rust)"], [P, "]"]],
    [[P, "  "], [K, "ai"], [P, ":        ["], [S, "MCP servers, Vertex AI, Claude, GPT, Grok, DeepSeek, Perplexity"], [P, "]"]],
    [[P, "  "], [K, "payments"], [P, ":  ["], [S, "Mercado Pago (Orders API + 3DS), Stripe (planned)"], [P, "]"]],
    [[P, "  "], [K, "quality"], [P, ":   ["], [S, "Vitest, Zod, Biome, CodeQL, Zizmor, Scorecard"], [P, "]"]],
    [[P, "  "], [K, "ops"], [P, ":       ["], [S, "GitHub Actions, Dependabot, Linear, Slack"], [P, "]"]],
    [[K, "current"], [P, ":"]],
    [[P, "  - "], [T, "cross-review"], [P, "   "], [A, "→"], [S, " 6-AI adversarial code review MCP "], [P, "["], [T, "npm"], [P, "]"]],
    [[P, "  - "], [T, "ultrabrain-mcp"], [P, " "], [A, "→"], [S, " structured deep-reasoning MCP "], [P, "["], [T, "npm"], [P, "]"]],
    [[P, "  - "], [T, "Reflexos da Alma"], [P, " "], [A, "→"], [S, " blog PWA · React + Workers + D1 "], [P, "["], [T, "Live"], [P, "]"]],
    [[P, "  - "], [T, "Oráculo Financeiro"], [P, " "], [A, "→"], [S, " fixed-income dashboard "], [P, "["], [T, "Live"], [P, "]"]],
    [[P, "  - "], [T, "Maestro"], [P, "        "], [A, "→"], [S, " desktop studio · Tauri + Rust "], [P, "["], [T, "Shipping"], [P, "]"]],
    [[P, "  - "], [T, "Sponsor Motor"], [P, "  "], [A, "→"], [S, " donation payments worker "], [P, "["], [T, "Live"], [P, "]"]],
    [[K, "motto"], [P, ": "], [S, "\"Fail closed, test first, ship through pull requests.\""]],
  ];

  const code = document.getElementById("editor-code");
  const gutter = document.getElementById("editor-gutter");
  const progress = document.getElementById("editor-progress");
  const skipBtn = document.getElementById("editor-skip");

  const totalChars = YAML.reduce(
    (sum, line) => sum + line.reduce((s, seg) => s + seg[1].length, 0) + 1, 0
  );

  function renderAll() {
    code.textContent = "";
    gutter.textContent = "";
    YAML.forEach((line, i) => {
      const li = document.createElement("li");
      li.textContent = String(i + 1);
      gutter.appendChild(li);
      line.forEach(([cls, text]) => {
        const span = document.createElement("span");
        span.className = cls;
        span.textContent = text;
        code.appendChild(span);
      });
      code.appendChild(document.createTextNode("\n"));
    });
    if (progress) progress.textContent = "100%";
    if (skipBtn) skipBtn.remove();
  }

  function typeYaml() {
    let li = 0, si = 0, ci = 0, typed = 0, skipped = false;
    const caret = document.createElement("span");
    caret.className = "editor__caret";
    code.appendChild(caret);
    let currentSpan = null;

    skipBtn.addEventListener("click", () => { skipped = true; });

    function newLineNumber() {
      const n = document.createElement("li");
      n.textContent = String(li + 1);
      gutter.appendChild(n);
    }
    newLineNumber();

    function step() {
      if (skipped) { renderAll(); return; }
      // ramp: starts deliberate, accelerates as the file grows
      const delay = typed < 120 ? 26 : typed < 400 ? 14 : 7;
      const line = YAML[li];
      if (!line) { caret.remove(); if (progress) progress.textContent = "100%"; if (skipBtn) skipBtn.remove(); return; }
      const seg = line[si];
      if (!seg) {
        code.insertBefore(document.createTextNode("\n"), caret);
        currentSpan = null;
        li += 1; si = 0; ci = 0; typed += 1;
        if (li < YAML.length) newLineNumber();
        code.parentElement.scrollTop = code.parentElement.scrollHeight;
        setTimeout(step, delay * 2);
        return;
      }
      if (!currentSpan) {
        currentSpan = document.createElement("span");
        currentSpan.className = seg[0];
        code.insertBefore(currentSpan, caret);
      }
      currentSpan.textContent += seg[1][ci];
      ci += 1; typed += 1;
      if (progress) progress.textContent = Math.min(99, Math.round((typed / totalChars) * 100)) + "%";
      if (ci >= seg[1].length) { si += 1; ci = 0; currentSpan = null; }
      setTimeout(step, delay);
    }
    step();
  }

  if (code && gutter) {
    if (reduceMotion) {
      renderAll();
    } else {
      // start typing when the editor first becomes visible
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) { io.disconnect(); typeYaml(); }
      }, { threshold: 0.25 });
      io.observe(code);
    }
  }

  /* ============ hero role rotation ============ */
  const ROLES = [
    "Full-Stack & Edge Developer",
    "TypeScript • React • Cloudflare",
    "Rust • Tauri • MCP Servers",
    "Building Real Products at LCV Ideas & Software",
  ];
  const roleEl = document.getElementById("role-type");
  if (roleEl && !reduceMotion) {
    let idx = 0;
    function swapRole() {
      idx = (idx + 1) % ROLES.length;
      const next = ROLES[idx];
      let erase = roleEl.textContent.length;
      (function eraseStep() {
        if (erase > 0) {
          erase -= 1;
          roleEl.textContent = roleEl.textContent.slice(0, -1);
          setTimeout(eraseStep, 16);
        } else {
          let w = 0;
          (function writeStep() {
            if (w < next.length) {
              w += 1;
              roleEl.textContent = next.slice(0, w);
              setTimeout(writeStep, 34);
            } else {
              setTimeout(swapRole, 2600);
            }
          })();
        }
      })();
    }
    setTimeout(swapRole, 3000);
  }

  /* ============ animated counters ============ */
  function animateCount(el, target) {
    if (reduceMotion) { el.textContent = String(target); return; }
    const dur = 900, t0 = performance.now();
    (function tick(t) {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }
  const stats = document.querySelectorAll(".stat dd");
  if (stats.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animateCount(e.target, Number(e.target.dataset.count) || 0);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.6 });
    stats.forEach((el) => io.observe(el));
  }

  // self-updating indicators: fetched straight from the GitHub API on every visit
  // (baked fallbacks stay in place if the API is unavailable or rate-limited)
  function setLive(id, value) {
    const el = document.getElementById(id);
    if (el && typeof value === "number") {
      el.dataset.count = String(value);
      el.textContent = String(value);
    }
  }
  fetch("https://api.github.com/users/lcv-leo")
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (!data) return;
      setLive("stat-followers", data.followers);
      setLive("stat-repos", data.public_repos);
      const fEl = document.getElementById("ghcard-followers");
      if (fEl && typeof data.followers === "number") fEl.textContent = String(data.followers);
      const rEl = document.getElementById("ghcard-repos");
      if (rEl && typeof data.public_repos === "number") rEl.textContent = String(data.public_repos);
      const jEl = document.getElementById("ghcard-joined");
      if (jEl && data.created_at) {
        const joined = new Date(data.created_at);
        const months = Math.max(0, Math.floor((Date.now() - joined.getTime()) / 2629800000));
        jEl.textContent = months < 1 ? "Joined GitHub this month"
          : months < 12 ? "Joined GitHub " + months + (months === 1 ? " month ago" : " months ago")
          : "Joined GitHub " + joined.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      }
    })
    .catch(() => {});
  fetch("https://api.github.com/users/lcv-leo/repos?per_page=100")
    .then((r) => (r.ok ? r.json() : null))
    .then((repos) => {
      if (!Array.isArray(repos)) return;
      setLive("stat-stars", repos.reduce((s, r) => s + (r.stargazers_count || 0), 0));
    })
    .catch(() => {});

  // fresh analytics on every visit: hourly cache-buster on the live-rendered charts,
  // shimmer while the chart services render, one retry then hide on hard failure
  const cb = new Date().toISOString().slice(0, 13).replace(/\D/g, "");
  document.querySelectorAll(".analytics img").forEach((img) => {
    img.dataset.retries = "0";
    img.addEventListener("load", () => img.classList.add("is-loaded"));
    img.addEventListener("error", () => {
      const tries = Number(img.dataset.retries || "0");
      if (tries < 1) {
        img.dataset.retries = String(tries + 1);
        const base = img.src.split("&cb=")[0].split("?cb=")[0];
        setTimeout(() => {
          img.src = base + (base.includes("?") ? "&" : "?") + "cb=" + cb + "r";
        }, 2500);
      } else {
        img.style.display = "none"; // never show a broken-image icon
      }
    });
    img.src += (img.src.includes("?") ? "&" : "?") + "cb=" + cb;
  });

  /* ============ scroll reveals ============ */
  const revealed = document.querySelectorAll(".reveal");
  if (reduceMotion) {
    revealed.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealed.forEach((el) => io.observe(el));
  }

  /* ============ footer year ============ */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
