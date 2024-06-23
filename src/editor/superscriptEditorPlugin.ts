import { DecorationSet, EditorView, PluginSpec, PluginValue, ViewPlugin, ViewUpdate } from '@codemirror/view';

class SuperscriptEditorPlugin implements PluginValue {
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

const pluginSpec: PluginSpec<SuperscriptEditorPlugin> = {
    decorations: (value: SuperscriptEditorPlugin) => value.decorations,
};

export const superscriptEditorPlugin = ViewPlugin.fromClass(SuperscriptEditorPlugin, pluginSpec);
