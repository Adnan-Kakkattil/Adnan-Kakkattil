(() => {
  document.documentElement.classList.remove("no-js");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.getElementById("year").textContent = new Date().getFullYear();

  // Nav: scrolled state + mobile menu
  const nav = document.querySelector(".nav");
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");

  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    links.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  links.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  window.addEventListener("resize", () => { if (window.innerWidth > 900) setMenu(false); });

  // Active nav link
  const sectionLinks = [...links.querySelectorAll('a[href^="#"]:not(.nav__cta)')];
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      sectionLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${entry.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sectionLinks.forEach((a) => {
    const target = document.querySelector(a.getAttribute("href"));
    if (target) spy.observe(target);
  });

  // Staggered reveal
  const reveals = document.querySelectorAll(".reveal");
  reveals.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
    el.style.setProperty("--d", `${Math.min(siblings.indexOf(el), 5) * 0.08}s`);
  });
  const revealer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      revealer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  reveals.forEach((el) => revealer.observe(el));

  // Count-up stats
  const counter = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const end = Number(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      counter.unobserve(el);
      if (reduceMotion) { el.textContent = end + suffix; return; }
      const start = performance.now();
      const dur = 1400;
      const tick = (now) => {
        const t = Math.min((now - start) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - t, 3))) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach((el) => counter.observe(el));

  // Hero glow follows pointer
  const hero = document.getElementById("hero");
  const glow = hero.querySelector(".hero__glow");
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      glow.style.setProperty("--mx", `${e.clientX - r.left}px`);
      glow.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  }

  // Case card spotlight
  document.querySelectorAll(".case").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--cx", `${e.clientX - r.left}px`);
      card.style.setProperty("--cy", `${e.clientY - r.top}px`);
    });
  });

  // Terminal typing
  const term = document.getElementById("terminal");
  const script = [
    { cmd: "whoami", out: "adnan_kakkattil  # builder · researcher · teacher" },
    { cmd: "cat origin.txt", out: "device=phone → tablet  tools=termux,linux  lab=none" },
    { cmd: "cat career.log", out: "18 thothsparkz → red-team-labs → 19 gritstone → 22 EY" },
    { cmd: "ls ./skills", out: "vapt/  web-sec/  sqli/  idor/  auth/  llm-security/  full-stack/" },
    { cmd: "echo $ROLE", out: "AI Security Engineer @ EY" },
    { cmd: "./teach --lang=ml", out: "Advanced Practical Ethical Hacking · 100+ students" },
  ];
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const line = (cmd, out) => `<span class="p">$</span> ${esc(cmd)}\n<span class="c">${esc(out)}</span>\n`;

  if (reduceMotion) {
    term.innerHTML = script.map((s) => line(s.cmd, s.out)).join("") + '<span class="p">$</span> <span class="cursor"></span>';
    return;
  }

  let done = "";
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  (async () => {
    await sleep(700);
    for (const { cmd, out } of script) {
      for (let i = 1; i <= cmd.length; i++) {
        term.innerHTML = `${done}<span class="p">$</span> ${esc(cmd.slice(0, i))}<span class="cursor"></span>`;
        await sleep(45 + Math.random() * 50);
      }
      await sleep(250);
      done += line(cmd, out);
      term.innerHTML = done + '<span class="p">$</span> <span class="cursor"></span>';
      await sleep(500);
    }
  })();
})();
