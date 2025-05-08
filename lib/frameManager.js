import Meta from 'gi://Meta';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export class FrameManager {
    constructor(settings) {
        this.settings = settings;
    }

    adjustFrame() {
        const window = global.display.focus_window;
        if (!window) return;

        const {x, y, width, height} = window.get_frame_rect();
        const screen = this._getScreenSize();
        const targetSize = this._calcTargetSize(screen);
        const centerPos = this._calcCenterPos(targetSize, screen);

        const forceResize = this.settings.get_boolean('allow-forced-resize');
        if (forceResize && (window.maximized_horizontally || window.maximized_vertically)) {
            window.unmaximize(Meta.MaximizeFlags.BOTH);
        }

        const shouldMove = this.settings.get_boolean('change-position');
        const shouldResize = this.settings.get_boolean('change-size');
        const panelHeight = Main.panel.actor.height >> 1;

        if (shouldMove) {
            window.move_resize_frame(
                true, 
                centerPos.centerX, 
                centerPos.centerY + panelHeight,
                shouldResize ? width : targetSize.width,
                shouldResize ? height : targetSize.height
            );
        }

        if (shouldResize) {
            window.move_resize_frame(
                true,
                shouldMove ? centerPos.centerX : x,
                shouldMove ? centerPos.centerY + panelHeight : y,
                targetSize.width,
                targetSize.height
            );
        }
    }

    _getScreenSize() {
        const monitor = Main.layoutManager.primaryMonitor;
        return {width: monitor.width, height: monitor.height};
    }

    _calcCenterPos(frame, screen) {
        return {
            centerX: (screen.width - frame.width) >> 1,
            centerY: (screen.height - frame.height) >> 1
        };
    }

    _calcTargetSize(screen) {
        return {
            width: Math.round(screen.width * (this.settings.get_int('frame-width') * 0.01)),
            height: Math.round(screen.height * (this.settings.get_int('frame-height') * 0.01))
        };
    }
}