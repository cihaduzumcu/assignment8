const requestLine = document.querySelector("#request-line");
const statusElement = document.querySelector("#status");
const bodyElement = document.querySelector("#body");
const buttons = document.querySelectorAll("button[data-url]");

function formatBody(text, contentType) {
  if (contentType.includes("application/json")) {
    try {
      return JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      return text;
    }
  }
  return text;
}

function showStatus(label, kind) {
  statusElement.textContent = label;
  statusElement.className = `status ${kind}`;
}

async function callRoute(method, url) {
  requestLine.textContent = `${method} ${url}`;
  showStatus("Loading...", "pending");
  bodyElement.textContent = "";

  try {
    const response = await fetch(url, { method });
    const text = await response.text();
    const contentType = response.headers.get("Content-Type") ?? "";

    showStatus(`${response.status} ${response.statusText}`, response.ok ? "ok" : "error");
    bodyElement.textContent = formatBody(text, contentType) || "(empty body)";
  } catch (error) {
    showStatus("Network error", "error");
    bodyElement.textContent = `The request could not be sent: ${error.message}`;
  }
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    callRoute(button.dataset.method, button.dataset.url);
  });
});
