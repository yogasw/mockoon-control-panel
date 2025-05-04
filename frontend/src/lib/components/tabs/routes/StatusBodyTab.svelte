<script lang="ts">

  import MonacoEditor from '$lib/components/MonacoEditor.svelte';

  export let responseBody: string;
  export let statusCode: number;
  export let onBodyChange: (val: string) => void;
  export let onStatusCodeChange: (val: number) => void;

  let editorRef: InstanceType<typeof MonacoEditor>;

  // Optional: handle editor change
  function handleEditorChange(event: CustomEvent<string>) {
    onBodyChange(event.detail);
  }

  function formatContent() {
    editorRef?.format?.();
  }
</script>

<div class="h-full flex flex-col space-y-2 w-full">
  <div>
    <label class="text-sm text-white">Status Code:</label>
    <input
      type="number"
      class="bg-gray-700 text-white p-2 rounded w-24 focus:outline-none focus:ring-0 focus:border-none"
      bind:value={statusCode}
      on:input={(e) => onStatusCodeChange(+e.target.value)}
    />
  </div>

  <div class="relative flex-grow w-full">
    <MonacoEditor
      bind:this={editorRef}
      value={responseBody}
      language="json"
      on:change={handleEditorChange}
    />
    <button
      on:click={formatContent}
      class="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded hover:bg-green-700"
    >
      Prettify
    </button>
  </div>
</div>
