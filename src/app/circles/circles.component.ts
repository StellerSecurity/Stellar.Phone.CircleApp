import { Component, OnInit } from '@angular/core';
import {AlertController} from "@ionic/angular";

@Component({
  selector: 'app-circles',
  templateUrl: './circles.component.html',
  styleUrls: ['./circles.component.scss'],
})
export class CirclesComponent  implements OnInit {

  constructor(private alertController:AlertController) { }

  ngOnInit() {}

  public async wipe() {
    const alert = await this.alertController.create({
      header: 'Warning',
      message: 'Are you sure you want to Wipe DANIEL phone?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button',
          handler: (blah) => {

          }
        }, {
          text: 'Okay',
          id: 'confirm-button',
          handler: () => {

          }
        }
      ]
    });

    await alert.present();
  }

  public async delete() {
    const alert = await this.alertController.create({
      header: 'Warning',
      message: 'Are you sure you want to remove Daniel from your contacts?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button',
          handler: (blah) => {

          }
        }, {
          text: 'Okay',
          id: 'confirm-button',
          handler: () => {

          }
        }
      ]
    });

    await alert.present();
  }

}
