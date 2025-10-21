import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

import { FrameManager } from './lib/frameManager.js';
import { KeybindingManager } from './lib/keybindingManager.js';

export default class WindowCenteringExtension extends Extension {
    enable() {
        this._settings = this.getSettings();

        this._FrameManager = new FrameManager(this._settings);
        this._KeybindingManager = new KeybindingManager(this._settings);
        this._KeybindingManager.addKeybinding(
            'centering-keybinding',
            this._FrameManager.adjustFrame.bind(this._FrameManager)
        );
    }

    disable() {
        this._settings = null;

        this._KeybindingManager.removeAllKeybindings();
        this._KeybindingManager = null;
        this._FrameManager = null;
    }
}
