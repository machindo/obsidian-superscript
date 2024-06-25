import { Prec } from '@codemirror/state';
import { Plugin } from 'obsidian';
import { autonumberHeadings } from './editor/autonumberHeadings';
import { superscriptViewPlugin } from './editor/superscriptViewPlugin';

export default class SuperscriptPlugin extends Plugin {
  async onload() {
    this.registerEditorExtension(Prec.lowest(superscriptViewPlugin));
    this.registerEvent(this.app.workspace.on('editor-change', autonumberHeadings));
  }

  onunload() {

  }
}
