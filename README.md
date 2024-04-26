# sga_cliente_inscripcion_mf

Cliente para la gestión de inscripciones, parte del Sistema de Gestión Académica. Este proyecto está desarrollado con Angular.

## Especificaciones Técnicas

### Tecnologías Implementadas y Versiones

- [Angular](https://angular.io/docs) 16.0.0
  - Incluye Animations, Common, Compiler, Core, Forms, Platform-Browser, Platform-Browser-Dynamic, Router
- [Angular Material](https://material.angular.io/) 16.2.14
- [Angular CDK](https://material.angular.io/cdk/categories) 16.2.14
- [ngx-translate](https://github.com/ngx-translate/core) 15.0.0
- [NG Bootstrap](https://ng-bootstrap.github.io/#/home) 15.1.2
- [NgRx Store](https://ngrx.io/docs) 16.3.0
- [ngx-translate Http Loader](https://github.com/ngx-translate/http-loader) 8.0.0
- [NGXS Store](https://www.ngxs.io/) 3.8.2
- [Popper.js](https://popper.js.org/docs/v2/) 2.11.6
- [Bootstrap](https://getbootstrap.com/) 5.2.3
- [JSZip](https://stuk.github.io/jszip/) 3.10.1
- [Moment Timezone](https://momentjs.com/timezone/docs/) 0.5.45
- [ng2-pdf-viewer](https://vadimdez.github.io/ng2-pdf-viewer/) 10.0.0
- [ngx-extended-pdf-viewer](https://www.npmjs.com/package/ngx-extended-pdf-viewer) 19.3.0
- [RxJS](https://rxjs.dev/guide/overview) ~7.8.0
- [Single-spa](https://single-spa.js.org/) 9.0.1
  - Incluye single-spa-angular
- [SweetAlert2](https://sweetalert2.github.io/) 11.10.5
- [ts-md5](https://github.com/cotag/ts-md5) 1.3.1
- [tslib](https://github.com/Microsoft/tslib) 2.3.0
- [Zone.js](https://github.com/angular/angular/tree/master/packages/zone.js) ~0.13.0


### Variables de Entorno

```javascript
export const environment = {
  production: false,
  apiUrl:"http://localhost:4209/",
  NUXEO_SERVICE: '',
  TOKEN: {
    AUTORIZATION_URL: '',
    CLIENTE_ID: '',
    RESPONSE_TYPE: '',
    SCOPE: '',
    REDIRECT_URL: '',
    SIGN_OUT_URL: '',
    SIGN_OUT_REDIRECT_URL: '',
    AUTENTICACION_MID: '',
  },
  TERCEROS_SERVICE: '',
  PRODUCCION_ACADEMICA_SERVICE: '',
  DOCUMENTO_SERVICE: '',
  CAMPUS_MID: '',
  CORE_SERVICE: '',
  EVENTO_SERVICE: '',
  PROYECTO_ACADEMICO_SERVICE: '',
  SGA_MID_SERVICE: '',
  INSCRIPCION_SERVICE: '',
  UBICACION_SERVICE: '',
  DOCUMENTO_PROGRAMA_SERVICE: '',
  EXPERIENCIA_SERVICE: '',
  IDIOMA_SERVICE: '',
  ENTE_SERVICE: '',
  ORGANIZACION_SERVICE: '',
  DESCUENTO_ACADEMICO_SERVICE: '',
  CIDC_SERVICE: '',
  EVALUACION_INSCRIPCION_SERVICE: '',
  PARAMETROS_SERVICE: '',
  PSE_SERVICE: '',
  ESPACIOS_ACADEMICOS_SERVICE: '',
  PLAN_ESTUDIOS_SERVICE: '',
  SGA_MID_TERCERO: '',
};
```
## Ejecución del Proyecto

Este proyecto es parte de una infraestructura de microfrontend implementada con la librería Single-SPA. Para ejecutarlo correctamente, es necesario levantar dos aplicaciones independientes: el **Root** y el **Core**.

### Root

El Root contiene la lógica de Single-SPA.

### Pasos para la Ejecución del Root

1. Clonar el repositorio del Root: 

    ```bash
    git clone https://github.com/udistrital/sga_cliente_root
    ```

2. Acceder al directorio del repositorio clonado:

    ```bash
    cd sga_cliente_root
    ```

3. Instalar las dependencias:

    ```bash
    npm install
    ```

4. Iniciar el Root:
    ```bash
    npm start
    ```


### Core

El Core contiene componentes generales que construyen el layout y administran aspectos como la autenticación.

#### Pasos para la Ejecución del Core

1. Clonar el repositorio del Core:

    ```bash
    git clone https://github.com/udistrital/core_mf_cliente
    ```

2. Acceder al directorio del repositorio clonado:

    ```bash
    cd core_mf_cliente
    ```

3. Instalar las dependencias:

    ```bash
    npm install
    ```

4. Iniciar el Core:

    ```bash
    npm start
    ```

### Ejecución de sga_cliente_inscripcion_mf

Una vez que el Root y el Core estén en ejecución, se procede a clonar y ejecutar este proyecto.

#### Pasos para la Ejecución

1. Clonar este repositorio

    ```bash
    git clone git@github.com:udistrital/sga_cliente_inscripcion_mf.git

    ||

    git clone https://github.com/udistrital/sga_cliente_inscripcion_mf
    ```

2. Acceder al directorio del repositorio clonado:

    ```bash
    cd sga_cliente_inscripcion_mf
    ```

3. Instalar las dependencias:

    ```bash
    npm install
    ```

4. Iniciar el proyecto:

    ```bash
    npm start
    ```


Con estos pasos, se tendrán las partes mínimas necesarias para ejecutar el proyecto en un entorno local.


## Ejecución Dockerfile
```bash
# Does not apply
```
## Ejecución docker-compose
```bash
# Does not apply
```
## Ejecución Pruebas

Pruebas unitarias powered by Jest
```bash
# run unit test
npm run test
# Runt linter + unit test
npm run test:ui
```

## Estado CI

| Develop | Relese 0.0.1 | Master |
| -- | -- | -- |
| [![Build Status](https://hubci.portaloas.udistrital.edu.co/api/badges/udistrital/sga_cliente_inscripcion_mf/status.svg?ref=refs/heads/develop)](https://hubci.portaloas.udistrital.edu.co/udistrital/sga_cliente_inscripcion_mf) | [![Build Status](https://hubci.portaloas.udistrital.edu.co/api/badges/udistrital/sga_cliente_inscripcion_mf/status.svg?ref=refs/heads/release/0.0.1)](https://hubci.portaloas.udistrital.edu.co/udistrital/sga_cliente_inscripcion_mf) | Copied
[![Build Status](https://hubci.portaloas.udistrital.edu.co/api/badges/udistrital/sga_cliente_inscripcion_mf/status.svg)](https://hubci.portaloas.udistrital.edu.co/udistrital/sga_cliente_inscripcion_mf) |

## Licencia

[This file is part of sga_cliente_inscripcion_mf.](LICENSE)

sga_cliente_inscripcion_mf is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (atSara Sampaio your option) any later version.

sga_cliente_inscripcion_mf is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with sga_cliente_inscripcion_mf. If not, see https://www.gnu.org/licenses/.
