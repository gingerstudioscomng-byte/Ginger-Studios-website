'use strict';

(() => {
  const stage = document.getElementById('ginger-motion');
  if (!stage) return;

  const button = stage.querySelector('.toggle');
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const params = new URLSearchParams(location.search);
  const duration = 8260;
  const endStart = 6060;
  const enter = 'cubic-bezier(.16,1,.3,1)';
  const exit = 'cubic-bezier(.6,0,.83,.48)';
  const spring = 'cubic-bezier(.19,.83,.3,1.18)';
  const tracks = [];
  const find = selector => stage.querySelector(selector);
  const all = selector => Array.from(stage.querySelectorAll(selector));

  stage.classList.toggle('clean', params.has('clean'));

  if (!Element.prototype.animate) {
    stage.classList.add('static');
    return;
  }

  function track(element, frames) {
    const keyframes = frames.map(([time, values]) => ({ offset: time / duration, ...values }));
    const animation = element.animate(keyframes, { duration, fill: 'both' });
    animation.pause();
    animation.currentTime = 0;
    tracks.push(animation);
    return animation;
  }

  function windowTrack(selector, start, finish) {
    track(find(selector), [
      [0, { opacity: 0 }],
      [start, { opacity: 0, easing: enter }],
      [start + 240, { opacity: 1 }],
      [finish - 175, { opacity: 1, easing: exit }],
      [finish, { opacity: 0 }],
      [duration, { opacity: 0 }]
    ]);
  }

  function titleHit(selector, start, from, over, settled) {
    track(find(selector), [
      [0, { opacity: 0, transform: from }],
      [start, { opacity: 0, transform: from, easing: enter }],
      [start + 160, { opacity: 1, transform: over, easing: spring }],
      [start + 365, { opacity: 1, transform: settled }],
      [duration, { opacity: 1, transform: settled }]
    ]);
  }

  titleHit('.lead', 35, 'translateY(35%)', 'translateY(-4%)', 'translateY(0)');
  titleHit('.impact', 350, 'translateY(20%) scale(.68,.76)', 'translateY(-1%) scale(1.057,.97)', 'translateY(0) scale(1)');
  titleHit('.accent', 810, 'translateY(48%) rotate(7deg) scale(.86)', 'translateY(-3%) rotate(-5deg) scale(1.06)', 'translateY(0) rotate(-3deg) scale(1)');

  track(find('.intro'), [
    [0, { opacity: 1, transform: 'translateY(0) scale(1)' }],
    [2220, { opacity: 1, transform: 'translateY(0) scale(1)', easing: exit }],
    [2530, { opacity: 0, transform: 'translateY(-12%) scale(1.08)' }],
    [duration, { opacity: 0, transform: 'translateY(-12%) scale(1.08)' }]
  ]);

  windowTrack('.logos', 2260, 6220);

  all('.logo-item').forEach((item, index) => {
    const start = 2260 + index * 740;
    const tilt = index % 2 ? -1 : 1;
    const offRight = 'translate3d(68%,3%,0) scale(.65)';
    const center = 'translate3d(0,0,0) scale(1)';
    const offLeft = 'translate3d(-68%,-3%,0) scale(.69)';

    track(item, [
      [0, { opacity: 0, transform: offRight }],
      [start, { opacity: 0, transform: offRight, easing: enter }],
      [start + 260, { opacity: 1, transform: center }],
      [start + 610, { opacity: 1, transform: center, easing: exit }],
      [start + 880, { opacity: 0, transform: offLeft }],
      [duration, { opacity: 0, transform: offLeft }]
    ]);

    track(item.firstElementChild, [
      [0, { transform: 'rotate(17deg) scale(.91)' }],
      [start, { transform: 'rotate(17deg) scale(.91)', easing: enter }],
      [start + 235, { transform: 'rotate(-2deg) scale(.96)', easing: spring }],
      [start + 305, { transform: 'translateY(-2%) rotate(' + (-7 * tilt) + 'deg) scale(1.13)', easing: enter }],
      [start + 390, { transform: 'translateY(1%) rotate(' + (4 * tilt) + 'deg) scale(.992)', easing: enter }],
      [start + 475, { transform: 'rotate(' + (-2 * tilt) + 'deg) scale(1.02)', easing: enter }],
      [start + 610, { transform: 'rotate(0) scale(1)', easing: exit }],
      [start + 880, { transform: 'rotate(-14deg) scale(.93)' }],
      [duration, { transform: 'rotate(-14deg) scale(.93)' }]
    ]);
  });

  track(find('.end'), [
    [0, { opacity: 0 }],
    [endStart, { opacity: 0, easing: enter }],
    [endStart + 340, { opacity: 1 }],
    [duration, { opacity: 1 }]
  ]);

  titleHit('.course-name', endStart + 80, 'translateY(48%)', 'translateY(-3%)', 'translateY(0)');
  titleHit('.end-word', endStart + 170, 'translateY(37%) scale(.87)', 'translateY(-1%) scale(1.045)', 'translateY(0) scale(1)');

  const clock = track(find('.progress span'), [
    [0, { transform: 'scaleX(0)' }],
    [duration, { transform: 'scaleX(1)' }]
  ]);

  const endScene = find('.end');
  let visible = !('IntersectionObserver' in window);
  let wantsPlayback = !motionPreference.matches && !params.has('still');
  let ready = false;
  let endTimer;

  function updateButton(mode) {
    button.dataset.mode = mode;
    button.setAttribute(
      'aria-label',
      { pause: 'Pause animation', play: 'Play animation', replay: 'Replay animation' }[mode]
    );
  }

  function syncScenes() {
    const time = Number(clock.currentTime);
    const isEnd = time >= endStart + 550;
    endScene.inert = !isEnd;
    endScene.setAttribute('aria-hidden', String(!isEnd));
  }

  function seek(time) {
    tracks.forEach(animation => {
      animation.pause();
      animation.currentTime = time;
    });
    syncScenes();
  }

  function syncPlayback() {
    clearTimeout(endTimer);
    const time = Number(clock.currentTime);
    const play = wantsPlayback && visible && ready && !document.hidden && time < duration;
    if (play) {
      tracks.forEach(animation => animation.play());
      if (time < endStart + 550) {
        endTimer = setTimeout(syncScenes, endStart + 600 - time);
      }
    } else {
      tracks.forEach(animation => animation.pause());
    }
    updateButton(time >= duration ? 'replay' : play ? 'pause' : 'play');
    syncScenes();
  }

  clock.onfinish = () => {
    wantsPlayback = false;
    updateButton('replay');
    syncScenes();
  };

  button.addEventListener('click', () => {
    if (clock.currentTime >= duration || (motionPreference.matches && clock.currentTime === 1370)) {
      seek(0);
    }
    wantsPlayback = !wantsPlayback;
    syncPlayback();
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    }, { threshold: 0.15 }).observe(stage);
  }

  document.addEventListener('visibilitychange', syncPlayback);

  motionPreference.addEventListener?.('change', event => {
    if (event.matches) {
      wantsPlayback = false;
      seek(1370);
    }
    syncPlayback();
  });

  // Start playing as soon as the backdrop & wordmark decode while pre-decoding the 5 tool logos
  // in parallel during the 2.26s intro window so desktop, tablet, and mobile render immediately.
  const still = params.has('still') ? Number(params.get('still')) : 1370;
  seek(Number.isFinite(still) ? Math.max(0, Math.min(still, duration)) : 1370);

  const heroImages = [find('.backdrop'), find('.wordmark')].filter(Boolean);
  const logoImages = all('.logo-img');

  logoImages.forEach(img => {
    if (img.decode) img.decode().catch(() => {});
  });

  Promise.allSettled(heroImages.map(img => (img.decode ? img.decode() : Promise.resolve()))).then(() => {
    ready = true;
    if (wantsPlayback) seek(0);
    syncPlayback();
  });
})();
