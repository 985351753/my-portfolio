// import { gsap } from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';

// gsap.registerPlugin(ScrollTrigger);

// document.addEventListener('DOMContentLoaded', () => {
//   const container = document.querySelector('.side-scroll-list');
//   const wrapper = document.querySelector('.side-scroll-container');
//   const panels = gsap.utils.toArray('.side-scroll-item');

//   // 必要な要素が存在しない場合は処理を中断
//   if (!container || !wrapper || panels.length === 0) return;

//   const totalWidth = container.scrollWidth;
//   const listWrapperEl = document.querySelector('.side-scroll-list-wrapper');

//   gsap.to(container, {
//     x: () => -(totalWidth - listWrapperEl.clientWidth),
//     ease: 'none',
//     scrollTrigger: {
//       trigger: wrapper,
//       start: 'top top',
//       end: () => `+=${totalWidth - listWrapperEl.clientWidth}`,
//       scrub: 1,
//       pin: true,
//       anticipatePin: 1,
//       invalidateOnRefresh: true
//     }
//   });

//   window.addEventListener('resize', () => {
//     ScrollTrigger.refresh();
//   });
// });


import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  ScrollTrigger.normalizeScroll(true);

  const container = document.querySelector('.side-scroll-list');
  const wrapper = document.querySelector('.side-scroll-container');
  const listWrapperEl = document.querySelector('.side-scroll-list-wrapper');
  const panels = gsap.utils.toArray('.side-scroll-item');

  if (!container || !wrapper || !listWrapperEl || panels.length === 0) return;

  const getScrollLength = () => {
    const listWidth = container.getBoundingClientRect().width;
    const wrapperWidth = listWrapperEl.getBoundingClientRect().width;
    return listWidth - wrapperWidth;
  };
  const isAndroid = /Android/i.test(navigator.userAgent);

  const getEndValue = () => {
    const base = getScrollLength();
    const isSP = window.innerWidth < 768;
    return base * (isSP ? 1.3 : 1);
  };

  let horizontalTween;

  function createHorizontalScroll() {
    horizontalTween = gsap.to(container, {
      x: () => -getScrollLength(),
      ease: 'none',
      scrollTrigger: {
        trigger: wrapper,
        start: 'top top',
        end: () => `+=${getEndValue()}`,
        scrub: 1,
        pin: !isAndroid,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      }
    });
  }

  // load後に生成（画像・フォント対策）
  window.addEventListener('load', () => {
    createHorizontalScroll();
    ScrollTrigger.refresh();
  });

  // resize時は kill → recreate
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (horizontalTween) {
        horizontalTween.scrollTrigger.kill();
        horizontalTween.kill();
      }
      createHorizontalScroll();
      ScrollTrigger.refresh();
    }, 300);
  });
});
