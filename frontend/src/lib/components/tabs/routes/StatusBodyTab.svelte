<script lang="ts">
  export let responseBody: string;
  export let statusCode: number;
  export let onBodyChange: (val: string) => void;
  export let onStatusCodeChange: (val: number) => void;
</script>

<div class="h-full flex flex-col">
  <div class="mb-2">
    <label>Status Code:</label>
    <input
      type="number"
      class="bg-gray-700 text-white p-2 rounded w-24"
      bind:value={statusCode}
      on:input={(e) => onStatusCodeChange(+e.target.value)}
    />
  </div>
  <textarea
    class="w-full h-full bg-gray-700 text-white py-2 px-4 rounded flex-grow resize-none"
    bind:value={responseBody}
    on:input={(e) => onBodyChange(e.target.value)}
  ></textarea>
</div> 