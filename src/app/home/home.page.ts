import { Component, SimpleChanges, inject } from '@angular/core';
import { Circle } from '../models/circle.model';
import { CircledataService } from '../services/circledata.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { WipeStatusEnum } from '../WipeStatusEnum';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage  {
  public circles: Circle[] = [];

  public addCircleModal = new Circle();

  public addCircleModelVisible = false;

  public circleNameAdd: string = '';

  public circleToken: string = '';

  public backButton = true;

  public search: string = '';

  public filteredCircles: Circle[] = [];
  routerNavigation:any
  constructor(
    public circleDataService: CircledataService,
    public alertController: AlertController,
    private loadingCtrl: LoadingController,
    private router: Router
  ) {
    this.addCircleModal.wipe_status = WipeStatusEnum.ACTIVE;
    this.init().then((r) => { });

    this.routerNavigation = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Handle route change here
        this.init().then((r) => { });
      }
    });
  }

  public modelToggleAdd() {
    this.addCircleModelVisible = !this.addCircleModelVisible;
  }

  /**
   * This solution is fucking bad.
   * Should be observable.
   */

  public async init() {
    this.circles = await this.circleDataService.circles();
    setTimeout(async () => {
      this.circles = await this.circleDataService.circles();
      this.filteredCircles = this.circles;
    }, 1000);
  }
  isSearch:boolean = false
  showSearch(searchStatus:boolean){
    this.isSearch = searchStatus
  }

  public async addCircle() {
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
        message: 'Your contact must have a Wipe Token. It cannot be empty. It can be found in the Protect-app.',
        buttons: ['OK'],
      });

      await alert.present();
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Checking if token is correct...',
    });

    await loading.present();

    this.addCircleModal.name = this.circleNameAdd;
    this.addCircleModal.wipe_auth_token = this.circleToken;

    (
      await this.circleDataService.circleTokenCheck(this.addCircleModal)
    ).subscribe(async (response) => {
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

      if (response.response_code === 200) {
        this.circleNameAdd = '';
        this.circleToken = '';

        await this.circleDataService.add(this.addCircleModal);
        this.filteredCircles = await this.circleDataService.circles();
        
        this.modelToggleAdd();
        return;
      }
    });
  }

  public handleSearch() {
    this.filteredCircles = this.circles.filter((circle: Circle) => {
      return circle.name.toLowerCase().includes(this.search.toLowerCase().trim());
    });
  }
 public clearSearch(){
  this.search = ''
  this.filteredCircles = this.circles.filter((circle: Circle) => {
    return circle.name.toLowerCase();
  });
  }
  ngOnDestroy(): void{
    this.routerNavigation.unsubscribe();
  }
}
