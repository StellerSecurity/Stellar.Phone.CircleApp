import { Component, inject } from '@angular/core';
import {Circle} from "../models/circle.model";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  public circles: Array<Circle> = [
    {name: "test", "wipe_auth_token": "lol", wipe_status: 1},
  ];

  constructor() {

    let circle = new Circle();
    circle.name = "lol";
    circle.wipe_auth_token = "diller";
    circle.wipe_status = 2;
    this.circles.push(circle);


    for(let i = 0; this.circles.length > i++;) {
      console.log(this.circles[1].wipe_auth_token);
    }

  }


}
