export let FORM_ICFES = {
  // titulo: 'FormacionAcademica',
  tipo_formulario: 'mini',
  alertas: true,
  btn: 'Guardar',
  btnLimpiar: 'Limpiar',
  modelo: 'InfoIcfes',
  campos: [
    {
      etiqueta: 'select',
      claseGrid: 'col-lg-12 col-md-12 col-sm-12 col-xs-12',
      nombre: 'TipoIcfes',
      label_i18n: 'tipo_icfes',
      placeholder_i18n: 'tipo_icfes',
      requerido: true,
      tipo: 'ICFES',
      key: 'Nombre',
      opciones: [],
    },
    {
      etiqueta: 'inputConfirmacion',
      claseGrid: 'col-lg-6 col-md-6 col-sm-10 col-xs-10',
      nombre: 'NúmeroRegistroIcfes',
      label_i18n: 'numero_registro',
      placeholder_i18n: 'numero_registro',
      requerido: true,
      tipo: 'text',
      correo1: true,
    },
    {
      etiqueta: 'inputConfirmacion',
      claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
      nombre: 'NúmeroRegistroIcfesConfirmar',
      label_i18n: 'confirme_numero_registro',
      placeholder_i18n: 'confirme_numero_registro',
      requerido: true,
      tipo: 'text',
      validarIguales: true,
      iguales: false,
      mensajeIguales: 'El campo no es igual al campo Numero del registo icfes!',
      correo2: true,
    },
    {
      etiqueta: 'select',
      claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
      nombre: 'Valido',
      label_i18n: 'valido_colegio',
      placeholder_i18n: 'valido_colegio',
      requerido: true,
      opciones: [
        {
          'Id': 'Si',
        },
        {
          'Id': 'No',
        },
      ],
      key: 'Id',
    },
    {
      etiqueta: 'select',
      claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
      nombre: 'numeroSemestres',
      label_i18n: 'numero_semestres',
      placeholder_i18n: 'numero_semestres',
      requerido: true,
      key: 'Nombre',
      opciones: [],
    },
    {
      etiqueta: 'select',
      claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
      nombre: 'PaisResidencia',
      label_i18n: 'localidad_colegio',
      placeholder_i18n: 'localidad_colegio',
      requerido: true,
      tipo: 'Lugar',
      key: 'Nombre',
      opciones: [],
      entrelazado: true,
    },
    {
      etiqueta: 'select',
      claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
      nombre: 'DepartamentoResidencia',
      label_i18n: 'departamento_colegio',
      placeholder_i18n: 'departamento_colegio',
      requerido: true,
      tipo: 'Lugar',
      key: 'Nombre',
      opciones: [],
      entrelazado: true,
    },
    {
      etiqueta: 'select',
      claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
      nombre: 'CiudadResidencia',
      label_i18n: 'ciudad_colegio',
      placeholder_i18n: 'ciudad_colegio',
      requerido: true,
      tipo: 'Lugar',
      key: 'Nombre',
      opciones: [],
    },
    {
      etiqueta: 'select',
      claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
      nombre: 'Tipo',
      label_i18n: 'tipo_colegio',
      placeholder_i18n: 'tipo_colegio',
      requerido: true,
      ocultar: true,
      tipo: 'Lugar',
      key: 'Id',
      opciones: [{
        'Id': 'Oficial',
      },
      {
        'Id': 'Privado',
      },
      ],
      entrelazado: true,
    },
    {
      etiqueta: 'select',
      claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
      nombre: 'Colegio',
      label_i18n: 'colegio',
      placeholder_i18n: 'colegio',
      requerido: true,
      ocultar: true,
      tipo: 'Lugar',
      key: 'NombreCompleto',
      opciones: [],
    },
    {
      etiqueta: 'input',
      claseGrid: 'col-lg-12 col-md-12 col-sm-12 col-xs-12',
      nombre: 'NombreColegio',
      label_i18n: 'Nombrecolegio',
      placeholder_i18n: 'Nombrecolegio',
      requerido: true,
      ocultar: true,
      tipo: 'text',
    },
    {
      etiqueta: 'input',
      claseGrid: 'col-lg-12 col-md-12 col-sm-12 col-xs-12',
      nombre: 'DireccionColegio',
      label_i18n: 'DireccionColegio',
      placeholder_i18n: 'DireccionColegio',
      requerido: true,
      ocultar: true,
      tipo: 'text',
    },
  ],
}
