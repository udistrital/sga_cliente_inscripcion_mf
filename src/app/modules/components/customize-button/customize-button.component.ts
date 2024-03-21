import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-customize-button',
  templateUrl: './customize-button.component.html',
  styleUrls: ['./customize-button.component.scss']
})
export class CustomizeButtonComponent implements OnInit{

  @Input() value: any;
  @Input() rowData: any;
  @Output() save: EventEmitter<any> = new EventEmitter();

  constructor(private translate: TranslateService) {}

  ngOnInit() {
  }

  clickEvent(){
    this.save.emit(this.rowData);
  }
  
  showExpired(){

  }
}
