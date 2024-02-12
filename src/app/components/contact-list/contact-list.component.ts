import {
  Component,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { Circle } from 'src/app/models/circle.model';
import { WipeStatusEnum } from 'src/app/WipeStatusEnum';

@Component({
  selector: 'contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss'],
})
export class ContactListComponent {

  constructor() { }

  @Input() contacts: Circle[] = [];
  @Output() onClear = new EventEmitter<any>();
  @Output() onRemove = new EventEmitter<any>();
  @Output() onClick = new EventEmitter<any>();



  protected readonly WipeStatusEnum = WipeStatusEnum;
}
