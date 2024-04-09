/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

export const environment = {
  production: false,
  apiUrl:"http://localhost:4209/",
  NUXEO_SERVICE: 'http://pruebasapi2.intranetoas.udistrital.edu.co:8199/v1',
  TOKEN: {
    AUTORIZATION_URL: 'https://autenticacion.portaloas.udistrital.edu.co/oauth2/authorize',
    CLIENTE_ID: 'e36v1MPQk2jbz9KM4SmKhk8Cyw0a',
    RESPONSE_TYPE: 'id_token token',
    SCOPE: 'openid email role documento',
    REDIRECT_URL: 'http://localhost:4200/',
    SIGN_OUT_URL: 'https://autenticacion.portaloas.udistrital.edu.co/oidc/logout',
    SIGN_OUT_REDIRECT_URL: 'http://localhost:4200/',
    AUTENTICACION_MID: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/autenticacion_mid/v1/token/userRol',
  },
  TERCEROS_SERVICE: 'http://pruebasapi.intranetoas.udistrital.edu.co:8121/v1/',
  PRODUCCION_ACADEMICA_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/produccion_academica_crud/v2/',
  DOCUMENTO_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/documento_crud/v2/',
  CAMPUS_MID: 'http://localhost:8095/v1/',
  CORE_SERVICE: 'http://pruebasapi2.intranetoas.udistrital.edu.co:8105/v1/',
  EVENTO_SERVICE: 'http://pruebasapi2.intranetoas.udistrital.edu.co:8107/v1/',
  PROYECTO_ACADEMICO_SERVICE: 'http://pruebasapi.intranetoas.udistrital.edu.co:8116/v1/',
  SGA_MID_SERVICE: 'http://pruebasapi.intranetoas.udistrital.edu.co:8119/v1/',
  INSCRIPCION_SERVICE: 'http://pruebasapi2.intranetoas.udistrital.edu.co:8208/v1/',
  UBICACION_SERVICE: 'http://pruebasapi2.intranetoas.udistrital.edu.co:8085/v1/',
  DOCUMENTO_PROGRAMA_SERVICE: 'http://api.planestic.udistrital.edu.co:9014/v1/',
  EXPERIENCIA_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/experiencia_laboral_crud/v1/',
  IDIOMA_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/idiomas_crud/v2/',
  ENTE_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/ente_crud/v1/',
  ORGANIZACION_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/organizacion_crud/v1/',
  DESCUENTO_ACADEMICO_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/matriculas_descuentos_crud/v2/',
  CIDC_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/siciud_crud/v1/',
  EVALUACION_INSCRIPCION_SERVICE: 'http://pruebasapi2.intranetoas.udistrital.edu.co:8118/v1/',
  PARAMETROS_SERVICE: 'http://pruebasapi.intranetoas.udistrital.edu.co:8510/v1/',
  PSE_SERVICE: 'https://pruebasfuncionarios.portaloas.udistrital.edu.co/botonPago/index.php?',
  ESPACIOS_ACADEMICOS_SERVICE: 'http://pruebasapi2.intranetoas.udistrital.edu.co:8530/',
  PLAN_TRABAJO_DOCENTE_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/plan_trabajo_docente_crud/v1/',
  PLAN_ESTUDIOS_SERVICE: 'http://pruebasapi.intranetoas.udistrital.edu.co:8537/v1/',
  SGA_MID_TERCERO: 'http://pruebasapi.intranetoas.udistrital.edu.co:8119/v1/',
};
