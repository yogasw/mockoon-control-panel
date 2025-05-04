<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import type * as monacoType from 'monaco-editor';

	export let value: string = '{}';
	export let language: string = 'json';
	export let theme: string = 'vs-dark';

	let container: HTMLDivElement;
	let editor: monacoType.editor.IStandaloneCodeEditor | null = null;
	let monaco: typeof monacoType | null = null;

	const dispatch = createEventDispatcher();

	function loadMonaco(callback: (monaco: typeof monacoType) => void) {
		if ((window as any).monaco) return callback((window as any).monaco);

		if (!(window as any).require) {
			const loader = document.createElement('script');
			loader.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.34.1/min/vs/loader.js';
			loader.onload = () => {
				(window as any).require.config({
					paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.34.1/min/vs' }
				});
				(window as any).require(['vs/editor/editor.main'], () => {
					callback((window as any).monaco);
				});
			};
			document.body.appendChild(loader);
		} else {
			(window as any).require(['vs/editor/editor.main'], () => {
				callback((window as any).monaco);
			});
		}
	}

	onMount(() => {
		loadMonaco((m) => {
			monaco = m;
			editor = monaco.editor.create(container, {
				value,
				language,
				theme,
				automaticLayout: true,
			});

			editor.onDidChangeModelContent(() => {
				dispatch('change', editor?.getValue());
			});
		});
	});

	onDestroy(() => {
		editor?.dispose();
		editor = null;
	});

	// Public methods
	export function getValue(): string | undefined {
		return editor?.getValue();
	}

	export function setValue(val: string): void {
		if (editor) editor.setValue(val);
	}

	export function format(): void {
		editor?.getAction('editor.action.formatDocument').run();
	}

	export function setLanguage(lang: string): void {
		if (monaco && editor && editor.getModel()) {
			monaco.editor.setModelLanguage(editor.getModel()!, lang);
		}
	}
</script>

<!-- Container -->
<div bind:this={container} class="w-full h-full"></div>
