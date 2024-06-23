import { Prec } from '@codemirror/state';
import { Plugin } from 'obsidian';
import { superscriptEditorPlugin } from './editor/superscriptEditorPlugin';

export default class SuperscriptPlugin extends Plugin {
	async onload() {
		this.registerEditorExtension(Prec.lowest(superscriptEditorPlugin));
	}

	onunload() {

	}
}
