
import { GrupoInvestigacion } from '../investigacion/grupo_investigacion';
import { TipoProyecto } from '../investigacion/tipo_proyecto';
import { Inscripcion } from './inscripcion';

export class PropuestaGrado {
  Id!: number;
  Nombre!: string;
  Resumen!: string;
  GrupoInvestigacion!: GrupoInvestigacion;
  LineaInvestigacion: any;
  FormatoProyecto!: string;
  DocumentoId!: number;
  GrupoInvestigacionId!: number;
  LineaInvestigacionId!: number;
  InscripcionId!: Inscripcion;
  TipoProyecto!: TipoProyecto;
  TipoProyectoId!: TipoProyecto;
  Soporte: any;
}
