import { DecorationSet, EditorView, PluginSpec, PluginValue, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { buildDecorations } from './buildDecorations';

class SuperscriptPluginValue implements PluginValue {
    decorations: DecorationSet;

    constructor(view: EditorView) {
        this.decorations = buildDecorations(view);
    }

    update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
            this.decorations = buildDecorations(update.view);
        }
    }

    destroy() { }
}

const pluginSpec: PluginSpec<SuperscriptPluginValue> = {
    decorations: (value: SuperscriptPluginValue) => value.decorations,
};

export const superscriptViewPlugin = ViewPlugin.fromClass(SuperscriptPluginValue, pluginSpec);
