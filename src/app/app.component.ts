import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { fromEvent } from 'rxjs';
import { getCookie } from './utils/cookie';

@Component({
  selector: 'sga-inscripcion-mf',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'sga-cliente-inscripcion-mf';

  ngOnInit(): void {
    validateLang(this.translate);
  }

  constructor(
    private translate: TranslateService
  ) {}
}

export function validateLang(translate: TranslateService) {
  let whatLang$ = fromEvent(window, 'lang');
  let lang = getCookie('lang') || 'es';
  whatLang$.subscribe((x:any) => {
    lang = x['detail']['answer'];
    translate.setDefaultLang(lang)
  });
  translate.setDefaultLang(getCookie('lang') || 'es');
}
