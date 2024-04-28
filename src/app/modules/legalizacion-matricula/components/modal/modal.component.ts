import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  inputData: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {

  }
  ngOnInit(): void {
    this.inputData = this.data;
  }

  //title = 'filepreviewngxdoc';
  fileurl = 'https://www.africau.edu/images/default/sample.pdf';
}
