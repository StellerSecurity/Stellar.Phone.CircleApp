import { Injectable } from '@angular/core';
import {Circle} from "../models/circle.model";
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class CircledataService {

  private CIRCLE_LOCAL_STORAGE_KEY = "CIRCLES_LIST_STORAGE";

  constructor(private storage: Storage) { }

  public async add(circle: Circle) {
    let circles = await this.circles();
    circles.push(circle);
    await this.storage.set(this.CIRCLE_LOCAL_STORAGE_KEY, JSON.stringify(circles));
  }

  public remove(index: number) {

  }

  public async circles() {

    let circles = await this.storage.get(this.CIRCLE_LOCAL_STORAGE_KEY);

    if(circles === null) {
      return [];
    }

    return JSON.parse(circles);

  }

  /**
   * Wipes a phone.
   * @param circle
   */
  public wipe(circle: Circle): void {
    console.log(circle.wipe_auth_token);
  }

}
