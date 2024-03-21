import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DocumentoService } from 'src/app/services/documento.service';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';

@Component({
  selector: 'ngx-download-file-nuxeo',
  templateUrl: './download-file-nuxeo.component.html',
  styleUrls: ['./download-file-nuxeo.component.scss']
})
export class DownloadFileNuxeoComponent implements  OnInit {
  
  @Input('idDoc')
  set name(idDoc: number) {
    this.documentoService.get('documento/' + idDoc)
    .subscribe((data)=>{
      this.documentoData = data;
    })
  }
  @Input('label') label: any;
  @Output() event: EventEmitter<any> = new EventEmitter();
  documentoData: any;
  documentoFile: any;
  loading: boolean = false;
  constructor(
    private documentoService: DocumentoService,
    private newNuxeoService: NewNuxeoService,
    ) {}

  ngOnInit()  {
  }


  openFile(){
    this.loading = true; 
    if(!this.documentoFile){
      if(this.documentoData) {
        this.newNuxeoService.get(this.documentoData)
        .subscribe((docFile:any)=> {
          this.documentoFile = docFile;
          this.open();
        })
      }
    }else {
      this.open();
    }
  }

  open(){
      this.loading = false; 
      const w = 500;
      const h = 500;
      const left = (screen.width / 2) - (w / 2);
      const top = (screen.height / 2) - (h / 2);
      window.open(this.documentoFile.urlUnsafe, this.documentoFile, 'toolbar=no,' +
        'location=no, directories=no, status=no, menubar=no,' +
        'scrollbars=no, resizable=no, copyhistory=no, ' +
        'width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
    }
}
