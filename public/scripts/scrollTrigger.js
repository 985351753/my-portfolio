import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  const listWrapperEl = document.querySelector('.side-scroll-list-wrapper');
  const listEl = document.querySelector('.side-scroll-list');

  if (!listWrapperEl || !listEl) {
    console.error('Required elements not found');
    return;
  }

  // 横スクロールアニメーション
  gsap.to(listEl, {
    x: () => -(listEl.scrollWidth - listWrapperEl.clientWidth),
    ease: 'none',
    scrollTrigger: {
      trigger: '.side-scroll',
      start: 'top top',
      end: () => `+=${listEl.scrollWidth - listWrapperEl.clientWidth}`,
      scrub: true,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  // リサイズ時にScrollTriggerを再計算
  window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
  });
});