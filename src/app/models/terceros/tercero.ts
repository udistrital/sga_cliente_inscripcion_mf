import { TipoContribuyente } from './tipo_contribuyente';

export class Tercero {
  Id!: number;
  NombreCompleto: string | undefined;
  TipoContribuyenteId!: TipoContribuyente;
  PuedeBorrar?: boolean;
}
