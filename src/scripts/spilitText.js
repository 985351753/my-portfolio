import { gsap } from "gsap";
    
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

const split = SplitText.create(".js-split", { type: "chars" });

gsap.from(split.chars,  {
    y: 100,
    autoAlpha: 0,
    stagger: 0.05
  });