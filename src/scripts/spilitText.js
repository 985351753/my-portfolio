import { gsap } from "gsap";
    
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

const split = new SplitText(".js-split", { type: "chars" });

gsap.fromTo(
  split.chars,
  { opacity: 1, y: "110%" },
  { opacity: 1, y: 0, duration: 2, ease: "power3.out", stagger: 0.2 }
);