const singleSpaAngularWebpack = require('single-spa-angular/lib/webpack').default;

module.exports = (config, options) => {
  const singleSpaWebpackConfig = singleSpaAngularWebpack(config, options);

  // Prevent source map conflict: Angular 20+ handles source maps via SourceMapDevToolPlugin
  singleSpaWebpackConfig.devtool = false;

  return singleSpaWebpackConfig;
};
