import { initGhqTab } from "./ghq-tab";
import "./styles.css";

function initialize(): void {
  initGhqTab();
}

const GITHUB_SPA_NAVIGATION_EVENTS = ["turbo:render", "turbo:load", "pjax:end"];

function waitForNextFrame(callback: () => void): void {
  requestAnimationFrame(callback);
}

for (const eventName of GITHUB_SPA_NAVIGATION_EVENTS) {
  document.addEventListener(eventName, () => {
    waitForNextFrame(initialize);
  });
}

initialize();
