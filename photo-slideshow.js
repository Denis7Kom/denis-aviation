(() => {
  const slideshows = [...document.querySelectorAll('[data-photo-slideshow]')];
  if (!slideshows.length) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const interval = 5500;
  const states = new Map();

  function schedule(state) {
    clearTimeout(state.timer);
    if (state.playing && state.visible && !state.loading && !document.hidden) {
      state.timer = setTimeout(() => advance(state), interval);
    }
  }

  async function advance(state) {
    state.loading = true;
    const nextIndex = (state.index + 1) % state.sources.length;
    const next = new Image();
    next.src = state.sources[nextIndex];
    try {
      await next.decode();
      if (state.playing && state.visible && !document.hidden) {
        state.image.src = next.src;
        state.index = nextIndex;
        if (!reducedMotion.matches) {
          state.image.animate?.([{ opacity: 0.55 }, { opacity: 1 }], {
            duration: 350,
            easing: 'ease-out',
          });
        }
      }
    } catch {
      // Keep the current photograph available if loading the next one fails.
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

  for (const slideshow of slideshows) {
    const image = slideshow.querySelector('img');
    const button = slideshow.querySelector('button');
    const sources = [image.getAttribute('src'), ...slideshow.dataset.photoSlideshow.split(' ')];
    const state = { image, sources, index: 0, playing: !reducedMotion.matches, visible: !observer };
    const updateButton = () => button.setAttribute('aria-pressed', String(state.playing));
    button.addEventListener('click', () => {
      state.playing = !state.playing;
      updateButton();
      schedule(state);
    });
    reducedMotion.addEventListener('change', (event) => {
      if (!event.matches) return;
      state.playing = false;
      updateButton();
      schedule(state);
    });
    button.hidden = false;
    updateButton();
    states.set(slideshow, state);
    observer?.observe(slideshow);
    schedule(state);
  }
  document.addEventListener('visibilitychange', () => {
    for (const state of states.values()) schedule(state);
  });
})();
