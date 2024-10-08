import { environment } from "src/environments/environment"


export let FORM_FORMACION_ACADEMICA = {
  // titulo: 'FormacionAcademica',
  tipo_formulario: 'bySteps',
  alertas: true,
  btn: 'Guardar',
  btnLimpiar: 'Limpiar',
  modelo: 'InfoFormacionAcademica',
  campos: [
    {
      step: 1,
      etiqueta: 'input',
      claseGrid: 'col-lg-10 col-md-10 col-sm-9 col-xs-8',
      nombre: 'Nit',
      label_i18n: 'nit',
      placeholder_i18n: 'nit',
      requerido: true,
      tipo: 'text',
    },
    {
      step: 1,
      etiqueta: 'button',
      claseGrid: 'col-lg-2 col-md-2 col-sm-3 col-xs-4',
      nombre: 'BusquedaBoton',
      claseBoton: 'btn boton-primary',
      icono: 'fa fa-search',
      label_i18n: 'buscar',
    },
    {
      step: 1,
      etiqueta: 'select',
      claseGrid: 'col-lg-12 col-md-12 col-sm-12 col-xs-12',
      nombre: 'NombreUniversidad',
      label_i18n: 'nombre_universidad',
      placeholder_i18n: 'nombre_universidad',
      requerido: true,
      deshabilitar: true,
      tipo: 'InfoPersona',
      key: 'NombreCompleto',
      opciones: [],
      entrelazado: true,
    },
    {
      step: 1,
      etiqueta: 'select',
      claseGrid: 'col-lg-3 col-md-6 col-sm-12 col-xs-12',
      nombre: 'Pais',
      label_i18n: 'pais_universidad',
      placeholder_i18n: 'pais_universidad',
      requerido: true,
      deshabilitar: true,
      tipo: 'Lugar',
      key: 'Nombre',
      opciones: [],
    },
    {
      step: 1,
      etiqueta: 'input',
      claseGrid: 'col-lg-3 col-md-6 col-sm-12 col-xs-12',
      nombre: 'Direccion',
      label_i18n: 'direccion_universidad',
      placeholder_i18n: 'direccion_universidad',
      requerido: true,
      deshabilitar: true,
      tipo: 'text',
    },
    {
      step: 1,
      etiqueta: 'input',
      claseGrid: 'col-lg-3 col-md-6 col-sm-12 col-xs-12',
      nombre: 'Correo',
      label_i18n: 'correo_universidad',
      placeholder_i18n: 'correo_universidad',
      requerido: true,
      deshabilitar: true,
      tipo: 'text',
    },
    {
      step: 1,
      etiqueta: 'input',
      claseGrid: 'col-lg-3 col-md-6 col-sm-12 col-xs-12',
      nombre: 'Telefono',
      label_i18n: 'telefono_universidad',
      placeholder_i18n: 'telefono_universidad',
      requerido: true,
      deshabilitar: true,
      tipo: 'text',
    },
    /* {
      etiqueta: 'select',
      claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
      nombre: 'ProgramaAcademico',
      label_i18n: 'programa_academico',
      placeholder_i18n: 'programa_academico',
      requerido: true,
      tipo: 'ProgramaAcademico',
      key: 'Nombre',
      opciones: [],
    }, */
    {
      step: 2,
      etiqueta: 'autocomplete',
      claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
      nombre: 'ProgramaAcademico',
      label_i18n: 'programa_academico',
      placeholder_i18n: 'programa_academico',
      placeholder_i18n_2: 'programa_academico_autocomplete',
      path: environment.PARAMETROS_SERVICE,
      query: "parametro?query=Nombre__icontains:ROLE_TEXT_HERE,TipoParametroId__Id:60&limit=0",
      keyToFilter: 'ROLE_TEXT_HERE',
      requerido: true,
      tipo: 'text',
      key: 'Nombre',
      opciones: [],
      entrelazado: true,
    },
    {
      step: 2,
      etiqueta: 'button',
      claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
      nombre: 'FormacionBoton',
      claseBoton: 'btn boton-primary',
      icono: '',
      label_i18n: 'formacion_actual',
    },
    {
      step: 2,
      etiqueta: 'mat-date',
      claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
      nombre: 'FechaInicio',
      label_i18n: 'fecha_inicio',
      placeholder_i18n: 'fecha_inicio',
      requerido: true,
      tipo: 'date',
    },
    {
      step: 2,
      etiqueta: 'mat-date',
      claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
      nombre: 'FechaFinalizacion',
      label_i18n: 'fecha_fin',
      placeholder_i18n: 'fecha_fin',
      requerido: true,
      tipo: 'date',
      ocultar: false,
      deshabilitar: false,
      minDate: null,
      maxDate: new Date(),
    },
    {
      step: 2,
      etiqueta: 'input',
      claseGrid: 'col-lg-12 col-md-12 col-sm-12 col-xs-12',
      nombre: 'TituloTrabajoGrado',
      label_i18n: 'titulo_trabajo_grado',
      placeholder_i18n: 'titulo_trabajo_grado',
      requerido: true,
      tipo: 'text',
    },
    {
      step: 2,
      etiqueta: 'textarea',
      claseGrid: 'col-lg-12 col-md-12 col-sm-12 col-xs-12',
      nombre: 'DescripcionTrabajoGrado',
      label_i18n: 'descripcion_trabajo_grado',
      placeholder_i18n: 'descripcion_trabajo_grado',
      requerido: true,
      tipo: 'text',
      cantidadCaracteres: 400,
    },
    {
      step: 3,
      etiqueta: 'fileRev',
      claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
      clase: 'form-control',
      nombre: 'Documento',
      label_i18n: 'soporte_documento',
      placeholder_i18n: 'soporte_documento',
      requerido: true,
      tipo: 'pdf',
      tipoDocumento: 16,
      formatos: 'pdf',
      url: '',
      tamanoMaximo: 2,
    }
  ],
}

export let NUEVO_TERCERO = {
  // titulo: 'FormacionAcademica',
  tipo_formulario: 'mini',
  alertas: true,
  btn: 'Guardar',
  btnLimpiar: 'Limpiar',
  modelo: 'InfoFormacionAcademica',
  campos: [
    {
      etiqueta: 'input',
      claseGrid: 'col-lg-12 col-md-122 col-sm-12 col-xs-12',
      nombre: 'Nit',
      label_i18n: 'nit',
      placeholder_i18n: 'nit',
      requerido: true,
      tipo: 'text',
    },
    {
      etiqueta: 'input',
      claseGrid: 'col-lg-12 col-md-12 col-sm-12 col-xs-12',
      nombre: 'NombreCompleto',
      label_i18n: 'nombre_universidad',
      placeholder_i18n: 'nombre_universidad',
      requerido: true,
      tipo: 'InfoPersona',
      key: 'NombreCompleto',
      opciones: [],
      entrelazado: true,
    },
    {
      etiqueta: 'select',
      claseGrid: 'col-lg-3 col-md-6 col-sm-12 col-xs-12',
      nombre: 'Pais',
      label_i18n: 'pais_universidad',
      placeholder_i18n: 'pais_universidad',
      requerido: true,
      tipo: 'Lugar',
      key: 'Nombre',
      opciones: [],
    },
    {
      etiqueta: 'input',
      claseGrid: 'col-lg-3 col-md-6 col-sm-12 col-xs-12',
      nombre: 'Direccion',
      label_i18n: 'direccion_universidad',
      placeholder_i18n: 'direccion_universidad',
      requerido: true,
      tipo: 'text',
    },
    {
      etiqueta: 'input',
      claseGrid: 'col-lg-3 col-md-6 col-sm-12 col-xs-12',
      nombre: 'Correo',
      label_i18n: 'correo_universidad',
      placeholder_i18n: 'correo_universidad',
      requerido: true,
      tipo: 'email',
    },
    {
      etiqueta: 'input',
      claseGrid: 'col-lg-3 col-md-6 col-sm-12 col-xs-12',
      nombre: 'Telefono',
      label_i18n: 'telefono_universidad',
      placeholder_i18n: 'telefono_universidad',
      requerido: true,
      tipo: 'text',
    },
  ],
}

export let FORM_FORM_ACADEMICA = {
  // titulo: 'FormacionAcademica',
  tipo_formulario: 'mini',
  alertas: true,
  btn: 'Guardar',
  btnLimpiar: 'Limpiar',
  modelo: 'InfoFormacionAcademica',
  campos: [
    {
      etiqueta: 'autocomplete',
      claseGrid: 'col-lg-12 col-md-12 col-sm-12 col-xs-12',
      nombre: 'Buscador',
      label_i18n: 'buscador_entidad',
      placeholder_i18n: 'buscador_entidad',
      path: environment.TERCEROS_MID_SERVICE,
      query: "persona/consultar_terceros_con_nit?query=ROLE_TEXT_HERE",
      keyToFilter: 'ROLE_TEXT_HERE',
      requerido: true,
      tipo: 'text',
      key: 'Label',
      valor: "",
      opciones: [],
    },
    {
      etiqueta: 'input',
      claseGrid: 'col-lg-4 col-md-4 col-sm-4 col-xs-4',
      nombre: 'Nit',
      label_i18n: 'nit',
      placeholder_i18n: 'nit',
      requerido: true,
      tipo: 'text',
      deshabilitar: true
    },
    {
      etiqueta: 'select',
      claseGrid: 'col-lg-8 col-md-8 col-sm-8 col-xs-8',
      nombre: 'NombreUniversidad',
      label_i18n: 'nombre_universidad',
      placeholder_i18n: 'nombre_universidad',
      requerido: true,
      deshabilitar: true,
      tipo: 'InfoPersona',
      key: 'NombreCompleto',
      opciones: [],
      entrelazado: true,
    },
    {
      etiqueta: 'select',
      claseGrid: 'col-lg-3 col-md-6 col-sm-12 col-xs-12',
      nombre: 'Pais',
      label_i18n: 'pais_universidad',
      placeholder_i18n: 'pais_universidad',
      requerido: true,
      deshabilitar: true,
      tipo: 'Lugar',
      key: 'Nombre',
      opciones: [],
    },
    {
      etiqueta: 'input',
      claseGrid: 'col-lg-3 col-md-6 col-sm-12 col-xs-12',
      nombre: 'Direccion',
      label_i18n: 'direccion_universidad',
      placeholder_i18n: 'direccion_universidad',
      requerido: true,
      deshabilitar: true,
      tipo: 'text',
    },
    {
      etiqueta: 'input',
      claseGrid: 'col-lg-3 col-md-6 col-sm-12 col-xs-12',
      nombre: 'Correo',
      label_i18n: 'correo_universidad',
      placeholder_i18n: 'correo_universidad',
      requerido: true,
      deshabilitar: true,
      tipo: 'text',
    },
    {
      etiqueta: 'input',
      claseGrid: 'col-lg-3 col-md-6 col-sm-12 col-xs-12',
      nombre: 'Telefono',
      label_i18n: 'telefono_universidad',
      placeholder_i18n: 'telefono_universidad',
      requerido: true,
      deshabilitar: true,
      tipo: 'text',
    }
  ],
}


