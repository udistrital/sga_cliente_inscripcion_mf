
import { Calendario } from "../calendario-academico/calendario";
import { Periodo } from "../periodo/periodo";
import { ProyectoAcademicoInstitucion } from "../proyecto_academico/proyecto_academico_institucion";
import { InfoComplementariaTercero } from "../terceros/info_complementaria_tercero";
import { TipoInscripcion } from "./tipo_inscripcion";

export class TransferenciaInterna {
    Periodo: Periodo | null = new Periodo;
    CalendarioAcademico: Calendario | null = new Calendario;
    TipoInscripcion: TipoInscripcion | null = new TipoInscripcion;
    CodigoEstudiante: InfoComplementariaTercero | null = new InfoComplementariaTercero;
    ProyectoCurricular: ProyectoAcademicoInstitucion | null = new ProyectoAcademicoInstitucion;
}
