import {TranslateService} from '@ngx-translate/core';
import {firstValueFrom} from 'rxjs';
import { Component } from '@angular/core';
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

  public adding = false;

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
    private router: Router,
    private translate: TranslateService
  ) {
    this.init().then((r) => { });

    this.routerNavigation = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Handle route change here
        this.init().then((r) => { });
      }
    });
  }

  public modelToggleAdd() {
    if (!this.adding) this.addCircleModelVisible = !this.addCircleModelVisible;
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
    if (this.adding) return;
    this.adding = true;
    let loading: HTMLIonLoadingElement | undefined;
    try {
      const contact = new Circle();
      contact.name = this.circleNameAdd.trim();
      contact.wipe_auth_token = this.circleToken.trim();
      contact.wipe_status = WipeStatusEnum.ACTIVE;
      if (!contact.name || !contact.wipe_auth_token) throw new Error('Missing contact information');

      loading = await this.loadingCtrl.create({message: this.translate.instant('please_wait_message')});
      await loading.present();
      const response = await firstValueFrom(await this.circleDataService.circleTokenCheck(contact));
      if (response.response_code !== 200) throw new Error('Invalid token');
      await this.circleDataService.add(contact);
      this.circleNameAdd = '';
      this.circleToken = '';
      this.addCircleModelVisible = false;
      await this.init();
    } catch {
      if (loading) { await loading.dismiss(); loading = undefined; }
      const alert = await this.alertController.create({
        header: this.translate.instant('error_title'),
        message: this.translate.instant('token_invalid_message'),
        buttons: [this.translate.instant('close_button')],
      });
      await alert.present();
    } finally {
      if (loading) await loading.dismiss();
      this.adding = false;
    }
  }

  public handleSearch() {
    this.filteredCircles = this.circles.filter((circle: Circle) => {
      return circle.name.toLowerCase().includes(this.search.toLowerCase().trim());
    });
  }
 public clearSearch(stopSearching: boolean){

  if(stopSearching) {
    this.isSearch = false;
  }

  this.search = ''
  this.filteredCircles = this.circles.filter((circle: Circle) => {
    return circle.name.toLowerCase();
  });
  }
  ngOnDestroy(): void{
    this.routerNavigation.unsubscribe();
  }
}
