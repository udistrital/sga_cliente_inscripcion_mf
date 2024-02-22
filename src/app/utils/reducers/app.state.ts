
// import { TipoPublicacionLibro } from '../data/models/tipo_publicacion_libro';

import { TipoDocumento } from "src/app/models/documento/tipo_documento";
import { ClasificacionNivelIdioma } from "src/app/models/idioma/clasificacion_idioma";
import { Idioma } from "src/app/models/idioma/idioma";
import { NivelIdioma } from "src/app/models/idioma/nivel_idioma";
import { EstadoCivil } from "src/app/models/informacion/estado_civil";
import { Genero } from "src/app/models/informacion/genero";
import { IdentidadGenero } from "src/app/models/informacion/identidad_genero";
import { Lugar } from "src/app/models/informacion/lugar";
import { OrientacionSexual } from "src/app/models/informacion/orientacion_sexual";
import { TipoContacto } from "src/app/models/informacion/tipo_contacto";
import { TipoDiscapacidad } from "src/app/models/informacion/tipo_discapacidad";
import { TipoIdentificacion } from "src/app/models/informacion/tipo_identificacion";
import { TipoLugar } from "src/app/models/informacion/tipo_lugar";
import { TipoPoblacion } from "src/app/models/informacion/tipo_poblacion";
import { EstadoInscripcion } from "src/app/models/inscripcion/estado_inscripcion";
import { Titulacion } from "src/app/models/inscripcion/titulacion";
import { GrupoInvestigacion } from "src/app/models/investigacion/grupo_investigacion";
import { LineaInvestigacion } from "src/app/models/investigacion/linea_investigacion";
import { TipoProyecto } from "src/app/models/investigacion/tipo_proyecto";
import { TipoParametro } from "src/app/models/parametro/tipo_parametro";
import { PeriodoAcademico } from "src/app/models/periodo/periodo_academico";
import { Metodologia } from "src/app/models/proyecto_academico/metodologia";
import { NivelFormacion } from "src/app/models/proyecto_academico/nivel_formacion";
import { ProgramaAcademico } from "src/app/models/proyecto_academico/programa_academico";
import { InfoComplementaria } from "src/app/models/terceros/info_complementaria";
import { TipoContribuyente } from "src/app/models/terceros/tipo_contribuyente";
import { TipoTercero } from "src/app/models/terceros/tipo_tercero";

export interface IAppState {
  listGenero: Genero[],
  listOrientacionSexual: OrientacionSexual[],
  listIdentidadGenero: IdentidadGenero[],
  listClasificacionNivelIdioma: ClasificacionNivelIdioma[],
  listEstadoInscripcion: EstadoInscripcion[],
  listEstadoCivil: EstadoCivil[],
  listGrupoSanguineo: Genero[] ,
  listFactorRh: Genero [],
  listICFES: Genero [],
  listEPS: Genero [],
  listTipoPoblacion: TipoPoblacion[],
  listIdioma: Idioma[],
  listLineaInvestigacion: LineaInvestigacion[],
  listTipoParametro: TipoParametro[],
  listPais: Lugar[],
  listCiudad: Lugar[],
  listLugar: Lugar[],
  listMetodologia: Metodologia[],
  listNivelFormacion: NivelFormacion[],
  listNivelIdioma: NivelIdioma[],
  listProgramaAcademico: ProgramaAcademico[],
  listTipoContribuyente: TipoContribuyente[],
  listTipoDocumento: TipoDocumento[],
  listTipoContacto: TipoContacto[],
  listTipoDiscapacidad: TipoDiscapacidad[],
  listTipoLugar: TipoLugar[],
  listTitulacion: Titulacion[],
  listTipoIdentificacion: TipoIdentificacion[],
  listTipoProyecto: TipoProyecto[],
  listGrupoInvestigacion: GrupoInvestigacion[],
  listPeriodoAcademico: PeriodoAcademico[],
  listLocalidadesBogota: InfoComplementaria[],
  listTipoColegio: InfoComplementaria[],
  listSemestresSinEstudiar: InfoComplementaria[],
  listMediosEnteroUniversidad: InfoComplementaria[],
  listSePresentaAUniversidadPor: InfoComplementaria[],
  listTipoInscripcionUniversidad: InfoComplementaria[],
  listTipoDedicacion: InfoComplementaria[],
  listTipoVinculacion: InfoComplementaria[],
  listTipoTercero: TipoTercero[],
  listCargo: InfoComplementaria[],
  listTipoOrganizacion: InfoComplementaria[],
  listDocumentoPrograma: any[],
  listDescuentoDependencia: any[],
  listInfoSocioEconomica: InfoComplementaria[],
  listInfoContacto: InfoComplementaria[],
  // listTipoPublicacionLibro: TipoPublicacionLibro[],
}
