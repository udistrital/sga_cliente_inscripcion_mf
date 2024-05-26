import { BehaviorSubject, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ImplicitAutenticationService } from './implicit_autentication.service';
import { RequestManager } from '../managers/requestManager';
import { decrypt, encrypt } from '../utils/util-encrypt';
import { cA } from '@fullcalendar/core/internal-common';

const path = environment.TERCEROS_SERVICE;

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private user$ = new Subject<[object]>();
  private userSubject = new BehaviorSubject(null);
  public tercero$ = this.userSubject.asObservable();
  public user: any;

  constructor(
    private requestManager: RequestManager,
    private autenticationService: ImplicitAutenticationService
  ) {
    if (
      window.localStorage.getItem('id_token') !== null &&
      window.localStorage.getItem('id_token') !== undefined
    ) {
      let DocIdentificacion: string | null = null;
      let CorreoUsuario = null;
      let UsuarioWSO2 = null;

      this.autenticationService.getDocument().then(async (document: any) => {
        console.log("ENTRANDOOOOOOO JAJAJA")
        if (document) {
          DocIdentificacion = document;
        }
        let payload = this.autenticationService.getPayload();
        UsuarioWSO2 = payload.sub ? payload.sub : null;
        CorreoUsuario = payload.email ? payload.email : null;

        let foundId: boolean = false;

        if (DocIdentificacion) {
          await this.findByDocument(
            DocIdentificacion,
            UsuarioWSO2,
            CorreoUsuario
          )
            .then((found) => (foundId = true))
            .catch((e) => (foundId = false));
        }

        if (UsuarioWSO2 && !foundId) {
          await this.findByUserEmail(UsuarioWSO2)
            .then((found) => (foundId = true))
            .catch((e) => (foundId = false));
        }

        if (CorreoUsuario && !foundId) {
          await this.findByUserEmail(CorreoUsuario)
            .then((found) => (foundId = true))
            .catch((e) => (foundId = false));
        }

        // if (!foundId) {
        //   const persona_id = encrypt('0');
        //   window.localStorage.setItem('persona_id', persona_id);
        // }
      });
    }
  }

  private findByDocument(DocIdentificacion: any, Usuario: any, Correo: any) {
    return new Promise<boolean>((resolve, reject) => {
      this.requestManager.setPath('TERCEROS_SERVICE');
      this.requestManager
        .get(
          'datos_identificacion?query=Activo:true,Numero:' +
            DocIdentificacion +
            '&sortby=FechaCreacion&order=desc'
        )
        .subscribe((res: any) => {
          if (res !== null) {
            if (res.length > 1) {
              let tercero = null;
              for (let i = 0; i < res.length; i++) {
                if (res[i].TerceroId.UsuarioWSO2 == Usuario) {
                  tercero = res[i].TerceroId;
                  break;
                }
              }
              if (tercero == null) {
                for (let i = 0; i < res.length; i++) {
                  if (res[i].TerceroId.UsuarioWSO2 == Correo) {
                    tercero = res[i].TerceroId;
                    break;
                  }
                }
              }
              if (tercero != null) {
                this.user = tercero;
              } else {
                this.user = res[0].TerceroId;
              }
            } else {
              this.user = res[0].TerceroId;
            }

            this.user['Documento'] = DocIdentificacion;
            if (Object.keys(this.user).length !== 0) {
              this.user$.next(this.user);
              this.userSubject.next(this.user);
              const persona_id = encrypt(this.user.Id.toString());
              console.log('SET PERSONA ID findByDocument');
              window.localStorage.setItem('persona_id', persona_id);
              resolve(true);
            } else {
              //this.user$.next(this.user);
              // const persona_id = encrypt('0');
              // window.localStorage.setItem('persona_id', persona_id);
              reject(new Error('No user found in findByDocument'));
            }
          } else {
            reject(new Error('No user found in findByDocument'));
          }
        });
    });
  }

  private findByUserEmail(UserEmail: any) {
    return new Promise<boolean>((resolve, reject) => {
      this.requestManager.setPath('TERCEROS_SERVICE');
      this.requestManager
        .get('tercero?query=UsuarioWSO2:' + UserEmail)
        .subscribe((res: any) => {
          setTimeout(() => {
            if (res !== null) {
              this.user = res[0];
              if (Object.keys(this.user).length !== 0) {
                this.user$.next(this.user);
                this.userSubject.next(this.user);
                const persona_id = encrypt(this.user.Id.toString());
                console.log('SET PERSONA ID findByUserEmail');
                window.localStorage.setItem('persona_id', persona_id);
                resolve(true);
              } else {
                // const persona_id = encrypt('0');
                // window.localStorage.setItem('persona_id', persona_id);
                reject(false);
              }
            } else {
              //this.user$.next(this.user);
              // const persona_id = encrypt('0');
              // window.localStorage.setItem('persona_id', persona_id);
              reject(false);
            }
          }, 500);
        });
    });
  }

  public getPrograma(): number {
    return parseInt(window.localStorage.getItem('programa')!, 10);
  }

  public getUsuario(): string {
    return window.localStorage.getItem('usuario')!.toString();
  }

  public async getPersonaId(): Promise<number | null> {
    return new Promise((resolve, reject) => {
      const personaId = window.localStorage.getItem('persona_id');
      if (personaId === null) {
        resolve(null);
      } else {
        try {
          resolve(decrypt(personaId));
        } catch (error) {
          reject(error);
        }
      }
    });
  }

  public getPersonaIdNew(): Promise<number> {
    return new Promise((resolve, reject) => {
      const strId = localStorage.getItem('persona_id');
      if (strId) {
        resolve(parseInt(strId, 10));
      } else {
        reject(new Error('No id found'));
      }
    });
  }

  public getPeriodo(): number {
    return parseInt(window.localStorage.getItem('IdPeriodo')!, 10);
  }

  public getUser() {
    return this.user$.asObservable();
  }
}
