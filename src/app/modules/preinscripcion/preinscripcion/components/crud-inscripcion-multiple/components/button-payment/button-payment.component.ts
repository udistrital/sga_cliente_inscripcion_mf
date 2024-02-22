import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-button-payment',
  templateUrl: './button-payment.component.html',
  styleUrls: ['./button-payment.component.scss']
})
export class ButtonPaymentComponent implements OnInit {

  notPaid!: boolean;
  isPaid!: boolean;
  vencido!: boolean;
  yaInscrito!: boolean;

  @Input() value!: string | number;
  @Input() rowData: any;

  @Output() save: EventEmitter<any> = new EventEmitter();

  constructor(private translate: TranslateService) {}

  ngOnInit() {
    if(this.rowData.Estado === 'Pendiente pago'){
      this.notPaid = true;
      this.isPaid = false;
      this.vencido = false;      
    } else if (this.rowData.Estado === 'Pago'){
      this.notPaid = false;
      this.isPaid = true;
      this.vencido = false;
    } else {
      this.notPaid = false;
      this.isPaid = false;
      this.vencido = true;
    }
    if(this.rowData.EstadoInscripcion !== 'Inscripción solicitada'){
      this.yaInscrito = true;
    } else {
      this.yaInscrito = false;
    }
  }

  showOptions(){
    this.save.emit({estado: false, data: this.rowData});
  }

  showInscription(){
    this.save.emit({estado: true, data: this.rowData});
  }

}
