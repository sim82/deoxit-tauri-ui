import { invoke } from "@tauri-apps/api/tauri";
import { Event as TauriEvent, listen } from '@tauri-apps/api/event';
import type { HubEvent } from './bindings/HubEvent.js';


let greetInputEl: HTMLInputElement | null;
let greetMsgEl: HTMLElement | null;
let doSomethingEl: HTMLElement | null;
let somethingMeterEl: HTMLMeterElement | null;
let busyDialogEl: HTMLDialogElement | null;
let searchResultEl: HTMLElement | null;
let searchEl: HTMLInputElement | null;
let searchResultTableEl: HTMLTableElement | null;
let listEl: HTMLDivElement | null;


// --- Bridge Tauri HubEvent events to dom-native hub/pub/sub event
//     (optional, but allows to use hub("Data").sub(..) or
//      @onHub("Data", topic, label) on BaseHTMLElement custom elements)
listen("HubEvent", function (evt: TauriEvent<HubEvent>) {
  const hubEvent = evt.payload;

  if (listEl) {
    let div = document.createElement('div')
    div.textContent = hubEvent.path + " " + (Number(hubEvent.size) / (1024 * 1024 * 1024));
    listEl.appendChild(div)
  }
})

window.addEventListener("DOMContentLoaded", () => {
  greetInputEl = document.querySelector("#greet-input");
  greetMsgEl = document.querySelector("#greet-msg");
  doSomethingEl = document.querySelector("#something-msg");
  somethingMeterEl = document.querySelector("#something-meter");
  busyDialogEl = document.querySelector("#busy-dialog");
  searchEl = document.querySelector("#search-input");
  searchResultEl = document.querySelector("#search-result-msg");
  searchResultTableEl = document.querySelector("#search-result-table");
  listEl = document.querySelector("#list-outer");
});

async function greet() {
  if (greetMsgEl && greetInputEl && somethingMeterEl) {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    greetMsgEl.textContent = await invoke("greet", {
      name: greetInputEl.value + "blub",
    });
    somethingMeterEl.value = 0
  }
}

async function something() {
  if (doSomethingEl && somethingMeterEl && busyDialogEl) {
    busyDialogEl.open = true
    somethingMeterEl.value = 1
    doSomethingEl.textContent = "something done";

    for (let i = 2; i < 5; i++) {
      doSomethingEl.textContent += await invoke("some_quote");
      somethingMeterEl.value = i
    }
    busyDialogEl.open = false

  }
}

async function update_search(final: boolean) {
  if (searchResultEl && searchEl && searchResultTableEl && listEl) {
    searchResultEl.textContent = searchEl.value
    if (final) {
      searchResultEl.textContent += " done"
    }
    let row = searchResultTableEl.insertRow(-1)
    row.insertCell(-1).textContent = "1"
    row.insertCell(-1).textContent = searchEl.value

    if (searchResultTableEl.rows.length > 8) {
      searchResultTableEl.deleteRow(0)
    }
    let div = document.createElement('div')
    div.textContent = searchEl.value;
    listEl.appendChild(div)
    if (listEl.childElementCount > 8) {
      listEl.removeChild(listEl.children[0])
    }
    listEl.scrollTo(0, 100)
  }
}

async function update_root_path() {
  await invoke("update_root_path");

}

window.greet = greet;
window.something = something;
window.update_search = update_search;
window.update_root_path = update_root_path;
