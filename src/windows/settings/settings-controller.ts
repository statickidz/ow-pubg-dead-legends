import {HotkeysService} from "../../scripts/services/hotkeys-service";
import {SettingsView} from "./settings-view";

export class SettingsController {
  private static settingsView: SettingsView;

  private constructor() {
  }

  static async run() {
    if (!SettingsController.settingsView) {
      SettingsController.settingsView = new SettingsView();
    }
  }
}

