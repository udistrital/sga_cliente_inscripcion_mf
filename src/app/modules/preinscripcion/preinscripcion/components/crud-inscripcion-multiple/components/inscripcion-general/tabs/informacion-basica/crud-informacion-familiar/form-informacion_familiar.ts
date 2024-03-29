export let FORM_INFORMACION_FAMILIAR = {
    // titulo: 'Informacion familiar principal',
    tipo_formulario: 'mini',
    btn: 'Guardar',
    alertas: true,
    modelo: 'InformacionFamiliar',
    campos: [
        {
            etiqueta: 'input',
            claseGrid: 'col-lg-12 col-md-12 col-sm-12 col-xs-12',
            nombre: 'NombreFamiliarPrincipal',
            label_i18n: 'nombre_familiar',
            placeholder_i18n: 'nombre_familiar',
            requerido: true,
            tipo: 'text',
        },
        {
            etiqueta: 'input',
            claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
            nombre: 'CorreoElectronico',
            label_i18n: 'correo_principal',
            placeholder_i18n: 'correo_principal',
            requerido: true,
            tipo: 'text',
        },
        {
            etiqueta: 'input',
            claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
            nombre: 'Telefono',
            label_i18n: 'telefono',
            placeholder_i18n: 'telefono',
            requerido: true,
            tipo: 'number',
            minimo: 1000,
        },
        {
            etiqueta: 'input',
            claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
            nombre: 'DireccionResidencia',
            label_i18n: 'direccion_residencia',
            placeholder_i18n: 'direccion_residencia',
            requerido: true,
            tipo: 'text',
        },
        {
            etiqueta: 'select',
            claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
            nombre: 'Parentesco',
            label_i18n: 'parentesco',
            placeholder_i18n: 'parentesco',
            requerido: true,
            tipo: 'Parentesco',
            key: 'Nombre',
            opciones: [],
        },
        {
            etiqueta: 'input',
            claseGrid: 'col-lg-12 col-md-12 col-sm-12 col-xs-12',
            nombre: 'NombreFamiliarAlterno',
            label_i18n: 'nombre_familiar_alterno',
            placeholder_i18n: 'nombre_familiar_alterno',
            requerido: true,
            tipo: 'text',
        },
        {
            etiqueta: 'input',
            claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
            nombre: 'CorreoElectronicoAlterno',
            label_i18n: 'correo_alterno',
            placeholder_i18n: 'correo_principal_alterno',
            requerido: true,
            tipo: 'text',
        },
        {
            etiqueta: 'input',
            claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
            nombre: 'TelefonoAlterno',
            label_i18n: 'telefono',
            placeholder_i18n: 'telefono',
            requerido: true,
            tipo: 'number',
            minimo: 1000,
        },
        {
            etiqueta: 'input',
            claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
            nombre: 'DireccionResidenciaAlterno',
            label_i18n: 'direccion_residencia',
            placeholder_i18n: 'direccion_residencia',
            requerido: true,
            tipo: 'text',
        },
        {
            etiqueta: 'select',
            claseGrid: 'col-lg-6 col-md-6 col-sm-12 col-xs-12',
            nombre: 'ParentescoAlterno',
            label_i18n: 'parentesco',
            placeholder_i18n: 'parentesco',
            requerido: true,
            tipo: 'Parentesco',
            key: 'Nombre',
            opciones: [],
        },
    ],
}
