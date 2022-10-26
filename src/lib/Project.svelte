<script lang="ts">
    export let path: string;
    export let size: number;
    export let checked: boolean;

    function size_to_string(size: number): string {
        let k = 1000;
        let m = k * k;
        let g = m * k;

        if (size >= g) {
            return "" + Number(size / g).toPrecision(3) + "GB";
        } else if (size >= m) {
            return "" + Number(size / m).toPrecision(3) + "MB";
        } else if (size >= k) {
            return "" + Number(size / k).toPrecision(3) + "KB";
        } else {
            return "" + size + "B";
        }
    }

    function toggle() {
        checked = !checked;
    }
</script>

<li>
    <div class="flex-container">
        <label class="path" for="cb-{path}">{path}</label>
        <label class="size" for="cb-{path}">{size_to_string(size)}</label>
        <input type="checkbox" class="checkbox" id="cb-{path}" bind:checked />
    </div>
</li>

<style>
    .path {
        text-align: left;
        flex-grow: 1;
        overflow-x: auto;
        padding: 12px 16px 12px 16px;
        flex-grow: 1;
        /* width: px; */
    }

    .size {
        text-align: right;
        right: 0;
        top: 0;
        padding: 12px 16px 12px 16px;
    }
    .checkbox {
        margin: 12px 16px 12px 16px;
    }
    .flex-container {
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
        outline-style: auto;
        margin-top: 4px;
        /* background-color: DodgerBlue; */
    }
</style>
