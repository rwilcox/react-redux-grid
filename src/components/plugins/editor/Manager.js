import React from 'react';
import Inline from './Inline.jsx';
import { CLASS_NAMES } from '../../../constants/GridConstants';
import { elementContains } from '../../../util/elementContains';
import { prefix } from '../../../util/prefix';
import { dismissEditor } from '../../../actions/plugins/editor/EditorActions';

export default class Manager {

    init(plugins, store) {

        const defaults = {
            type: 'inline',
            enabled: false
        };

        const editModes = {
            inline: 'inline'
        };

        const config = plugins && plugins.EDITOR
            ? Object.assign(defaults, plugins.EDITOR) : defaults;

        this.config = config;
        this.editModes = editModes;
        this.store = store;

        if (this.config.type === this.editModes.inline) {
            document.addEventListener('click', this.setDismissEvent.bind(this));
        }

    }

    setDismissEvent(reactEvent) {
        const element = reactEvent.target;

        if (element && elementContains(element, prefix(CLASS_NAMES.EDITED_CELL))) {
            return false;
        }

        else if (element && elementContains(element, prefix(CLASS_NAMES.EDITOR.INLINE.CONTAINER))) {
            return false;
        }

        else if (element && elementContains(element, prefix(CLASS_NAMES.GRID_ACTIONS.MENU.ITEM))) {
            return false;
        }

        else {
            this.store.dispatch(dismissEditor());
        }
    }

    getComponent(plugins, store, events, selectionModel, editor, columns) {

        const editorProps = {
            columns,
            store,
            events
        };

        if (!this.config.enabled) {
            return null;
        }

        else if (this.config.type === this.editModes.inline) {
            return (
                <Inline { ...editorProps} />
            );
        }

        else {
            return null;
        }
    }

}