const stalker = document.getElementById("stalker");
document.addEventListener("mousemove", (e) => {
  stalker.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
});

const links = document.querySelectorAll("a, button");
links.forEach((link) => {
  link.addEventListener("mouseenter", () => {
    stalker.classList.add("hover");
  });
  link.addEventListener("mouseleave", () => {
    stalker.classList.remove("hover");
  });
});