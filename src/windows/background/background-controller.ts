import { WindowNames} from "../../scripts/constants/window-names";
import { WindowsService } from "../../scripts/services/windows-service";
import { RunningGameService } from "../../scripts/services/running-game-service";
import { HotkeysService } from "../../scripts/services/hotkeys-service";
import { GepService } from "../../scripts/services/gep-service";
import { ScreenshotsService } from "../../scripts/services/screenshots-service";
import {EventBus} from "../../scripts/services/event-bus";
import { NotificationController } from "../notification/notification-controller";
import { NotificationsService } from "../../scripts/services/notifications-service";

export class BackgroundController {
  private constructor() {
  }

  static async run() {
    (<any>window).ow_eventBus = EventBus.instance;

    BackgroundController._registerAppLaunchTriggerHandler();
    BackgroundController._registerHotkeys();

    let startupWindow = await WindowsService.instance.getStartupWindowName();
    await WindowsService.instance.restore(startupWindow);

    let isGameRunning = await RunningGameService.instance.isGameRunning();
    if (isGameRunning) {
      GepService.instance.registerToGEP();
    }

    RunningGameService.instance.addGameRunningChangedListener((isGameRunning) => {
      if (isGameRunning) {
        console.log('restoring in game window');
        // WindowsService.instance.restore(WindowNames.LEADERBOARD);
      } else {
        // windowsService.minimize(WindowNames.LEADERBOARD);
        console.log('closing app after game closed');
        window.close();
      }
    });
    
    let mainWindow = overwolf.windows.getMainWindow();
    (<any>mainWindow).ow_eventBus.addListener(BackgroundController._eventListener);
  }

  private static async _eventListener(eventName: string, data: any) {
    switch (eventName) {
      case 'show_notification': {
        await WindowsService.instance.restore(WindowNames.NOTIFICATION);
        setTimeout(() => {
          (<any>window).ow_eventBus.trigger('notification_data', data);
        }, 500);
        break;
      }
      default:
        break;
    }
  }

  static _registerAppLaunchTriggerHandler() {
    overwolf.extensions.onAppLaunchTriggered.removeListener(
      BackgroundController._onAppRelaunch);
    overwolf.extensions.onAppLaunchTriggered.addListener(
      BackgroundController._onAppRelaunch);
  }

  static _onAppRelaunch() {
    WindowsService.instance.restore(WindowNames.SETTINGS);
  }

  static _registerHotkeys() {
    HotkeysService.instance.setTakeScreenshotHotkey(async () => {
      try {
        let screenshotUrl = await ScreenshotsService.takeScreenshot();
        (<any>window).ow_eventBus.trigger('screenshot', screenshotUrl);
      } catch (e) {
        console.error(e);
      }
    });
  }
}

