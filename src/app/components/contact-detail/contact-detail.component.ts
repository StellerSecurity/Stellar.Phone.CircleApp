import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Circle } from 'src/app/models/circle.model';
import { CircledataService } from 'src/app/services/circledata.service';
import {Location} from '@angular/common';
import { AlertController, LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { WipeStatusEnum } from 'src/app/WipeStatusEnum';

@Component({
  selector: 'app-contact-detail',
  templateUrl: './contact-detail.component.html',
  styleUrls: ['./contact-detail.component.scss'],
})
export class ContactDetailComponent  implements OnInit {
  routerNavigation:any
  constructor(private activatedRoute: ActivatedRoute, private router: Router,public circleDataService: CircledataService,private _location: Location,private alertController: AlertController,private translate: TranslateService, private loadingCtrl: LoadingController,) {
  
   }

  ngOnInit() {
    // this.loadComponentData()
    this.routerNavigation = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Handle route change here
      this.loadComponentData();
      }
    });
  }
id:any
contactDetail : any = []
originalData:Circle[] = []
  async loadComponentData(){debugger
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    
   this.originalData = await this.circleDataService.circles();
   let circles =  this.originalData.map((item, index) => ({ ...item, id: index }));
  this.contactDetail = circles.filter((item:Circle) => item.id == this.id)[0]
   console.log('iddddd=>',this.id)
  
  }
goBack(){
  this._location.back();
}


public async wipe() {
  const contact = this.originalData[this.id];

  const alert = await this.alertController.create({
    header: this.translate.instant('wipe_confirmation_header'),
    message: this.translate.instant('wipe_confirmation_message', { contactName: contact.name }),
    buttons: [
      {
        text: this.translate.instant('cancel_button'),
        role: 'cancel',
        cssClass: 'secondary',
        id: 'cancel-button',
        handler: (blah) => {

        }
      }, {
        text: this.translate.instant('okay_button'),
        id: 'confirm-button',
        handler: async () => {

          const loading = await this.loadingCtrl.create({
            message: this.translate.instant('please_wait_message')
          });

          await loading.present();

          (await this.circleDataService.wipe(contact))
            .subscribe(async response => {

              await loading.dismiss();

              const alert = await this.alertController.create({
                header: this.translate.instant('wipe_set_header'),
                message: this.translate.instant('wipe_set_message', { contactName: contact.name }),
                buttons: [this.translate.instant('okay_button')],
              });

              await alert.present();

              contact.wipe_status = WipeStatusEnum.WIPING;

              await this.circleDataService.update(this.id, contact);
              this.loadComponentData()

            });

        }
      }
    ]
  });

  await alert.present();
}
public async delete() {
  const contact = this.originalData[this.id];
  const alert = await this.alertController.create({
    header: this.translate.instant('delete_confirmation_header'),
    message: this.translate.instant('delete_confirmation_message', { contactName: contact.name }),
    buttons: [
      {
        text: this.translate.instant('cancel_button'),
        role: 'cancel',
        cssClass: 'secondary',
        id: 'cancel-button',
        handler: (blah) => {

        }
      }, {
        text: this.translate.instant('okay_button'),
        id: 'confirm-button',
        handler: () => {
          this.circleDataService.remove(this.id);
          this.goBack()
        }
      }
    ]
  });

  await alert.present();
  await this.loadComponentData();
}
protected readonly WipeStatusEnum = WipeStatusEnum;

ngOnDestroy(): void{
  this.routerNavigation.unsubscribe();
}
}
