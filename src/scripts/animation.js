document.addEventListener("DOMContentLoaded", function () {
  const fixed = document.getElementById("js-header");

  window.addEventListener("scroll", function () {
    if (window.scrollY > 700) {
      fixed.classList.add("is-show");
    } else {
      fixed.classList.remove("is-show");
    }
  });
});


function InView(elTarget) {
  const rootMargin = elTarget.dataset.rootMargin || '0px';

  setTimeout(() => {
    const iObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            elTarget.classList.add('is-active');
            iObserver.unobserve(elTarget);
          }
        });
      },
      { rootMargin: rootMargin }
    );

    iObserver.observe(elTarget);
  }, 500);
}

document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('.js-inview');
  elements.forEach(el => InView(el));
});