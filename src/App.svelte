<script lang="ts">
  import ProjectList from "./lib/ProjectList.svelte";
  import { invoke } from "@tauri-apps/api/tauri";
  import { open } from "@tauri-apps/api/dialog";
  import { homeDir } from "@tauri-apps/api/path";

  let projects = [];

  let root: string;

  homeDir().then((dir) => (root = dir));

  async function update_root_path() {
    projects = [];
    await invoke("update_root_path", { root: root });
  }
  async function cargo_clean() {
    projects.forEach((p) => {
      if (p.checked) {
        invoke("clean_directory", { path: p.path });
      }
    });
  }

  async function change_root_path() {
    const selected = await open({
      directory: true,
      multiple: false,
      defaultPath: await homeDir(),
    });
    if (selected && !Array.isArray(selected)) {
      root = selected;
    } else {
    }
  }
</script>

<main class="container">
  <h1>DeOxIt</h1>
  <div class="flex-h">
    <button id="root-button" on:click={change_root_path}>Dir</button>
    <label class="root-label" for="root-button">{root}</label>
  </div>
  <button on:click={update_root_path}>Update</button>
  <button on:click={cargo_clean}>Clean</button>
  <div><ProjectList {projects} /></div>
</main>

<style>
  .flex-h {
    display: flex;
    align-items: center;
    flex-direction: row;
  }
  .root-label {
    margin-left: 16px;
  }
  .container {
    display: flex;
  }
</style>
