import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { RequestManager } from '../managers/requestManager';


const httpOptions = {
    headers: new HttpHeaders({
        'Accept': 'application/json',
    }),
}

@Injectable()
export class DocumentoService {
    constructor(private requestManager: RequestManager) {
        this.requestManager.setPath('DOCUMENTO_SERVICE');
      }
      get(endpoint: any) {
        this.requestManager.setPath('DOCUMENTO_SERVICE');
        return this.requestManager.get(endpoint);
      }
      post(endpoint: any, element: any) {
        this.requestManager.setPath('DOCUMENTO_SERVICE');
        return this.requestManager.post(endpoint, element);
      }
      put(endpoint: any, element: any) {
        this.requestManager.setPath('DOCUMENTO_SERVICE');
        return this.requestManager.put(endpoint, element);
      }
      delete(endpoint: any, element: { Id: any; }) {
        this.requestManager.setPath('DOCUMENTO_SERVICE');
        return this.requestManager.delete(endpoint, element.Id);
      }
    }
