(() => {
  const gallery = document.querySelector(".hero-art");
  const photos = gallery.querySelector(".hero-photos");
  const slides = Array.from(photos.querySelectorAll(".hero-slide"));
  if (slides.length < 2) return;

  const controls = gallery.querySelector(".hero-controls");
  const count = gallery.querySelector(".hero-photo-count");
  const play = gallery.querySelector(".hero-photo-play");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const interval = 2000;
  const timing = { duration: 360, easing: "ease-in-out" };
  let current = 0;
  let timer;
  let swipe;
  let autoplay = !reducedMotion.matches;
  let finishTransition;

  function advance(step) {
    finishTransition?.();
    const outgoing = slides[current];
    current = (current + step + slides.length) % slides.length;
    const incoming = slides[current];
    incoming.hidden = false;
    incoming.removeAttribute("aria-hidden");
    count.textContent = `${current + 1} / ${slides.length}`;

    if (reducedMotion.matches) {
      outgoing.hidden = true;
      return;
    }

    outgoing.setAttribute("aria-hidden", "true");
    const direction = step * 100;
    const exit = outgoing.animate(
      [{ transform: "translateX(0)" }, { transform: `translateX(${-direction}%)` }],
      timing,
    );
    const enter = incoming.animate(
      [{ transform: `translateX(${direction}%)` }, { transform: "translateX(0)" }],
      timing,
    );
    finishTransition = () => {
      outgoing.hidden = true;
      enter.onfinish = null;
      exit.cancel();
      enter.cancel();
      finishTransition = undefined;
    };
    enter.onfinish = finishTransition;
  }

  function schedule() {
    clearTimeout(timer);
    if (autoplay && !document.hidden && !swipe) {
      timer = setTimeout(() => {
        advance(1);
        schedule();
      }, interval);
    }
  }

  function setAutoplay(enabled) {
    autoplay = enabled;
    play.textContent = enabled ? "Pause" : "Play";
    play.setAttribute("aria-label", enabled ? "Pause photo slideshow" : "Play photo slideshow");
    schedule();
  }

  controls.querySelectorAll("[data-photo-step]").forEach(button => {
    button.addEventListener("click", () => {
      advance(Number(button.dataset.photoStep));
      schedule();
    });
  });
  play.addEventListener("click", () => setAutoplay(!autoplay));

  photos.addEventListener("pointerdown", event => {
    if (!event.isPrimary || event.button !== 0) return;
    swipe = { id: event.pointerId, x: event.clientX, y: event.clientY };
    photos.setPointerCapture(event.pointerId);
    schedule();
  });
  photos.addEventListener("pointerup", event => {
    if (swipe?.id !== event.pointerId) return;
    const x = event.clientX - swipe.x;
    const y = event.clientY - swipe.y;
    swipe = undefined;
    if (Math.abs(x) >= 40 && Math.abs(x) > Math.abs(y)) {
      advance(x < 0 ? 1 : -1);
    }
    schedule();
  });
  photos.addEventListener("lostpointercapture", event => {
    if (swipe?.id !== event.pointerId) return;
    swipe = undefined;
    schedule();
  });

  document.addEventListener("visibilitychange", schedule);
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) {
      finishTransition?.();
      setAutoplay(false);
    }
  });

  count.textContent = `1 / ${slides.length}`;
  controls.hidden = false;
  setAutoplay(autoplay);
})();
