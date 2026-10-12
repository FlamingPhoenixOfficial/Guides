const views = [...document.querySelectorAll(".view")];
const navLinks = [...document.querySelectorAll(".nav-link")];
const root = document.documentElement;
const checks = [...document.querySelectorAll("[data-check]")];
const progressKey = "workshop-notes-progress";
const textSizeKey = "workshop-notes-text-size";

function showView() {
  const requested = window.location.hash.slice(1);
  const targetView = views.find((view) => view.id === requested)
    ?? document.getElementById(requested)?.closest(".view");
  const activeView = targetView ?? views[0];
  for (const view of views) view.hidden = view !== activeView;
  for (const link of navLinks) {
    if (link.getAttribute("href") === `#${activeView.id}`) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  }
}

let savedProgress = {};
try {
  savedProgress = JSON.parse(localStorage.getItem(progressKey) ?? "{}");
} catch {
  savedProgress = {};
}
for (const input of checks) {
  input.checked = savedProgress[input.dataset.check] === true;
  input.addEventListener("change", () => {
    savedProgress[input.dataset.check] = input.checked;
    try {
      localStorage.setItem(progressKey, JSON.stringify(savedProgress));
    } catch {
      // The checklist still works if the browser blocks local storage.
    }
  });
}

function setTextSize(size) {
  const boundedSize = Math.min(1.25, Math.max(0.9, size));
  root.style.setProperty("--reading-size", `${boundedSize}rem`);
  try {
    localStorage.setItem(textSizeKey, String(boundedSize));
  } catch {
    // The text size still changes for the current visit.
  }
}

setTextSize(Number(localStorage.getItem(textSizeKey)) || 1);
document.querySelector("#smaller-text").addEventListener("click", () => {
  setTextSize(parseFloat(getComputedStyle(root).getPropertyValue("--reading-size")) - 0.1);
});
document.querySelector("#larger-text").addEventListener("click", () => {
  setTextSize(parseFloat(getComputedStyle(root).getPropertyValue("--reading-size")) + 0.1);
});

window.addEventListener("hashchange", showView);
showView();