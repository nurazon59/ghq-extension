async function copyWithExecCommand(text: string): Promise<boolean> {
  const hiddenTextarea = Object.assign(document.createElement("textarea"), {
    value: text,
    className: "ghq-hidden-textarea",
  });
  document.body.appendChild(hiddenTextarea);
  hiddenTextarea.select();
  const success = document.execCommand("copy");
  document.body.removeChild(hiddenTextarea);
  return success;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return copyWithExecCommand(text);
  }
}

export function getGhqCommand(): string {
  const ownerRepoMatch = window.location.pathname.match(/^\/([^/]+\/[^/]+)/);
  if (!ownerRepoMatch) return "";
  return `ghq get ${ownerRepoMatch[1]}`;
}

export function isRepositoryPage(): boolean {
  const pathname = window.location.pathname;
  const isRootRepoPage = /^\/[^/]+\/[^/]+\/?$/.test(pathname);
  const isSubPage =
    /^\/[^/]+\/[^/]+(\/tree|\/blob|\/commits|\/issues|\/pull|\/actions|\/settings)/.test(
      pathname
    );

  return isRootRepoPage || isSubPage;
}
