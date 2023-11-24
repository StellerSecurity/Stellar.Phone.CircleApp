import { Injectable } from '@angular/core';
import {Circle} from "../models/circle.model";

@Injectable({
  providedIn: 'root'
})
export class CircledataService {

  private CIRCLE_LOCAL_STORAGE_KEY = "CIRCLES_LIST";

  constructor(private storage: Storage) { }

  public add(circle: Circle) {




  }

  public remove(index: number) {

  }

  public circles() {
    return this.storage.getItem(this.CIRCLE_LOCAL_STORAGE_KEY);
  }

  public wipe(circle: Circle): void {
    console.log(circle.wipe_auth_token);
  }

}
