import { Injectable } from '@angular/core';
import { RequestManager } from '../managers/requestManager';

@Injectable({
  providedIn: 'root',
})

export class TercerosMidService {

  constructor(private requestManager: RequestManager) {
    this.requestManager.setPath('SGA_MID_TERCERO');
  }

  get(endpoint: any) {
    this.requestManager.setPath('SGA_MID_TERCERO');
    return this.requestManager.get(endpoint);
  }

  post(endpoint: any, element: any) {
    this.requestManager.setPath('SGA_MID_TERCERO');
    return this.requestManager.post(endpoint, element);
  }

  put(endpoint: any, element: any) {
    this.requestManager.setPath('SGA_MID_TERCERO');
    return this.requestManager.put(endpoint, element);
  }

  delete(endpoint: any, element: any) {
    this.requestManager.setPath('SGA_MID_TERCERO');
    return this.requestManager.delete(endpoint, element.Id);
  }
}
