import { invoke } from "@tauri-apps/api/tauri";
import { Event as TauriEvent, listen } from '@tauri-apps/api/event';
import type { HubEvent } from './bindings/HubEvent.js';


let projectsListEl: HTMLUListElement | null;
let loadSpinnerEl: HTMLDivElement | null;

// --- Bridge Tauri HubEvent events to dom-native hub/pub/sub event
//     (optional, but allows to use hub("Data").sub(..) or
//      @onHub("Data", topic, label) on BaseHTMLElement custom elements)
listen("HubEvent", function (evt: TauriEvent<HubEvent>) {
  const hubEvent = evt.payload;

  if (projectsListEl) {
    let li = document.createElement('li');
    li.textContent = hubEvent.path;
    let size = document.createElement('span');
    size.textContent = "" + (Number(hubEvent.size) / (1024 * 1024 * 1024));
    size.className = "size";
    li.append(size);

    let close = document.createElement('span');
    close.textContent = "x";
    close.className = "close";
    li.append(close)
    projectsListEl.insertBefore(li, projectsListEl.childNodes.item(hubEvent.index));
  }
})

window.addEventListener("DOMContentLoaded", () => {
  projectsListEl = document.querySelector("#projects-list");
  loadSpinnerEl = document.querySelector("#load-spinner");
});

async function update_root_path() {
  if (projectsListEl) {
    projectsListEl.replaceChildren()
  }

  if (loadSpinnerEl) {
    loadSpinnerEl.hidden = false;
  }
  await invoke("update_root_path");

  if (loadSpinnerEl) {
    loadSpinnerEl.hidden = true;
  }
}

window.update_root_path = update_root_path;
