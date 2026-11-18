(() => {
  const slideshows = document.querySelectorAll('[data-photo-slideshow]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const states = new Map();
  const delay = 5500;

  function schedule(state) {
    clearTimeout(state.timer);
    if (state.visible && !state.loading && !document.hidden && !reducedMotion.matches) {
      state.timer = setTimeout(() => advance(state), delay);
    }
  }

  async function advance(state) {
    state.loading = true;
    const nextIndex = (state.index + 1) % state.sources.length;
    const next = new Image();
    next.alt = '';
    next.className = 'photo-slide photo-slide-incoming';
    next.src = state.sources[nextIndex];
    try {
      await next.decode();
      if (state.visible && !document.hidden && !reducedMotion.matches) {
        state.container.append(next);
        await next.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 1000,
          easing: 'ease-in-out',
          fill: 'forwards',
        }).finished;
        state.image.remove();
        next.classList.remove('photo-slide-incoming');
        next.style.opacity = '';
        state.image = next;
        state.index = nextIndex;
      }
    } catch {
      next.remove();
      state.index = nextIndex;
    } finally {
      state.loading = false;
      schedule(state);
    }
  }

  const observer =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              const state = states.get(entry.target);
              state.visible = entry.isIntersecting;
              schedule(state);
            }
          },
          { threshold: 0.25 },
        )
      : null;
  for (const container of slideshows) {
    const image = container.querySelector('img');
    image.classList.add('photo-slide');
    const state = {
      container,
      image,
      sources: [image.getAttribute('src'), ...container.dataset.photoSlideshow.split(' ')],
      index: 0,
      visible: !observer,
    };
    states.set(container, state);
    observer?.observe(container);
    schedule(state);
  }
  document.addEventListener('visibilitychange', () => {
    for (const state of states.values()) schedule(state);
  });
  reducedMotion.addEventListener('change', () => {
    for (const state of states.values()) schedule(state);
  });
})();
