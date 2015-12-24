'use strict';

module.exports = function() {

  function write(gen) {
    gen.log('Writing "zzfinish" using Webpack');

    var config = gen.getGlobalConfig();
    var outputDir = config.paths.config.configDir;

    // Add the NPM dev dependencies
    gen.setNpmDevDependencies({
      'lodash': '*'
    });

    gen.fs.copy(gen.toolTemplatePath('webpack.config.js'), gen.destinationPath(outputDir + 'webpack/webpack.config.js'));
    gen.fs.copy(gen.toolTemplatePath('dev.webpack.config.js'), gen.destinationPath(outputDir + 'webpack/dev.webpack.config.js'));
    gen.fs.copy(gen.toolTemplatePath('prod.webpack.config.js'), gen.destinationPath(outputDir + 'webpack/prod.webpack.config.js'));
  }

  return {
    write: write
  };
};
