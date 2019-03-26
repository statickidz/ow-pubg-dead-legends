import {HotkeysService} from "../../scripts/services/hotkeys-service";
import {NotificationView} from "./notification-view";
import { WindowsService } from "../../scripts/services/windows-service";
import { WindowNames } from "../../scripts/constants/window-names";

export class NotificationController {
  public static readonly NOTIFICATION_TIME: number = 4000;
  public static notificationTimeout: any = null;

  private static notificationView: NotificationView;

  private constructor() {
  }

  static async run() {
    if (!NotificationController.notificationView) {
      NotificationController.notificationView = new NotificationView();
    }

    try {
      await NotificationController._updateHotkeys();
    } catch (e) {
      console.error(e);
    }

    HotkeysService.instance.addHotkeyChangeListener(
      NotificationController._updateHotkeys);

    let mainWindow = overwolf.windows.getMainWindow();
    (<any>mainWindow).ow_eventBus.addListener(NotificationController._eventListener);
  }

  static async _updateHotkeys() {
    let toggleHotkey = await HotkeysService.instance.getToggleHotkey();
    let screenshotHotkey = await HotkeysService.instance.getTakeScreenshotHotkey();
    /*NotificationController.notificationView.updateToggle(toggleHotkey);
    NotificationController.notificationView.updateScreenshot(screenshotHotkey);*/
  }

  private static _eventListener(eventName: string, data: any) {
    switch (eventName) {
      case 'notification_data': {
        clearTimeout(NotificationController.notificationTimeout);
        NotificationController.notificationView.updateContent(data);
        NotificationController.notificationTimeout = setTimeout(() => {
          WindowsService.instance.close(WindowNames.NOTIFICATION);
        }, NotificationController.NOTIFICATION_TIME)
        break;
      }
      default:
        break;
    }
  }
}

