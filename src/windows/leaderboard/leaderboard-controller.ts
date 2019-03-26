import { WindowNames } from "../../scripts/constants/window-names";
import { WindowsService } from "../../scripts/services/windows-service";

import { LeaderboardView } from "./leaderboard-view";

export class LeaderboardController {
  private static inGameView: LeaderboardView;

  private constructor() {
  }

  static run() {
    if (!LeaderboardController.inGameView) {
      LeaderboardController.inGameView = new LeaderboardView();
    }

    let mainWindow = overwolf.windows.getMainWindow();
    (<any>mainWindow).ow_eventBus.addListener(LeaderboardController._eventListener);
  }

  private static _eventListener(eventName: string, data: any) {
    switch (eventName) {
      case 'matchStart': {
        console.log('matchStart restoring window')
        LeaderboardController._resetRoster();
        WindowsService.instance.restore(WindowNames.LEADERBOARD);
        break;
      }
      case 'matchEnd': {
        console.log('matchEnd minimize window')
        WindowsService.instance.minimize(WindowNames.LEADERBOARD);
        break;
      }
      case 'info': {
        LeaderboardController._updateInfo(data);
        break;
      }
      case 'roster': {
        LeaderboardController._updateRoster(data);
        break;
      }
      case 'kill': {
        console.log('kill', data);
        //LeaderboardController._updateRoster(data);
        break;
      }
      default:
        break;
    }
  }

  private static _updateInfo(info: PUBG.GameInfo) {
    LeaderboardController.inGameView.updateInfo(info);
  }

  private static _updateRoster(player: PUBG.Player) {
    LeaderboardController.inGameView.updateRoster(player);
  }
  
  private static _resetRoster() {
    LeaderboardController.inGameView.resetRoster();
  }
}


