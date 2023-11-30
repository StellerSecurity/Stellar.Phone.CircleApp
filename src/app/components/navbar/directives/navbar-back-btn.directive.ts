import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[navbarBackButton]',
})
export class NavbarBackBtn {
  constructor(public templateRef: TemplateRef<any>) {}
}
