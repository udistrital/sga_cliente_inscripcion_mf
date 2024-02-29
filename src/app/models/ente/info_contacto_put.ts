import { ContactoEnte } from './contacto_ente';
import { UbicacionEntePut } from './ubicacion_ente_put';

export class InfoContactoPut {
  Ente!: number;
  Persona!: number;
  ContactoEnte!: ContactoEnte[];
  UbicacionEnte!: UbicacionEntePut;
}
