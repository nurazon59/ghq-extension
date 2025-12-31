interface ObserveOptions {
  signal?: AbortSignal;
  root?: Element | Document;
}

function processAddedNodes(
  selector: string,
  callback: (element: Element) => void,
  node: Node
): void {
  if (!(node instanceof Element)) return;

  if (node.matches(selector)) {
    callback(node);
  }
  node.querySelectorAll(selector).forEach(callback);
}

export function observe(
  selector: string,
  callback: (element: Element) => void,
  options: ObserveOptions = {}
): void {
  const { signal, root = document } = options;

  root.querySelectorAll(selector).forEach(callback);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        processAddedNodes(selector, callback, node);
      }
    }
  });

  const targetNode = root === document ? document.body : root;
  observer.observe(targetNode, {
    childList: true,
    subtree: true,
  });

  signal?.addEventListener("abort", () => {
    observer.disconnect();
  });
}

function findMatchingElement(
  selector: string,
  node: Node
): Element | null {
  if (!(node instanceof Element)) return null;
  return node.matches(selector) ? node : node.querySelector(selector);
}

export function waitFor(
  selector: string,
  options: ObserveOptions = {}
): Promise<Element> {
  return new Promise((resolve, reject) => {
    const { signal, root = document } = options;

    const existing = root.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          const match = findMatchingElement(selector, node);
          if (match) {
            observer.disconnect();
            resolve(match);
            return;
          }
        }
      }
    });

    const targetNode = root === document ? document.body : root;
    observer.observe(targetNode, {
      childList: true,
      subtree: true,
    });

    signal?.addEventListener("abort", () => {
      observer.disconnect();
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}
