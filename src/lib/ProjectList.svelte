<script lang="ts">
  import Project from "./Project.svelte";
  import { listen } from "@tauri-apps/api/event";
  import type { Event as TauriEvent } from "@tauri-apps/api/event";
  import type { HubEvent } from "../bindings/HubEvent.js";

  export let projects: any[];

  listen("HubEvent", function (evt: TauriEvent<HubEvent>) {
    const hubEvent = evt.payload;

    let el = {
      path: hubEvent.path,
      size: Number(hubEvent.size),
      checked: false,
    };

    let px = projects;
    px.splice(hubEvent.index, 0, el);
    projects = px;
    console.log(projects);
  });
</script>

<div class="list-outer">
  <ul>
    {#each projects as { path, size, checked }, i}
      <Project {path} {size} bind:checked />
    {/each}
  </ul>
</div>

<style>
  ul {
    margin: 0;
    padding: 0;
    overflow-y: scroll;
    max-height: 600px;
  }

  /* Style the list items */
  /* ul li {
    cursor: pointer;
    position: relative;
    padding: 12px 8px 12px 40px;
    background: #eee;
    font-size: 18px;
    transition: 0.2s;

    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  } */
</style>
