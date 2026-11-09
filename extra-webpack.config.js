const singleSpaAngularWebpack = require('single-spa-angular/lib/webpack').default;

module.exports = (config, options) => {
  const singleSpaWebpackConfig = singleSpaAngularWebpack(config, options);

  // Prevent source map conflict: Angular 20+ handles source maps via SourceMapDevToolPlugin
  singleSpaWebpackConfig.devtool = false;

  // CORS para desarrollo local: permite que el root (localhost:4200) cargue este MF
  // cross-origin via SystemJS. Solo tiene efecto en ng serve; no aplica a builds de despliegue.
  // Nota: @angular-builders/custom-webpack:dev-server v21 no aplica devServer.headers al vuelo;
  // se requiere inyección directa como Express middleware via setupMiddlewares.
  singleSpaWebpackConfig.devServer = {
    ...singleSpaWebpackConfig.devServer,
    setupMiddlewares: (middlewares, devServer) => {
      middlewares.unshift({
        name: 'cors-local-dev',
        middleware: (req, res, next) => {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', '*');
          res.setHeader('Access-Control-Allow-Headers', '*');
          next();
        },
      });
      return middlewares;
    },
  };

  return singleSpaWebpackConfig;
};
