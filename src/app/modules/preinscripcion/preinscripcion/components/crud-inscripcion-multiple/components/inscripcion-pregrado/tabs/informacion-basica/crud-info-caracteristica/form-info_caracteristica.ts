export let FORM_INFO_CARACTERISTICA = {
  // titulo: 'InfoCaracteristica',
  tipo_formulario: 'mini',
  btn: 'Guardar',
  alertas: true,
  modelo: 'InfoCaracteristica',
  campos: [
    {
      etiqueta: 'select',
      relacion: false,
      claseGrid: 'col-lg-3 col-md-6 col-sm-12 col-xs-12',
      nombre: 'GrupoSanguineo',
      label_i18n: 'grupo_sanguineo',
      placeholder_i18n: 'grupo_sanguineo',
      requerido: true,
      tipo: 'text',
      opciones: [],
      key: 'Nombre',
    },
    {
      etiqueta: 'select',
      claseGrid: 'col-lg-3 col-md-6 col-sm-12 col-xs-12',
      nombre: 'Rh',
      relacion: false,
      label_i18n: 'rh',
      placeholder_i18n: 'rh',
      requerido: true,
      tipo: 'text',
      opciones: [],
      key: 'Nombre',
    },
    {
      etiqueta: 'select',
      claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
      nombre: 'PaisNacimiento',
      label_i18n: 'pais_nacimiento',
      placeholder_i18n: 'pais_nacimiento',
      requerido: true,
      tipo: 'Lugar',
      key: 'Nombre',
      opciones: [],
      entrelazado: true,
    },
    {
      etiqueta: 'select',
      claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
      nombre: 'DepartamentoNacimiento',
      label_i18n: 'departamento_nacimiento',
      placeholder_i18n: 'departamento_nacimiento',
      requerido: true,
      tipo: 'Lugar',
      key: 'Nombre',
      opciones: [],
      entrelazado: true,
    },
    {
      etiqueta: 'select',
      claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
      nombre: 'Lugar',
      label_i18n: 'ciudad_nacimiento',
      placeholder_i18n: 'ciudad_nacimiento',
      requerido: true,
      tipo: 'Lugar',
      key: 'Nombre',
      opciones: [],
    },
    {
      etiqueta: 'selectmultiple',
      claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
      nombre: 'TipoPoblacion',
      label_i18n: 'tipo_poclacion',
      placeholder_i18n: 'tipo_poclacion',
      requerido: true,
      tipo: 'TipoPoblacion',
      key: 'Nombre',
      opciones: [],
      entrelazado: true,
    },
    {
      etiqueta: 'selectmultiple',
      claseGrid: 'col-lg-6 col-md-6 col-sm-6 col-xs-6',
      nombre: 'TipoDiscapacidad',
      label_i18n: 'tipo_discapacidad',
      placeholder_i18n: 'tipo_discapacidad',
      requerido: true,
      tipo: 'TipoDiscapacidad',
      key: 'Nombre',
      opciones: [],
      entrelazado: true,
    },
    {
      etiqueta: 'fileRev',
      claseGrid: 'col-lg-6 col-md-6 col-sm-6 col-xs-6',
      clase: 'form-control',
      nombre: 'ComprobantePoblacion',
      label_i18n: 'comprobante_poblacion',
      placeholder_i18n: 'comprobante_poblacion',
      requerido: true,
      tipo: 'pdf',
      tipoDocumento: 64,
      formatos: 'pdf',
      url: '',
      tamanoMaximo: 2,
      ocultar: true,
    },
    {
      etiqueta: 'fileRev',
      claseGrid: 'col-lg-6 col-md-6 col-sm-6 col-xs-6',
      clase: 'form-control',
      nombre: 'ComprobanteDiscapacidad',
      label_i18n: 'comprobante_discapacidad',
      placeholder_i18n: 'comprobante_discapacidad',
      requerido: true,
      tipo: 'pdf',
      tipoDocumento: 64,
      formatos: 'pdf',
      url: '',
      tamanoMaximo: 2,
      ocultar: true,
    },
    {
      etiqueta: 'select',
      claseGrid: 'col-lg-4 col-md-6 col-sm-12 col-xs-12',
      nombre: 'EstadoCivil',
      label_i18n: 'estado_civil',
      placeholder_i18n: 'estado_civil',
      requerido: true,
      tipo: 'EstadoCivil',
      key: 'Nombre',
      opciones: [],
  },
  {
      etiqueta: 'select',
      claseGrid: 'col-lg-4 col-md-6 col-sm-12 col-xs-12',
      nombre: 'OrientacionSexual',
      label_i18n: 'orientacion_sexual',
      placeholder_i18n: 'orientacion_sexual',
      requerido: true,
      tipo: 'OrientacionSexual',
      key: 'Nombre',
      opciones: [],
  },
  {
      etiqueta: 'select',
      claseGrid: 'col-lg-4 col-md-6 col-sm-12 col-xs-12',
      nombre: 'IdentidadGenero',
      label_i18n: 'identidad_genero',
      placeholder_i18n: 'identidad_genero',
      requerido: true,
      tipo: 'IdentidadGenero',
      key: 'Nombre',
      opciones: [],
  }
  ],
}