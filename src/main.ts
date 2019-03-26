import {BackgroundController} from "./windows/background/background-controller";
import {LeaderboardController} from "./windows/leaderboard/leaderboard-controller";
import {SettingsController} from "./windows/settings/settings-controller";
import { NotificationController } from "./windows/notification/notification-controller";

(function main() {
  let path = window.location.pathname.replace('/windows/', '');
  let windowFolder = path.split('/')[0];

  switch (windowFolder) {
    case 'background': {
      BackgroundController.run();
      break;
    }
    case 'leaderboard': {
      LeaderboardController.run();
      break;
    }
    case 'settings': {
      SettingsController.run();
      break;
    }
    case 'notification': {
      NotificationController.run();
      break;
    }
  }
})();
