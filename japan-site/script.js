/* =========================================================
   Business ecosystem carousel
   - the section pins while you scroll: all four slides must
     be stepped through before the page continues
   - clicking a thumbnail scrolls to that slide's position, so
     the scroll offset stays the single source of truth
   - falls back to plain document flow when the stage can't
     fit the viewport, or when reduced motion is requested
   ========================================================= */
(function () {
  'use strict';

  var section = document.querySelector('.eco');
  if (!section) return;

  var stage = section.querySelector('.eco__stage');
  var strip = section.querySelector('.eco__thumbs');
  var tabs = Array.prototype.slice.call(section.querySelectorAll('.thumb__btn'));
  var media = Array.prototype.slice.call(section.querySelectorAll('.eco__media-img'));
  var panels = Array.prototype.slice.call(section.querySelectorAll('.eco__slide'));
  var counter = section.querySelector('.eco__count-now');
  if (!stage || !tabs.length) return;

  var COUNT = tabs.length;
  var LAST = COUNT - 1;
  var current = 0;

  /* share of a band that must be crossed before the slide flips, so a pixel
     of scroll jitter at a boundary can't make the card flicker */
  var DEAD_ZONE = 0.12;

  /* fallback mode only: how far you must scroll after a click before the
     scroll position takes control back */
  var RELEASE_DISTANCE = 220;
  var lockedAt = null;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var pinned = false;
  var pinTop = 0;

  /* ---------- layout ---------- */

  /* Pin only when the stage genuinely fits on screen. Below ~1660px the stage
     reflows to a taller grid, and on phones it stacks — pinning either would
     crop the card, so those keep scrolling normally. */
  function measure() {
    section.classList.remove('is-pinned');

    var stageHeight = stage.getBoundingClientRect().height;
    var room = window.innerHeight - 32;
    var canPin = !reduceMotion.matches && stageHeight <= room;

    if (!canPin) {
      pinned = false;
      section.style.removeProperty('--eco-stage-h');
      section.style.removeProperty('--eco-top');
      return;
    }

    pinTop = Math.max(0, Math.round((window.innerHeight - stageHeight) / 2));
    section.style.setProperty('--eco-stage-h', stageHeight + 'px');
    section.style.setProperty('--eco-top', pinTop + 'px');
    section.classList.add('is-pinned');
    pinned = true;
  }

  /* ---------- rendering ---------- */

  /* when the strip overflows (narrow layouts) keep the selected card in view */
  function revealThumb(index) {
    if (!strip || strip.scrollWidth <= strip.clientWidth + 1) return;

    var stripBox = strip.getBoundingClientRect();
    var tabBox = tabs[index].getBoundingClientRect();
    var delta = (tabBox.left + tabBox.width / 2) - (stripBox.left + stripBox.width / 2);
    if (Math.abs(delta) < 2) return;

    strip.scrollBy({
      left: delta,
      behavior: reduceMotion.matches ? 'auto' : 'smooth'
    });
  }

  function show(index) {
    index = Math.max(0, Math.min(LAST, index));
    if (index === current) return;

    current = index;

    tabs.forEach(function (tab, i) {
      var on = i === index;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
    });

    media.forEach(function (img, i) {
      img.classList.toggle('is-active', i === index);
    });

    /* panels stay in the layout (visibility, not display) so the card keeps
       the height of the longest copy and never jumps mid-transition */
    panels.forEach(function (panel, i) {
      var on = i === index;
      panel.classList.toggle('is-active', on);
      panel.setAttribute('aria-hidden', on ? 'false' : 'true');
    });

    revealThumb(index);

    if (counter) {
      if (reduceMotion.matches) {
        counter.textContent = String(index + 1);
      } else {
        counter.classList.add('is-swapping');
        window.setTimeout(function () {
          counter.textContent = String(current + 1);
          counter.classList.remove('is-swapping');
        }, 200);
      }
    }
  }

  /* ---------- scroll → slide ---------- */

  /* 0 while the stage is entering, 1 once it has been scrolled all the way
     through. Pinned: measured against the sticky travel inside the track.
     Fallback: measured against the section crossing the viewport. */
  function progress() {
    var rect = section.getBoundingClientRect();

    if (pinned) {
      var travel = section.offsetHeight - stage.getBoundingClientRect().height;
      if (travel <= 0) return 0;
      return clamp((pinTop - rect.top) / travel);
    }

    var vh = window.innerHeight;
    var span = rect.height + vh * 0.7;
    if (span <= 0) return 0;
    return clamp((vh * 0.85 - rect.top) / span);
  }

  function clamp(value) {
    return Math.max(0, Math.min(0.9999, value));
  }

  function indexFromScroll() {
    var exact = progress() * COUNT;
    var index = Math.floor(exact);
    var into = exact - index;

    if (index > current && into < DEAD_ZONE) return current;
    if (index < current && into > 1 - DEAD_ZONE) return current;
    return index;
  }

  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;

    window.requestAnimationFrame(function () {
      ticking = false;

      if (!pinned && lockedAt !== null) {
        if (Math.abs(window.scrollY - lockedAt) < RELEASE_DISTANCE) return;
        lockedAt = null;
      }

      var rect = section.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;

      show(indexFromScroll());
    });
  }

  /* ---------- click / keyboard ---------- */

  /* Pinned: scrolling is what selects a slide, so a click scrolls to the
     middle of that slide's band and lets the scroll handler do the rest. */
  function select(index) {
    if (!pinned) {
      lockedAt = window.scrollY;
      show(index);
      return;
    }

    var trackTop = window.scrollY + section.getBoundingClientRect().top;
    var travel = section.offsetHeight - stage.getBoundingClientRect().height;
    var target = trackTop - pinTop + travel * ((index + 0.5) / COUNT);

    window.scrollTo({
      top: Math.round(target),
      behavior: reduceMotion.matches ? 'auto' : 'smooth'
    });
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { select(i); });
  });

  strip.addEventListener('keydown', function (event) {
    var delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    var target = null;

    if (delta) target = current + delta;
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = LAST;
    else return;

    event.preventDefault();
    target = Math.max(0, Math.min(LAST, target));
    select(target);
    tabs[target].focus({ preventScroll: true });
  });

  /* ---------- init ---------- */

  panels.forEach(function (panel, i) {
    panel.classList.toggle('is-active', i === 0);
    panel.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
  });

  var resizeTimer;
  function onResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      measure();
      onScroll();
    }, 150);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  if (reduceMotion.addEventListener) {
    reduceMotion.addEventListener('change', onResize);
  }

  measure();
  onScroll();
})();
