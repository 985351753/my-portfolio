// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";

// gsap.registerPlugin(ScrollTrigger);

// document.addEventListener('DOMContentLoaded', () => {
//   // モバイルのアドレスバー問題を解決
//   ScrollTrigger.normalizeScroll(true);

//   const listWrapperEl = document.querySelector('.side-scroll-list-wrapper');
//   const listEl = document.querySelector('.side-scroll-list');

//   gsap.to(listEl, {
//     x: () => -(listEl.clientWidth - listWrapperEl.clientWidth),
//     ease: 'none',
//     scrollTrigger: {
//       trigger: '.side-scroll',
//       start: 'top top',
//       end: () => `+=${listEl.clientWidth - listWrapperEl.clientWidth}`,
//       scrub: true,
//       pin: true,
//       anticipatePin: 1,
//       invalidateOnRefresh: true,
//     },
//   });

  
//   // リサイズ処理の改善（デスクトップのみ）
//   let resizeTimer;
//   window.addEventListener('resize', () => {
//     clearTimeout(resizeTimer);
//     resizeTimer = setTimeout(() => {
//       ScrollTrigger.refresh();
//     }, 250); // デバウンス処理
//   });
// });


import { gsap } from "gsap";
    
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {

const listWrapperEl = document.querySelector('.side-scroll-list-wrapper');

const listEl = document.querySelector('.side-scroll-list');

gsap.to(listEl, {
  x: () => -(listEl.clientWidth - listWrapperEl.clientWidth),
  ease: 'none',
  scrollTrigger: {
    trigger: '.side-scroll',
    start: 'top top',
    end: () => `+=${listEl.clientWidth - listWrapperEl.clientWidth}`,
    scrub: true,
    pin: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
  },
});

// window.addEventListener('resize', () => { // ウィンドウのリサイズ時にScrollTriggerを再計算（ビューポート幅が変わるとアニメーションの計算も変わるため必要）
//     ScrollTrigger.refresh() // ScrollTriggerの値を再計算
//   });
});