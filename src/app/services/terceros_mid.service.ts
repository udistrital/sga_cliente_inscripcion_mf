import { Injectable } from '@angular/core';
import { RequestManager } from '../managers/requestManager';

@Injectable({
  providedIn: 'root',
})
export class TercerosMidService {

  private readonly servicePath: string = 'TERCEROS_MID_SERVICE';

  constructor(private requestManager: RequestManager) {}

  private setServicePath(){
    this.requestManager.setPath(this.servicePath);
  }

  public get(endpoint: any) {
    this.setServicePath();
    return this.requestManager.get(endpoint);
  }

  public post(endpoint: any, element: any) {
    this.setServicePath();
    return this.requestManager.post(endpoint, element);
  }

  public put(endpoint: any, element: any) {
    this.setServicePath();
    return this.requestManager.put(endpoint, element);
  }

  public delete(endpoint: any, element: any) {
    this.setServicePath();
    return this.requestManager.delete(endpoint, element.Id);
  }

  public uploadFile(endpoint: any, element: any) {
    this.setServicePath();
    return this.requestManager.post_file(endpoint, element);
  }

}
