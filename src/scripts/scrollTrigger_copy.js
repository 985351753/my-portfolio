import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.side-scroll-list');
  const wrapper = document.querySelector('.side-scroll-container');
  const panels = gsap.utils.toArray('.side-scroll-item');

  // 必要な要素が存在しない場合は処理を中断
  if (!container || !wrapper || panels.length === 0) return;

  const totalWidth = container.scrollWidth;
  const listWrapperEl = document.querySelector('.side-scroll-list-wrapper');

  gsap.to(container, {
    x: () => -(totalWidth - listWrapperEl.clientWidth),
    ease: 'none',
    scrollTrigger: {
      trigger: wrapper,
      start: 'top top',
      end: () => `+=${totalWidth - listWrapperEl.clientWidth}`,
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  });

  window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
  });
});
