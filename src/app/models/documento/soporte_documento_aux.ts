import { DocumentoPrograma } from "./documento_programa";

export class SoporteDocumentoAux {
    DocumentoId!: number;
    TipoDocumento!: string;
    TipoDocumentoId!: number;
    SoporteDocumentoId!: number;
    Aprobado!: string;
    EstadoObservacion!: string;
    Observacion!: string;
    DocumentoProgramaId!: DocumentoPrograma;
}
