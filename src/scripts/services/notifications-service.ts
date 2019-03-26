
export class NotificationsService {
  private static _instance: NotificationsService = new NotificationsService();

  protected constructor() {
  }

  static get instance(): NotificationsService {
    return NotificationsService._instance;
  }

  public notify(content: string) {
    try {
      let mainWindow = overwolf.windows.getMainWindow();
      (<any>mainWindow).ow_eventBus.trigger('show_notification', content);
    } catch (e) { console.log(e) }
  }

}


