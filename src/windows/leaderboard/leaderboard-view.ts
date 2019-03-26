import { WindowNames } from "../../scripts/constants/window-names";
import { WindowsService } from "../../scripts/services/windows-service";
import { DragService } from "../../scripts/services/drag-service";
import { NotificationsService } from "../../scripts/services/notifications-service";
import { RunningGameService } from "../../scripts/services/running-game-service";

export class LeaderboardView {

	private currentPlayerName: string = '';
	private players: Array<PUBG.Player> = [];

	private readonly img: HTMLElement | any = document.querySelector('img');
	private readonly closeButton: HTMLElement | any = document.getElementById('closeButton');
	private readonly settingsButton: HTMLElement | any = document.getElementById('settingsButton');
	private readonly view: HTMLElement | any = document.querySelector('body');
	private readonly header: HTMLElement | any = document.getElementsByClassName('app-header')[0];
	private leader1: HTMLElement | any = document.getElementsByClassName('leader')[0];
	private leader2: HTMLElement | any = document.getElementsByClassName('leader')[1];
	private leader3: HTMLElement | any = document.getElementsByClassName('leader')[2];

	private dragService: DragService | any = null;

	constructor() {
		let that = this;
		this.settingsButton.addEventListener('click', LeaderboardView._onSettingsClicked);
		//this.closeButton.addEventListener('click', LeaderboardView._onCloseClicked);
		overwolf.windows.getCurrentWindow(result => {
			that.dragService = new DragService(result.window, that.header);
			that.dragService = new DragService(result.window, that.leader1);
			that.dragService = new DragService(result.window, that.leader2);
			that.dragService = new DragService(result.window, that.leader3);
		});
    this._setWindowPosition();
  }

  private async _setWindowPosition() {
		const gameInfo = await RunningGameService.instance.getInfo();
		const bottom = gameInfo.height - 300;
		console.log(bottom)
    WindowsService.instance.changePosition(WindowNames.LEADERBOARD, 30, bottom);
  }

	private static _onCloseClicked() {
		WindowsService.instance.minimize(WindowNames.LEADERBOARD);
	}

	private static _onSettingsClicked() {
		WindowsService.instance.restore(WindowNames.SETTINGS);
	}

	public updateScreenshot(url: string) {
		this.img.src = url;
	}

	public async updateInfo(info: PUBG.GameInfo) {
		this.players = info.players;
		this.currentPlayerName = info.currentPlayerName;
		this._render();
	}

	public async resetRoster() {
		this.players = [];
		this._render();
	}

	public async updateRoster(player: PUBG.Player) {
		try {
			let players: Array<PUBG.Player> = [...this.players];
			const index = await players.findIndex(x => x.player === player.player);
			// find if player already exists
			if (index === -1) {
				await players.push(player);
			} else {
				players[index].kills = player.kills;
			}
			// sort players by number of kills
			await players.sort((a, b) => {
				if(a.kills < b.kills) return 1;
				if(a.kills > b.kills) return -1;
				return 0;
			});
			// check last game leader
			const lastLeader = this.players[0];
			const newLeader = players[0];
			if (lastLeader !== newLeader) {
				if (player.kills > 0) {
					NotificationsService.instance.notify(
						`<b>${player.player}</b> is the new dead legend!`
					);
				}
			}
			this.players = players;
			this._render();
		} catch (e) { console.log(e) }
	}

	private _renderLeader(player: PUBG.Player) {
		if (player.player === this.currentPlayerName) {
			return `<div class="name me">${player.player}</div><div class="kills">${player.kills}</div>`
		} else {
			return `<div class="name">${player.player}</div><div class="kills">${player.kills}</div>`
		}
	}

	private _render() {
		if (this.players[0]) {
			this.leader1.innerHTML = this._renderLeader(this.players[0]);
		}
		if (this.players[1]) {
			this.leader2.innerHTML = this._renderLeader(this.players[1]);
		}
		if (this.players[2]) {
			this.leader3.innerHTML = this._renderLeader(this.players[2]);
		}
	}
}