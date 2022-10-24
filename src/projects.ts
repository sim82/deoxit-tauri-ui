import { invoke } from "@tauri-apps/api/tauri";
import { Event as TauriEvent, listen } from '@tauri-apps/api/event';
import { open } from '@tauri-apps/api/dialog';
import { homeDir } from '@tauri-apps/api/path';
import type { HubEvent } from './bindings/HubEvent.js';


let projectsListEl: HTMLUListElement | null;
let loadSpinnerEl: HTMLDivElement | null;
let rootDirInputEl: HTMLSpanElement | null;

function size_to_string(size: number): string {
  let k = 1000
  let m = k * k
  let g = m * k

  if (size >= g) {
    return "" + Number(size / g).toPrecision(3) + "GB"
  } else if (size >= m) {
    return "" + Number(size / m).toPrecision(3) + "MB"
  } else if (size >= k) {
    return "" + Number(size / k).toPrecision(3) + "KB"
  } else {
    return "" + size + "B"
  }
}

// --- Bridge Tauri HubEvent events to dom-native hub/pub/sub event
//     (optional, but allows to use hub("Data").sub(..) or
//      @onHub("Data", topic, label) on BaseHTMLElement custom elements)
listen("HubEvent", function (evt: TauriEvent<HubEvent>) {
  const hubEvent = evt.payload;

  if (projectsListEl) {
    let li = document.createElement('li');
    let f = document.createElement('div')
    f.className = "flex-container"
    let path = document.createElement('div');
    path.textContent = hubEvent.path;
    path.className = "dirpath"
    f.append(path);
    let size = document.createElement('div');
    size.textContent = size_to_string(Number(hubEvent.size))
    size.className = "size";
    f.append(size);

    let check = document.createElement('input')
    check.type = "checkbox";
    check.className = "clean_checkbox";
    check.setAttribute("my_dirpath", hubEvent.path);
    f.append(check)


    li.append(f)
    // make whole line clickable to toggle check state
    li.addEventListener('click', async function handleClick(_event) {
      check.checked = !check.checked;
    })
    projectsListEl.insertBefore(li, projectsListEl.childNodes.item(hubEvent.index));
  }
})

window.addEventListener("DOMContentLoaded", () => {
  projectsListEl = document.querySelector("#projects-list");
  loadSpinnerEl = document.querySelector("#load-spinner");
  rootDirInputEl = document.querySelector("#root-dir-label");
  homeDir().then(dir => {
    if (rootDirInputEl) {
      rootDirInputEl.textContent = dir
    }
  })
});

// async function cargo_clean(path: string) {
//   const yes = await ask('Call cargo clean in ' + path + '?', 'cargo clean');
// }

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

async function choose_root_path() {

  // Open a selection dialog for directories
  const selected = await open({
    directory: true,
    multiple: false,
    defaultPath: await homeDir(),
  });
  if (selected && !Array.isArray(selected)) {
    if (rootDirInputEl) {
      rootDirInputEl.textContent = selected
    }
  } else {
  }

}

async function cargo_clean() {
  if (projectsListEl && rootDirInputEl) {

    document.querySelectorAll(".clean_checkbox").forEach(node => {
      if ((node as HTMLInputElement).checked) {
        let path = node.getAttribute("my_dirpath")
        invoke("clean_directory", { path: path })
      }
    })

  }
}

window.update_root_path = update_root_path;
window.choose_root_path = choose_root_path;
window.cargo_clean = cargo_clean;
