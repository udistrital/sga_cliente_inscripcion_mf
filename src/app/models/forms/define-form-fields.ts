export class SoporteParams {
  [name: string]: Param;
}

export class Param {
    archivosLocal?: any[];
    archivosLinea?: any[];
    archivosDelete?: any[];
    tipoArchivos?: string;
    tamMBArchivos?: number;
    validaArchivos?: { errTipo: boolean, errTam: boolean };
  }