/* frameManager.js
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

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export const FrameManager = class FrameManager {
    constructor(extensionSettings) {
        this._extensionSettings = extensionSettings;
    }

    adjustFrame() {
        const activeFrame = global.display.focus_window;
        if (!activeFrame) return;

        const { x, y, width, height } = activeFrame.get_frame_rect();

        const screenResolution = this._getScreenResolution();
        const targetFrameResolution = this._calculateTargetFrameResolution(
            screenResolution.width,
            screenResolution.height,
            this._extensionSettings.get_int('frame-width'),
            this._extensionSettings.get_int('frame-height')
        );

        const frameCenterPosition = this._calculateCenterPositionScreen(
            targetFrameResolution.width,
            targetFrameResolution.height,
            screenResolution.width,
            screenResolution.height
        );

        const allowForcedResize = this._extensionSettings.get_boolean('allow-forced-resize');
        if (allowForcedResize && (activeFrame.maximized_horizontally || activeFrame.maximized_vertically)) {
            activeFrame.unmaximize(Meta.MaximizeFlags.HORIZONTAL | Meta.MaximizeFlags.VERTICAL);
        }

        const changePositionSetting = this._extensionSettings.get_boolean('change-position');
        const changeSizeSetting = this._extensionSettings.get_boolean('change-size');

        const newX = changePositionSetting ? frameCenterPosition.centerX : x;
        const newY = changePositionSetting ? frameCenterPosition.centerY : y;
        const newWidth = changeSizeSetting ? targetFrameResolution.width : width;
        const newHeight = changeSizeSetting ? targetFrameResolution.height : height;

        activeFrame.move_resize_frame(true, newX, (newY + (Main.panel.actor.height >> 1)), newWidth, newHeight);
    }

    _getScreenResolution() {
        const primaryMonitor = Main.layoutManager.primaryMonitor;
        return { width: primaryMonitor.width, height: primaryMonitor.height };
    }

    _calculateCenterPositionScreen(frameWidth, frameHeight, screenWidth, screenHeight) {
        return { centerX: (screenWidth - frameWidth) >> 1, centerY: (screenHeight - frameHeight) >> 1 };
    }

    _calculateTargetFrameResolution(screenWidth, screenHeight, widthPercentage, heightPercentage) {
        return {
            width: Math.round(screenWidth * (widthPercentage * 0.01)),
            height: Math.round(screenHeight * (heightPercentage * 0.01))
        };
    }
}