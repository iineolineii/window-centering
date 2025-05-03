/* keybindingManager.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export const KeybindingManager = class KeybindingManager {
    constructor(extensionSettings) {
        this._extensionSettings = extensionSettings;
        this._keybindings = new Set();
    }

    addKeybinding(name, callback) {
        if (!this._keybindings.has(name)) {
            Main.wm.addKeybinding(
                name,
                this._extensionSettings,
                Meta.KeyBindingFlags.NONE,
                Shell.ActionMode.NORMAL,
                callback
            );

            this._keybindings.add(name);
        }
    }

    removeKeybinding(name) {
        if (this._keybindings.has(name)) {
            Main.wm.removeKeybinding(name);
            this._keybindings.delete(name);
        }
    }

    removeAllKeybindings() {
        this._keybindings.forEach(name => {
            Main.wm.removeKeybinding(name);
        });
        this._keybindings.clear();
    }
}
