import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-link-download',
  templateUrl: './link-download.component.html',
  styleUrls: ['./link-download.component.scss']
})
export class LinkDownloadComponent implements OnInit{

  download!: boolean;
  expired!: boolean;

  @Input() value!: string | number;
  @Input() rowData: any;

  @Output() save: EventEmitter<any> = new EventEmitter();

  constructor(private translate: TranslateService) {}

  ngOnInit() {
    if(this.rowData.Estado === 'Pendiente pago'){
      this.download = true;
      this.expired = false;
    } else if (this.rowData.Estado === 'Pago'){
      this.download = true;
      this.expired = false;
    } else{
      this.download = false;
      this.expired = true;
    }
  }

  showDownload(){
    this.save.emit(this.rowData);
  }
  
  showExpired(){
  }
}

