import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { RequestManager } from '../managers/requestManager';


const httpOptions = {
    headers: new HttpHeaders({
        'Accept': 'application/json',
    }),
}

const httpOptionsFile = {
    headers: new HttpHeaders({
        'Content-Type': 'multipart/form-data',
    }),
}

const path = environment.TERCEROS_MID_SERVICE;

@Injectable()
export class TerceroMidService {

  constructor(private requestManager: RequestManager, private http: HttpClient) {
    this.requestManager.setPath('TERCEROS_MID_SERVICE');
  }
  get(endpoint: any) {
    this.requestManager.setPath('TERCEROS_MID_SERVICE');
    return this.requestManager.get(endpoint);
  }
  post(endpoint: any, element: any) {
    this.requestManager.setPath('TERCEROS_MID_SERVICE');
    return this.requestManager.post(endpoint, element);
  }
  post_file(endpoint: any, element: any) {
    this.requestManager.setPath('TERCEROS_MID_SERVICE');
    return this.requestManager.post_file(endpoint, element);
  }

  put(endpoint: any, element: any) {
    this.requestManager.setPath('TERCEROS_MID_SERVICE');
    return this.requestManager.put(endpoint, element);
  }
  delete(endpoint: any, element: { Id: any; }) {
    this.requestManager.setPath('TERCEROS_MID_SERVICE');
    return this.requestManager.delete(endpoint, element.Id);
  }

}