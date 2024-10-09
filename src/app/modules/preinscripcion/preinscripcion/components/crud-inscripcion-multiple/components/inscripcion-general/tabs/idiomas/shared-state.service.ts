import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class SharedStateService {
    private idiomaExamen = new BehaviorSubject<null | number>(null);
    idiomaExamen$ = this.idiomaExamen.asObservable();

    setIdiomaExamen(idioma: null | number) {
        this.idiomaExamen.next(idioma);
    }

    getIdiomaExamen() {
        return this.idiomaExamen.getValue();
    }
}