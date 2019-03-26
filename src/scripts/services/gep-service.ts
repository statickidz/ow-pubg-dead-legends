/**
 * Game Event Provider service
 * This will listen to events from the game provided by
 * Overwolf's Game Events Provider
 */

import { ScreenshotsService } from './screenshots-service';

export class GepService {

  private static readonly REQUIRED_FEATURES: string[] = [
    'kill',
    'revived',
    'death',
    'killer',
    'match',
    'rank',
    'location',
    'me',
    'team',
    'phase',
    'map',
    'roster'
  ];
  private static readonly REGISTER_RETRY_TIMEOUT: number = 10000;
  private static readonly GET_INFO_INTERVAL: number = 2000;

  private static _instance: GepService = new GepService();
  private static _infoInterval: any;

  protected constructor() {}

  static get instance(): GepService {
    return GepService._instance;
  }

  public registerToGEP() {
    // set the features we are interested in receiving
    overwolf.games.events.setRequiredFeatures(GepService.REQUIRED_FEATURES,
        this._registerToGepCallback.bind(this));
  }

  private _registerToGepCallback(response: any) {
    if (response.status === 'error') {
      setTimeout(this.registerToGEP.bind(this), GepService.REGISTER_RETRY_TIMEOUT);
    } else if (response.status === 'success') {
      overwolf.games.events.onNewEvents.removeListener(this._handleGameEvent.bind(this));
      overwolf.games.events.onNewEvents.addListener(this._handleGameEvent.bind(this));

      overwolf.games.events.onInfoUpdates2.removeListener(this._handleGameInfo.bind(this));
      overwolf.games.events.onInfoUpdates2.addListener(this._handleGameInfo.bind(this));

      //GepService._infoInterval = setInterval(this._handleGetInfo, GepService.GET_INFO_INTERVAL);
    }
  }

  private async _handleGetInfo() {
    overwolf.games.events.getInfo(async info => {
      console.log('_handleGetInfo', info)
      if (info && info.status === 'success') {
        try {

          if (info && info.res && info.res.game_info.phase === 'lobby') {
            return
          }

          let data = info.res

          let players:Array<PUBG.Player> = []
          let leaders:Array<PUBG.Player> = []

          // remove non players and stuff from match_info
          await Object
            .keys(data.match_info).map(key => data.match_info[key])
            .map(data => {
              try {
                let player = JSON.parse(data);
                if (player && player.kills && player.player) {
                  players.push(player);
                }
              } catch (e) {}
            });

          // sort players by number of kills
          await players.sort((a, b) => {
            if(a.kills < b.kills) return 1;
            if(a.kills > b.kills) return -1;
            return 0;
          });

          let pubgInfo: PUBG.GameInfo = {
            players: players,
            currentPlayerName: data.me.name
          };

          // send event trigger
          (<any>window).ow_eventBus.trigger('info', pubgInfo);
        } catch (e) {
          console.error(e);
        }
      }
    });
  }

  private async _handleGameInfo(info: any) {
    console.log('_handleGameInfo', info);
    switch (info.feature) {
      case 'roster': {
        try {
          const roster = info.info.match_info;
          let player: PUBG.Player = await Object.keys(roster).map(key => JSON.parse(roster[key]))[0];
          (<any>window).ow_eventBus.trigger('roster', player);
        } catch (e) {
          console.error(e);
        }
        break;
      }
    }
  }

  private async _handleGameEvent(eventsInfo: any) {
    for (let eventData of eventsInfo.events) {
      console.log('_handleGameEvent', eventData);
      switch (eventData.name) {
        case 'kill': {
          try {
            (<any>window).ow_eventBus.trigger('kill', eventData);
          } catch (e) {
            console.error(e);
          }
          break;
        }
        case 'matchStart': {
          try {
            (<any>window).ow_eventBus.trigger('matchStart', eventData);
          } catch (e) {
            console.error(e);
          }
          break;
        }
        case 'matchEnd': {
          try {
            (<any>window).ow_eventBus.trigger('matchEnd', eventData);
          } catch (e) {
            console.error(e);
          }
          break;
        }
      }
    }
  }


}


