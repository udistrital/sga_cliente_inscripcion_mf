import { Lugar } from './lugar';

export class InformacionContacto {
  PaisResidencia: Lugar = new Lugar;
  DepartamentoResidencia: Lugar = new Lugar;
  CiudadResidencia: Lugar = new Lugar;
  DireccionResidencia!: string;
  EstratoResidencia!: number;
  CodigoPostal!: string;
  Telefono!: string;
  Correo!: string;
  CorreoAlterno!: string;
  TelefonoAlterno!: string;
  Ente!: number;
  IdLugarEnte!: number;
  IdDireccionEnte!: number;
  IdEstratoEnte!: number;
  IdCodigoEnte!: number;
  IdTelefonoEnte!: number;
  IdTelefonoAlternoEnte!: number;
  LocalidadResidencia: any;
  IdCorreo!: number;
  IdCorreoAlterno!: number;
}
