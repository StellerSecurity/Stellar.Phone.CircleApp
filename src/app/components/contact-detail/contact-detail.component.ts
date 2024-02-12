import { Component, EventEmitter, OnInit,Output } from '@angular/core';
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
  @Output() DataFromChild = new EventEmitter<Circle[]>();
  constructor(private activatedRoute: ActivatedRoute, private router: Router,public circleDataService: CircledataService,private _location: Location,private alertController: AlertController,private translate: TranslateService, private loadingCtrl: LoadingController,) {
  
   }

  ngOnInit() {
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
  async loadComponentData(){
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    
   this.originalData = await this.circleDataService.circles();
   let circles =  this.originalData.map((item, index) => ({ ...item, id: index }));
  this.contactDetail = circles.filter((item:Circle) => item.id == this.id)[0];
  this.DataFromChild.emit(this.originalData);
  
  }
goBack(){
  this._location.back();
}


public async wipe() {
  const contact = this.originalData[this.id];

  const alert = await this.alertController.create({
    cssClass: "wipe-out-alert alert-with-icon",
    header: this.translate.instant('wipe_alert_header',{ contactName: contact.name }),
    message: `${this.translate.instant('wipe_confirmation_message')}`,
    inputs: [
      {
        name: 'username',
        type: 'text',
        placeholder: 'Enter Username',
        cssClass:'alert-input',
        value: '',
      }
    ],
    buttons: [
      {
        text: this.translate.instant('cancel_button'),
        role: 'cancel',
        cssClass: 'secondary',
        id: 'cancel-button',
        handler: (blah) => {

        }
      }, {
        text: this.translate.instant('wipe_phone_button'),
        id: 'confirm-button',
        cssClass: 'danger',
        handler: async (data) => {
          const username = data.username.trim();
          if(username){
            const loading = await this.loadingCtrl.create({
              message: this.translate.instant('please_wait_message')
            });
  
            await loading.present();
  
            (await this.circleDataService.wipe(contact))
              .subscribe(async response => {
  
                await loading.dismiss();
  
                const alert = await this.alertController.create({
                  cssClass: "wipe-out-set alert-with-icon",
                  header: this.translate.instant('wipe_set_header',{ contactName: contact.name }),
                  message: this.translate.instant('wipe_set_message'),
                  buttons: [this.translate.instant('close_button')],
                });
  
                await alert.present();
  
                contact.wipe_status = WipeStatusEnum.WIPING;
  
                await this.circleDataService.update(this.id, contact);
                this.loadComponentData()
  
              });
              return true
          }
         else{
          const errorAlert = await this.alertController.create({
            header: 'Error',
            message: 'Please enter a username',
            cssClass:'error-alert',
            buttons: [{
              text: 'OK',
              handler: () => {
                // Do not dismiss the alert
              }
            }]
          });
          await errorAlert.present();
          return false
         }

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
    message:  this.translate.instant('delete_confirmation_message', { contactName: contact.name })                              ,
    cssClass: 'custom-alert',
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
          
          this.router.navigate(['/home']);
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
