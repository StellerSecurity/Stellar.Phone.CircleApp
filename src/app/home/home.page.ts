import { Component, inject } from '@angular/core';
import {Circle} from "../models/circle.model";
import {CircledataService} from "../services/circledata.service";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  public circles: Circle[] = [];

  constructor(public circleDataService: CircledataService) {

    let circle = new Circle();
    circle.name = "lol";
    circle.wipe_auth_token = "diller";
    circle.wipe_status = 2;

    this.circleDataService.add(circle).then(r => {});

    this.init();
  }


  public async init() {

    this.circles = await this.circleDataService.circles();

    this.circles.forEach(circle=> {
      console.log(circle);
    });

  }

}
