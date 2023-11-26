import { Injectable } from '@angular/core';
import {Circle} from "../models/circle.model";
import { Storage } from '@ionic/storage';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {catchError} from "rxjs";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class CircledataService {

  private CIRCLE_LOCAL_STORAGE_KEY = "CIRCLES_LIST_STORAGE";

  constructor(private storage: Storage, private http: HttpClient) { }

  public async circleTokenCheck(circle: Circle) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    return this.http.post<any>(environment.api_url + "/v1/circlecontroller/add", {
      "wipe_token": circle.wipe_auth_token}, httpOptions).pipe();

  }

  public async add(circle: Circle) {
    let circles = await this.circles();
    circles.push(circle);
    await this.storage.set(this.CIRCLE_LOCAL_STORAGE_KEY, JSON.stringify(circles));
  }

  public async remove(index: number) {
    let circles = await this.circles();
    circles.splice(index, 1);
    await this.storage.set(this.CIRCLE_LOCAL_STORAGE_KEY, JSON.stringify(circles));
  }

  public async update(index: number, circle: Circle) {
    let circles = await this.circles();
    circles[index] = circle;
    await this.storage.set(this.CIRCLE_LOCAL_STORAGE_KEY, JSON.stringify(circles));
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
  public wipe(circle: Circle) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    return this.http.patch<any>(environment.api_url + "/v1/circlecontroller/updateToWiped", {
      "wipe_token": circle.wipe_auth_token}, httpOptions).pipe();
  }

}
