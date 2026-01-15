import { observe } from "./observer";
import { copyToClipboard, getGhqCommand, isRepositoryPage } from "./clipboard";

const GHQ_TAB_ATTR = "data-ghq-tab";
const GHQ_CONTENT_ATTR = "data-ghq-content";

const SELECTORS = {
  tabList: ".prc-components-UnderlineItemList-xKlKC",
  codePopover: ".react-overview-code-button-action-list",
  contentWrapper: ".react-overview-code-button-action-list div.m-3",
};

const COPY_ICON_SVG = `
  <svg class="octicon octicon-copy" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
    <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
    <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
  </svg>
`;

const CHECK_ICON_SVG = `
  <svg class="octicon octicon-check color-fg-success" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
    <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path>
  </svg>
`;

function createGhqTabElement(): HTMLLIElement {
  const tabItem = document.createElement("li");
  tabItem.className = "prc-UnderlineNav-UnderlineNavItem-syRjR";

  const tabLink = document.createElement("a");
  tabLink.href = "#";
  tabLink.setAttribute("aria-label", "Clone with ghq");
  tabLink.className = "prc-components-UnderlineItem-7fP-n";
  tabLink.setAttribute(GHQ_TAB_ATTR, "true");

  const tabText = document.createElement("span");
  tabText.setAttribute("data-component", "text");
  tabText.setAttribute("data-content", "ghq");
  tabText.textContent = "ghq";

  tabLink.appendChild(tabText);
  tabItem.appendChild(tabLink);

  return tabItem;
}

function createGhqCommandInput(command: string): HTMLInputElement {
  const commandInput = document.createElement("input");
  commandInput.type = "text";
  commandInput.className =
    "form-control input-monospace input-sm color-bg-subtle";
  commandInput.readOnly = true;
  commandInput.value = command;
  commandInput.setAttribute("data-autoselect", "true");
  commandInput.setAttribute("style", "flex-grow: 1;");
  return commandInput;
}

function createCopyButton(command: string): HTMLButtonElement {
  const copyButton = document.createElement("button");
  copyButton.type = "button";
  copyButton.className =
    "prc-Button-ButtonBase-9n-Xk ml-1 prc-Button-IconButton-fyge7";
  copyButton.setAttribute("data-size", "medium");
  copyButton.setAttribute("data-variant", "invisible");
  copyButton.setAttribute("aria-label", "Copy ghq command");
  copyButton.innerHTML = COPY_ICON_SVG;

  copyButton.addEventListener("click", async () => {
    const success = await copyToClipboard(command);
    if (success) {
      showCopiedFeedback(copyButton);
    }
  });

  return copyButton;
}

function showCopiedFeedback(button: HTMLButtonElement): void {
  const originalHtml = button.innerHTML;
  button.innerHTML = CHECK_ICON_SVG;

  setTimeout(() => {
    button.innerHTML = originalHtml;
  }, 2000);
}

function createGhqContentPanel(): HTMLDivElement {
  const container = document.createElement("div");
  container.setAttribute(GHQ_CONTENT_ATTR, "true");
  container.className = "ghq-content-panel ghq-hidden";

  const command = getGhqCommand();

  const inputWrapper = document.createElement("div");
  inputWrapper.className = "d-flex mt-2";

  const commandInput = createGhqCommandInput(command);
  const copyButton = createCopyButton(command);

  inputWrapper.appendChild(commandInput);
  inputWrapper.appendChild(copyButton);

  const description = document.createElement("p");
  description.className = "color-fg-muted text-small mt-1 mb-0";
  description.textContent = "Clone using ghq.";

  container.appendChild(inputWrapper);
  container.appendChild(description);

  return container;
}

function findOriginalContentElements(contentWrapper: Element): Element[] {
  const elements: Element[] = [];
  const navElement = contentWrapper.querySelector('nav[aria-label="Remote URL selector"]');
  
  if (navElement) {
    let sibling = navElement.nextElementSibling;
    while (sibling) {
      if (!sibling.hasAttribute(GHQ_CONTENT_ATTR)) {
        elements.push(sibling);
      }
      sibling = sibling.nextElementSibling;
    }
  }
  
  return elements;
}

function activateGhqTab(
  tabList: Element,
  ghqLink: HTMLAnchorElement,
  ghqContent: HTMLDivElement,
  originalContent: Element[]
): void {
  tabList.querySelectorAll("a").forEach((tab) => {
    tab.removeAttribute("aria-current");
  });
  ghqLink.setAttribute("aria-current", "page");
  
  originalContent.forEach((el) => {
    (el as HTMLElement).classList.add("ghq-hidden");
  });
  ghqContent.classList.remove("ghq-hidden");
}

function deactivateGhqTab(
  ghqLink: HTMLAnchorElement,
  ghqContent: HTMLDivElement,
  originalContent: Element[]
): void {
  ghqLink.removeAttribute("aria-current");
  
  ghqContent.classList.add("ghq-hidden");
  originalContent.forEach((el) => {
    (el as HTMLElement).classList.remove("ghq-hidden");
  });
}

function setupTabSwitching(
  tabList: Element,
  ghqTab: HTMLLIElement,
  ghqContent: HTMLDivElement,
  contentWrapper: Element
): void {
  const ghqLink = ghqTab.querySelector("a") as HTMLAnchorElement;
  const originalContent = findOriginalContentElements(contentWrapper);

  ghqLink.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    activateGhqTab(tabList, ghqLink, ghqContent, originalContent);
  });

  tabList.querySelectorAll("a:not([data-ghq-tab])").forEach((tab) => {
    tab.addEventListener("click", () => {
      deactivateGhqTab(ghqLink, ghqContent, originalContent);
    });
  });
}

function injectGhqTab(popover: Element): void {
  const isAlreadyInjected = popover.querySelector(`[${GHQ_TAB_ATTR}]`);
  if (isAlreadyInjected) return;

  if (!isRepositoryPage()) return;

  const tabList = popover.querySelector(SELECTORS.tabList);
  if (!tabList) return;

  const contentWrapper = popover.querySelector(SELECTORS.contentWrapper);
  if (!contentWrapper) return;

  const ghqTab = createGhqTabElement();
  tabList.appendChild(ghqTab);

  const ghqContent = createGhqContentPanel();
  const navElement = contentWrapper.querySelector('nav[aria-label="Remote URL selector"]');
  if (navElement) {
    navElement.insertAdjacentElement("afterend", ghqContent);
  } else {
    contentWrapper.appendChild(ghqContent);
  }

  setupTabSwitching(tabList, ghqTab, ghqContent, contentWrapper);
}

export function initGhqTab(): void {
  observe(SELECTORS.codePopover, injectGhqTab);
}
