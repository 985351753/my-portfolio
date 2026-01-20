// @ts-check
import { SplitText } from "./SplitText";

document.addEventListener("DOMContentLoaded", () => {
  new SplitText(".js-s-block", {
    target: ".js-s-text",
    transition: [400],
  });
});