'use strict';
const confitGen = require('../../core/ConfitGenerator.js');
const chalk = require('chalk');
const _ = require('lodash');

let genDefaults = {};

module.exports = confitGen.create({
  initializing: {
    init: function() {
      // Check if this component has an existing config. If it doesn't even if we are asked to rebuild, don't rebuild
      this.rebuildFromConfig = Boolean(this.options.rebuildFromConfig) && this.hasExistingConfig();

      let resources = this.getResources().paths;

      genDefaults = this.merge(resources.defaults, this.getConfig());    // Must use merge() in case the existing config does not have all the same keys
    },
  },

  prompting: function() {
    // Bail out if we just want to rebuild from the configuration file
    if (this.rebuildFromConfig || this.useDefaults) {
      return;
    }

    this.displayTitle('Project Path Generator');

    let resources = this.getResources().paths;
    let pathPrompts = resources.prompts.map((pathObj) => {
      pathObj.message = chalk.cyan(pathObj.heading || '') + pathObj.message;
      pathObj.default = _.get(genDefaults, pathObj.name);
      pathObj.validate = this.validatePath;
      pathObj.when = (answers) => !answers.useDefaults;

      return pathObj;
    });

    let prompts = [
      {
        type: 'confirm',
        name: 'useDefaults',
        message: 'Use default/existing paths?',
        default: true,
      },
    ].concat(pathPrompts);


    return this.prompt(prompts).then(function(props) {
      if (props.useDefaults === true) {
        this.useDefaults = true;
        this.answers = this.generateObjFromAnswers(genDefaults);
      } else {
        delete props.useDefaults;   // We don't want to store this in our config
        this.answers = this.generateObjFromAnswers(props);
      }
    }.bind(this));
  },

  configuring: function() {
    // If we have new answers, then change the config
    let config = this.answers || this.getConfig();

    // Apply the filters to the pathPrompts and the generated paths
    let resources = this.getResources().paths;
    let pathPrompts = resources.prompts;

    pathPrompts.forEach((pathObj) => {
      _.set(config, pathObj.name, this.filterPath(_.get(config, pathObj.name), 'paths.' + pathObj.name, {paths: genDefaults}));
    });

    // Generate any other paths needed
    let pathsToGenerate = resources.pathsToGenerate || [];

    pathsToGenerate.forEach((pathObj) => {
      _.set(config, pathObj.name, this.filterPath(this.renderEJS(pathObj.value, {paths: config}), 'paths.' + pathObj.name, {paths: genDefaults}));
    });

    // Only if we prompted for answers should we re-call the build tool
    if (this.answers) {
      this.buildTool.configure.apply(this);
    }

    this.setConfig(config);
  },
});
