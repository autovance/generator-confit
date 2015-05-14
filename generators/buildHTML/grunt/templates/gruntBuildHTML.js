module.exports = function(grunt) {
  'use strict';

  //var path = require('path');
  //var util = require(path.resolve(__dirname + '/../lib/utils.js'));
  //var config = grunt.config.get('modularProject.buildHTML');


  //input: {
  //  srcDir: 'src/',
  //    modulesDir: 'src/modules/',
  //    moduleAssets: 'assets',
  //    moduleIncludes: 'includes',
  //    modulePartials: 'partials',
  //    moduleStyles: 'styles',
  //    moduleTemplates: 'template',
  //    moduleUnitTest: 'unitTest',
  //
  //    assetFiles: ['**/modularProject.input.moduleAsset/**/*'],
  //    htmlFiles: ['**/*.html'], //templates directory needs to be ignored
  //    jsFiles: ['**/_*.js', '**/*.js'],
  //    templateHTMLFiles: ['**/modularProject.input.moduleTemplates/*.html']
  //},
  //output: {
  //  devDir: 'dev/',
  //    prodDir: 'dist/',
  //    reportDir: 'reports/',
  //    assetsSubDir: 'assets/',
  //    cssSubDir: 'css/',
  //    jsSubDir: 'js/',
  //    vendorJSSubDir: 'vendor/',
  //    viewsSubDir: 'views/'
  //},

  //todo, add these to yeoman config.....
  var tempInput = {
      assetFiles: ['**/<%= paths.input.assetsDir %>/**/*'],
      htmlFiles: ['**/*.html'], //templates directory needs to be ignored
      jsFiles: ['**/_*.js', '**/*.js'],
      templateHTMLFiles: ['**/<%= paths.input.templateDir %>/*.html']
  };

  var tempOutput = {
    devDir: 'dev/',
    prodDir: 'build/static/',
    assetsSubDir: 'assets/',
    cssSubDir: 'css/',
    jsSubDir: 'js/',
    vendorJSSubDir: 'vendor/',
    viewsSubDir: 'views/',
    reportDir: 'bin/'
  };

  grunt.extendConfig({
    copy: {
      html: {
        files: [
          {expand: true, flatten: false, cwd: '<%= paths.input.modulesDir %>', src: '= tempInput.htmlFiles ', dest: '= modularProject.build.dev.viewsDir '},
          {expand: true, flatten: true,  cwd: '<%= paths.input.srcDir %>', src: '*.html', dest: '= modularProject.build.dev.dir '},
          {expand: true, flatten: false, cwd: '<%= paths.input.srcDir %>', src: '<%= paths.input.viewsDir %>/*', dest: '= modularProject.build.dev.viewsDir '}
        ]
      },
      moduleAssets: {
        files: [
          {
            expand: true,
            flatten: false,
            cwd: '<%= paths.input.modulesDir %>',
            src: '= tempInput.assetFiles ',
            dest: '<%= paths.input.assetsDir %>',
            rename: function (dest, src) {
              grunt.log.writeln('Copy: ' + src + ', ' + dest);
              // Remove the 'prefix/assets/ portion of the path
              var assetsDirName = '/<%= paths.input.assetsDir %>/';
              var moduleName = src.substr(0, src.indexOf(assetsDirName));
              //grunt.log.ok('module name = ' + moduleName);
              var newPath = src.substr(src.indexOf(assetsDirName) + 8);
              return dest + '/' + moduleName + '/' + newPath;
            }
          }
        ]
      }
    },

    targethtml: {
      unoptimised: {
        files: [
          {src: '= modularProject.build.dev.dir *.html', dest: '= modularProject.build.dev.dir '}
        ]
      }
    },

    watch: {
      html: {
        files: [
          '<%= paths.input.modulesDir %>= tempInput.htmlFiles ',
          '<%= paths.input.srcDir %>*.html',
          '<%= paths.input.srcDir %><%= paths.input.viewsDir %>/*'
        ],
        tasks: ['copy:html', 'mpBuildHTMLUnoptimisedTags', 'targethtml:unoptimised']
      },
      moduleAssets: {
        files: ['<%= paths.input.modulesDir %>= tempInput.assetsFiles '],
        tasks: ['copy:moduleAssets']
      }
    }
  });


  grunt.registerTask('mpSetHTMLTag', function (configPropertyName, tagNamePrefix, tagName, fileType, outputDirPrefix) {
    var fileSpec = grunt.config(configPropertyName), files = [],
      outputDirPath = (outputDirPrefix) ? grunt.config(outputDirPrefix) : '';

//    grunt.log.ok('tagType = ' + tagNamePrefix);
//    grunt.log.ok('tagName = ' + tagName);
//    grunt.log.ok('fileType = ' + fileType); // Can be 'script' or 'link'
//    grunt.log.ok('outputPrefix = ' + outputDirPrefix);
//    grunt.log.ok('fileSpec = ' + JSON.stringify(fileSpec));

    if (fileSpec.cwd) {
      files = grunt.file.expand({cwd: fileSpec.cwd}, fileSpec.src);
    } else {
      files = grunt.file.expand(fileSpec.src || fileSpec);
    }
    grunt.log.ok('{{' + tagName + '}}:\n' + files.join('\n'));

    grunt.config.set('targethtml.' + tagNamePrefix + '.options.curlyTags.' + tagName, util.generateHTMLTags(fileType, files, outputDirPath));
  });


  // This tasks creates the {{ }} tags for the 'targethtml' task to replace
  grunt.registerTask('mpBuildHTMLUnoptimisedTags', [
    'mpSetHTMLTag:modularProject.buildHTML.compilableVendorJSFiles:unoptimised:vendorScripts:script:modularProject.output.vendorJSSubDir',
    'mpSetHTMLTag:modularProject.buildHTML.nonCompilableVendorJSFiles:unoptimised:externalScripts:script:modularProject.output.vendorJSSubDir',
    'mpSetHTMLTag:modularProject.buildHTML.compiledCSSFileSpec:unoptimised:cssFiles:link',
    'mpSetHTMLTag:modularProject.buildJS.compiledAppJSFiles:unoptimised:appScripts:script'
  ]);

  grunt.registerTask('mpBuildHTML', ['copy:html', 'copy:moduleAssets', 'mpBuildHTMLUnoptimisedTags', 'targethtml:unoptimised']);
};
