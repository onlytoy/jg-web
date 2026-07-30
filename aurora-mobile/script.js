// Aurora Mobile Japan — interactions

// Nav shadow on scroll
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// Mobile drawer + dropdown menus
const toggle = document.getElementById("navToggle");
const navItems = [...document.querySelectorAll(".nav-item")];

const closeMenus = () => {
  navItems.forEach((item) => {
    item.classList.remove("open");
    item.querySelector(".nav-trigger")?.setAttribute("aria-expanded", "false");
  });
};

const closeDrawer = () => {
  nav.classList.remove("nav-open");
  toggle?.setAttribute("aria-expanded", "false");
  closeMenus();
};

toggle?.addEventListener("click", () => {
  const opened = nav.classList.toggle("nav-open");
  toggle.setAttribute("aria-expanded", String(opened));
  if (!opened) closeMenus();
});

navItems.forEach((item) => {
  const trigger = item.querySelector(".nav-trigger");
  trigger?.addEventListener("click", () => {
    const willOpen = !item.classList.contains("open");
    closeMenus();
    if (willOpen) {
      item.classList.add("open");
      trigger.setAttribute("aria-expanded", "true");
    }
  });

  // デスクトップではホバー主体なので、離れたら開いた状態を解除する
  item.addEventListener("mouseleave", () => {
    if (window.innerWidth > 860) {
      item.classList.remove("open");
      trigger?.setAttribute("aria-expanded", "false");
    }
  });
});

// Close on link click, outside click, or Escape
document.querySelectorAll(".nav-links a").forEach((a) =>
  a.addEventListener("click", closeDrawer)
);
document.addEventListener("click", (e) => {
  if (!nav.contains(e.target)) closeDrawer();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDrawer();
});

// Reveal on scroll
const revealEls = document.querySelectorAll(".reveal");
const revObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        revObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealEls.forEach((el) => revObserver.observe(el));

// Animated counters — online-style units: K / M / B
const pickUnit = (n) => {
  const abs = Math.abs(n);
  if (abs >= 1e9) return { div: 1e9, unit: "B" };
  if (abs >= 1e6) return { div: 1e6, unit: "M" };
  if (abs >= 1e3) return { div: 1e3, unit: "K" };
  return { div: 1, unit: "" };
};

const formatWithUnit = (n, target, forceDecimals) => {
  const { div, unit } = pickUnit(target);
  const value = n / div;

  let decimals = forceDecimals;
  if (decimals == null) {
    const final = Math.abs(target / div);
    if (!unit) decimals = 0;
    else if (final >= 100) decimals = 0;
    else if (final >= 10) decimals = 1;
    else decimals = 2;
  }

  const text =
    decimals > 0
      ? value.toFixed(decimals).replace(/\.?0+$/, "")
      : String(Math.round(value));

  return text + unit;
};

const runCounter = (el) => {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || "";
  const useAutoUnit = el.dataset.unit !== "false" && target >= 1000;
  const decimals = el.dataset.decimals != null ? parseInt(el.dataset.decimals, 10) : null;
  const duration = 1600;
  const start = performance.now();
  const render = (value) => {
    if (useAutoUnit) return formatWithUnit(value, target, decimals) + suffix;
    if (value >= 10000) return Math.round(value).toLocaleString("en-US") + suffix;
    return String(Math.round(value)) + suffix;
  };
  const step = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = render(target * eased);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = render(target);
  };
  requestAnimationFrame(step);
};

const counters = document.querySelectorAll("[data-count]");
const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        runCounter(e.target);
        countObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.5 }
);
counters.forEach((el) => countObserver.observe(el));
