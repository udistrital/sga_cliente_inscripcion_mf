import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ConfiguracionService } from '../services/configuracion.service';

@Injectable({ providedIn: 'root' })
export class PermisosUtils {
  constructor(private readonly configuracionService: ConfiguracionService) {}

  /**
   * Consulta en una sola llamada si los roles dados tienen permiso sobre cada opción.
   * Retorna un mapa opción → boolean; arranca en false hasta recibir respuesta.
   */
  obtenerPermisos(roles: string[], opciones: string[]): Observable<Record<string, boolean>> {
    const vacio = opciones.reduce(
      (acc, op) => ({ ...acc, [op]: false }),
      {} as Record<string, boolean>
    );
    if (!roles.length || !opciones.length) return of(vacio);
    const endpoint = `perfil_x_menu_opcion?limit=-1&query=Opcion__Nombre__in:${opciones.join('|')},Perfil__Nombre__in:${roles.join('|')}`;
    return this.configuracionService.get(endpoint).pipe(
      map((response: any) => {
        let data: any[];
        if (Array.isArray(response?.Data)) {
          data = response.Data;
        } else if (Array.isArray(response)) {
          data = response;
        } else {
          data = [];
        }
        const concedidos = new Set(
          data.map((row: any) => row?.Opcion?.Nombre).filter(Boolean)
        );
        return opciones.reduce(
          (acc, op) => ({ ...acc, [op]: concedidos.has(op) }),
          {} as Record<string, boolean>
        );
      }),
      catchError(() => of(vacio))
    );
  }
}
