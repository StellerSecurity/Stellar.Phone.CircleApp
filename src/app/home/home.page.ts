import { Component, inject } from '@angular/core';
import {Circle} from "../models/circle.model";
import {CircledataService} from "../services/circledata.service";
import {AlertController, LoadingController} from "@ionic/angular";
import {WipeStatusEnum} from "../WipeStatusEnum";

import { circles as circleData } from 'src/@fake-data/circle.data';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  public circles: Circle[] = circleData;

  public addCircleModal = new Circle();

  public addCircleModelVisible = false;

  public circleNameAdd: string = "";

  public circleToken: string = "";

  public backButton = true;

  constructor(public circleDataService: CircledataService,
              public alertController: AlertController,
              private loadingCtrl: LoadingController) {
      this.addCircleModal.wipe_status = WipeStatusEnum.ACTIVE;
      this.init().then(r => {});
  }

  public modelToggleAdd() {
    this.addCircleModelVisible = !this.addCircleModelVisible;
  }

  /**
   * This solution is fucking bad. Should be observable.
   */
  public async init() {
      // this.circles = await this.circleDataService.circles();
      // setInterval(async () => {
      //   this.circles = await this.circleDataService.circles();
      // }, 2500);
  }

  public async addCircle() {

    console.log(this.circleNameAdd);
    if (this.circleNameAdd.length == 0) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Your contact must have a nick-name. It cannot be empty.',
        buttons: ['OK'],
      });

      await alert.present();
      return;
    }

    if (this.circleToken.length == 0) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Your contact must have a Wipe Token. It cannot be empty.',
        buttons: ['OK'],
      });

      await alert.present();
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Checking if token is correct...'
    });

    await loading.present();

    this.addCircleModal.name = this.circleNameAdd;
    this.addCircleModal.wipe_auth_token = this.circleToken;

    (await this.circleDataService.circleTokenCheck(this.addCircleModal))
      .subscribe(async response => {

        await loading.dismiss();

        if (response.response_code !== 200) {
          const alert = await this.alertController.create({
            header: 'Error',
            message: response.message,
            buttons: ['OK'],
          });

          await alert.present();
          return;
        }

        if(response.response_code === 200) {

          this.circleNameAdd = "";
          this.circleToken = "";

          await this.circleDataService.add(this.addCircleModal);
          this.modelToggleAdd();
          return;
        }

      });
  }

  public handleOnBack() {

  }

}
