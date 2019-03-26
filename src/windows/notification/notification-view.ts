import {WindowNames} from "../../scripts/constants/window-names";
import {WindowsService} from "../../scripts/services/windows-service";
import {DragService} from "../../scripts/services/drag-service";
import {RunningGameService} from "../../scripts/services/running-game-service";

export class NotificationView {

  private readonly notificationDiv: HTMLElement | any = document.getElementById('notification');

  private dragService: DragService | any = null;

	constructor() {
    let that = this;
    this._setWindowPosition();
  }

  private async _setWindowPosition() {
    const gameInfo = await RunningGameService.instance.getInfo();
    const middle = (gameInfo.width/2) - (window.innerWidth/2);
    WindowsService.instance.changePosition(WindowNames.NOTIFICATION, middle, 60);
  }

  public updateContent(content: string) {
    this.notificationDiv.innerHTML = content;
  }
}