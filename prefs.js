import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class WindowCenteringExtensionPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage();
        window.add(page);

        const mainGroup = new Adw.PreferencesGroup();
        page.add(mainGroup);

        this._addSwitch(mainGroup, settings, {
            title: _("Change Position"),
            description: _("When using the specified key combination, the window will be centered on the screen."),
            settingKey: 'change-position'
        });

        this._addSwitch(mainGroup, settings, {
            title: _("Change Size"),
            description: _("When using the specified key combination, the size of the window will be adjusted."),
            settingKey: 'change-size'
        });

        this._addSwitch(mainGroup, settings, {
            title: _("Allow Forced Resize"),
            description: _("Allows forced resizing of the window, even if it is in a maximized state."),
            settingKey: 'allow-forced-resize'
        });

        this._addNumericInput(mainGroup, settings, {
            title: _("Percentage Width"),
            description: _("Defines the portion of the total screen width that the window will occupy."),
            settingKey: 'frame-width',
            range: { lower: 1, upper: 100 }
        });

        this._addNumericInput(mainGroup, settings, {
            title: _("Percentage Height"),
            description: _("Defines the portion of the total screen height that the window will occupy."),
            settingKey: 'frame-height',
            range: { lower: 1, upper: 100 }
        });

        this._addKeybindingEntry(mainGroup, settings, {
            title: _("Shortcut"),
            description: _("Specify the key combination to perform the above actions."),
            settingKey: 'centering-keybinding'
        });
    }

    _addSwitch(group, settings, { title, description, settingKey }) {
        const row = new Adw.ActionRow({ 
            title,
            subtitle: description
        });
        const switchWidget = new Gtk.Switch({
            active: settings.get_boolean(settingKey),
            valign: Gtk.Align.CENTER
        });

        switchWidget.connect('notify::active', (widget) => {
            settings.set_boolean(settingKey, widget.active);
        });

        row.add_suffix(switchWidget);
        row.activatable_widget = switchWidget;
        group.add(row);
    }

    _addNumericInput(group, settings, { title, description, settingKey, range }) {
        const row = new Adw.ActionRow({ 
            title,
            subtitle: description
        });

        const spinButton = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({
                lower: range.lower,
                upper: range.upper,
                step_increment: 1,
                value: settings.get_int(settingKey)
            }),
            numeric: true,
            valign: Gtk.Align.CENTER,
            width_chars: 4
        });

        spinButton.connect('value-changed', (widget) => {
            settings.set_int(settingKey, widget.get_value());
        });

        row.add_suffix(spinButton);
        group.add(row);
    }

    _addKeybindingEntry(group, settings, { title, description, settingKey }) {
        const row = new Adw.ActionRow({ 
            title,
            subtitle: description
        });
        const storedKeybinding = settings.get_strv(settingKey)[0] || '';
        const displayKeybinding = this._formatToDisplayFormat(storedKeybinding);

        const keybindingEntry = new Gtk.Entry({
            text: displayKeybinding,
            valign: Gtk.Align.CENTER,
        });

        keybindingEntry.connect('changed', (entry) => {
            const text = entry.get_text();
            if (this._isValidKeybinding(text)) {
                const formattedKeys = this._formatToStoredFormat(text);
                settings.set_strv(settingKey, [formattedKeys]);
            }
        });

        row.add_suffix(keybindingEntry);
        group.add(row);
    }

    _formatToStoredFormat(text) {
        return text.split('+')
            .map(key => key.trim())
            .map(key => key.length === 1 ? key : `<${key}>`)
            .join('');
    }

    _formatToDisplayFormat(text) {
        return text.replace(/<([^>]+)>/g, '$1').replace(/([A-Za-z])([A-Z])/g, '$1+$2');
    }

    _isValidKeybinding(text) {
        const keys = text.split('+').map(key => key.trim());
        const modifierKeys = keys.slice(0, -1);
        const lastKey = keys[keys.length - 1];
        return modifierKeys.length === 2 && /^[A-Za-z]$/.test(lastKey);
    }
}

