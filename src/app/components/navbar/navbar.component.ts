import { Component, OnInit, Input,Output, ContentChild, EventEmitter } from '@angular/core';
import { NavController } from '@ionic/angular';
import { NavbarBackBtn } from './directives/navbar-back-btn.directive';

@Component({
  selector: 'circle-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  constructor() {}

  @Input() title: string = '';
  @Input() color?: string = 'circle-purple';
  @Input() className?: string = '';
  @Input() hasBackButton: boolean = false;

  @Output() onClickBackButton: EventEmitter<null> = new EventEmitter<null>();
  @Output() isSearchShown: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ContentChild(NavbarBackBtn) backBtn?: NavbarBackBtn;


  handleBackButtonClick() {
    this.onClickBackButton.emit();
  }
  showSearch(){
    this.isSearchShown.emit(true)
  }
}
