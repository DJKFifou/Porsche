import { App } from "~/App";

App.mount({
  debug: true,
  canvas: document.querySelector("canvas")!,
}).then(() => {
  document.body.classList.add("loaded");
});

const footerContainer = document.getElementById("footer-container");
const lastSection = document.getElementById("last-section");

function updateFooterHeight() {
  if (!footerContainer || !lastSection) return;
  const lastSectionHeight = lastSection.offsetHeight;

  footerContainer.style.height = `${lastSectionHeight}px`;
  footerContainer.style.marginTop = `-${lastSectionHeight}px`;

  footerContainer.style.setProperty(
    "--before-height",
    `${lastSectionHeight}px`
  );
}

window.addEventListener("load", updateFooterHeight);
window.addEventListener("resize", updateFooterHeight);

const canvas = document.getElementById("canvas");
const lastSectionTitle = document.getElementById("last-section-title");

function checkPosition() {
  const lastSectionRect = lastSection?.getBoundingClientRect();
  if (!canvas || !lastSectionTitle || !lastSectionRect) return;

  const sectionVisibleRatio = 1 - lastSectionRect.top / window.innerHeight;
  lastSectionTitle.style.opacity = sectionVisibleRatio >= 0.85 ? "1" : "0";

  const bottomOfLastSection = lastSectionRect.bottom;
  if (bottomOfLastSection <= window.innerHeight) {
    canvas.style.position = "static";
  } else {
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
  }
}

window.addEventListener("scroll", checkPosition);
window.addEventListener("resize", checkPosition);

checkPosition();
