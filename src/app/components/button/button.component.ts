import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'circle-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  public _className: string = '';

  constructor() {}

  @Input() value: string = '';
  @Input() className: string = '';
  @Input() fill: 'outline' | 'solid' = 'solid';
  @Input() size: 'lg' | 'md' | 'sm' = 'md';
  @Input() color: string | null = 'primary';
  @Input() shape?: string = '';

  @Output() onClick = new EventEmitter<any>();

  ngOnInit() {
    this._className = this.className;

    this._className += ` button-${this.size}`;

    switch (this.color) {
      case 'note-danger':
        this._className += ' setting-color-danger';
        this.color = null;
        break;
      case 'note-success':
        this._className += ' setting-color-success';
        this.color = null;
        break;
    }

    switch (this.size) {
      case 'lg':
        this._className += ' setting-size-lg';
        break;

      case 'md':
        this._className += ' setting-size-md';
        break;

      case 'sm':
        this._className += ' setting-size-sm';
        break;
    }
  }

  handleClick($event: any) {
    this.onClick.emit($event);
  }
}
