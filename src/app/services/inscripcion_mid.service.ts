import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { RequestManager } from '../managers/requestManager';

const httpOptions = {
    headers: new HttpHeaders({
        'Accept': 'application/json',
    }),
}

@Injectable({
  providedIn: 'root',
})

export class InscripcionMidService {

  constructor(private requestManager: RequestManager) {
    this.requestManager.setPath('INSCRIPCION_MID_SERVICE');
  }
  get(endpoint: any) {
    this.requestManager.setPath('INSCRIPCION_MID_SERVICE');
    return this.requestManager.get(endpoint);
  }
  post(endpoint: any, element: any) {
    this.requestManager.setPath('INSCRIPCION_MID_SERVICE');
    return this.requestManager.post(endpoint, element);
  }
  put(endpoint: any, element: any) {
    this.requestManager.setPath('INSCRIPCION_MID_SERVICE');
    return this.requestManager.put(endpoint, element);
  }
  delete(endpoint: any, element: any) {
    this.requestManager.setPath('INSCRIPCION_MID_SERVICE');
    return this.requestManager.delete(endpoint, element.Id);
  }
}

