'use strict';

const utils = require('./unitTestUtils');
const yoassert = require('yeoman-assert');
const assert = require('assert');
const fs = require('fs-extra');
const yaml = require('js-yaml');

const GENERATOR_UNDER_TEST = 'documentation';

function writeBasicPackageJson(testDir) {
  // Create a package.json file with a name and repository, so that the swanky.config.yaml file is correct
  fs.writeJsonSync(testDir + '/package.json', {
    name: 'some-name',
    repository: {
      'url': 'https://blah/foo/bar'
    }
  });
}


describe('Documentation Generator', () => {

  it('should should generate default documentation values when the project is not hosted on GitHub', (done) => {
    utils.runGenerator(
      GENERATOR_UNDER_TEST,
      'node-documentation-config.yml',
      function before(testDir) {
        let confit = yaml.load(fs.readFileSync('confit.yml'));
        let documentation = confit['generator-confit'].documentation;

        assert.equal(documentation, undefined);

        writeBasicPackageJson(testDir);
      },
      function after() {
        yoassert.file(['confit.yml']);

        let confit = yaml.load(fs.readFileSync('confit.yml'));
        let docConfig = confit['generator-confit'].documentation;

        assert.equal(docConfig.generateDocs, true);
        assert.equal(docConfig.srcDir, 'docs/');
        assert.equal(docConfig.outputDir, 'webdocs/');
        assert.equal(docConfig.publishMethod, 'manual');
        assert.equal(docConfig.createSampleDocs, true);

        // Sample docs are generated by default
        yoassert.file(['docs/swanky.config.yaml', 'docs/docs.js']);

        // Verify that the settings made it into the swanky.config.yaml file too
        let swanky = yaml.load(fs.readFileSync('docs/swanky.config.yaml'));

        assert.equal(swanky.title, 'some-name');
        assert.equal(swanky.repo, 'https://blah/foo/bar');
        assert.equal(swanky.src, 'docs');
        assert.equal(swanky.output, 'webdocs');
        assert.equal(swanky.serverPath, null);    // Should be blank until we publish, THEN it will get a value

        // No Angular framework => no angular framework config
        assert.equal(confit['generator-confit'].buildJS.framework, undefined);
        assert.equal(swanky.sections[1].subSections[0].bootstrap, undefined);
        yoassert.noFile(['docs/config/bootstrap/angular.bootstrap.js']);

        done();
      }
    );
  });


  it('should should generate different default documentation values when the project is hosted on GitHub', (done) => {
    utils.runGenerator(
      GENERATOR_UNDER_TEST,
      'node-documentation-GitHub-config.yml',
      function before(testDir) {
        let confit = yaml.load(fs.readFileSync('confit.yml'));
        let documentation = confit['generator-confit'].documentation;

        assert.equal(documentation, undefined);

        writeBasicPackageJson(testDir);
      },
      function after() {
        yoassert.file(['confit.yml']);

        let confit = yaml.load(fs.readFileSync('confit.yml'));
        let docConfig = confit['generator-confit'].documentation;

        assert.equal(docConfig.generateDocs, true);
        assert.equal(docConfig.srcDir, 'docs/');
        assert.equal(docConfig.outputDir, 'webdocs/');
        assert.equal(docConfig.publishMethod, 'GitHub');
        assert.equal(docConfig.createSampleDocs, true);

        // assert that the sample docs exist
        yoassert.file(['docs/swanky.config.yaml', 'docs/docs.js']);

        done();
      }
    );
  });


  it('should not ask for extra values when the user does not want documentation', (done) => {
    utils.runGenerator(
      GENERATOR_UNDER_TEST,
      'node-documentation-config.yml',
      function before(testDir) {
        writeBasicPackageJson(testDir);
      },
      function after() {
        let confit = yaml.load(fs.readFileSync('confit.yml'));
        let docConfig = confit['generator-confit'].documentation;

        assert.equal(docConfig.generateDocs, false);
        assert.equal(docConfig.srcDir, undefined);
        assert.equal(docConfig.outputDir, undefined);
        assert.equal(docConfig.publishMethod, undefined);
        assert.equal(docConfig.createSampleDocs, undefined);

        // assert that the sample docs do not exist
        yoassert.noFile(['docs/swanky.config.yaml', 'docs/docs.js']);

        done();
      }
    ).withPrompts({
      generateDocs: false
    });
  });


  it('should allow the default values to be changed', (done) => {
    utils.runGenerator(
      GENERATOR_UNDER_TEST,
      'node-documentation-config.yml',
      function before(testDir) {
        writeBasicPackageJson(testDir);
      },
      function after() {
        let confit = yaml.load(fs.readFileSync('confit.yml'));
        let docConfig = confit['generator-confit'].documentation;

        assert.equal(docConfig.generateDocs, true);
        assert.equal(docConfig.srcDir, 'a/b/c/');
        assert.equal(docConfig.outputDir, 'magic-johnson/');
        assert.equal(docConfig.publishMethod, 'GitHub');

        yoassert.noFile(['docs/swanky.config.yaml', 'docs/docs.js']);

        done();
      }
    ).withPrompts({
      generateDocs: true,
      srcDir: 'a/b/c',
      outputDir: 'magic-johnson/',
      publishMethod: 'GitHub',
      createSampleDocs: false
    });
  });


  it('should generate the correct config for generating the documentation for the default settings', (done) => {
    utils.runGenerator(
      GENERATOR_UNDER_TEST,
      'node-documentation-config.yml',
      function before(testDir) {
        writeBasicPackageJson(testDir);
      },
      function after() {
        yoassert.file(['package.json', 'config/docs/prepublish.js', 'config/docs/postpublish.js', 'config/docs/publish.js', 'config/docs/serve.dev.js']);

        let pkg = fs.readJsonSync('package.json');

        assert.equal(pkg.scripts['docs:dev'], 'NODE_ENV=development node config/docs/serve.dev.js');
        assert.equal(pkg.scripts['docs:build'], 'NODE_ENV=production webpack -p --progress --config config/docs/swanky.webpack.config.js --colors');
        assert.equal(pkg.scripts['docs:build:serve'], 'npm-run-all docs:build docs:serve');
        assert.equal(pkg.scripts['docs:serve'], 'http-server webdocs/ -o');
        assert.equal(pkg.scripts['docs:publish'], 'npm-run-all docs:prepublish docs:build docs:_publish docs:postpublish');
        assert.equal(pkg.scripts['docs:_publish'], 'node config/docs/publish.js');
        assert.equal(pkg.scripts['docs:prepublish'], 'node config/docs/prepublish.js');
        done();
      }
    );
  });


  it('should generate the correct config for generating the documentation for Github publishing', (done) => {
    utils.runGenerator(
      GENERATOR_UNDER_TEST,
      'node-documentation-config.yml',
      function before(testDir) {
        writeBasicPackageJson(testDir);
      },
      function after() {
        yoassert.file(['package.json', 'config/docs/publish.js', 'config/docs/serve.dev.js']);

        let pkg = fs.readJsonSync('package.json');

        assert.equal(pkg.scripts['docs:dev'], 'NODE_ENV=development node config/docs/serve.dev.js');
        assert.equal(pkg.scripts['docs:build'], 'NODE_ENV=production webpack -p --progress --config config/docs/swanky.webpack.config.js --colors');
        assert.equal(pkg.scripts['docs:build:serve'], 'npm-run-all docs:build docs:serve');
        assert.equal(pkg.scripts['docs:serve'], 'http-server webdocs/ -o');
        assert.equal(pkg.scripts['docs:publish'], 'npm-run-all docs:prepublish docs:build docs:_publish docs:postpublish');
        assert.equal(pkg.scripts['docs:_publish'], 'node config/docs/publish.js');
        assert.equal(pkg.scripts['docs:prepublish'], 'node config/docs/prepublish.js');
        done();
      }
    ).withPrompts({
      publishMethod: 'GitHub'
    });
  });


  it('should generate the correct config for generating the documentation for cloud publishing', (done) => {
    utils.runGenerator(
      GENERATOR_UNDER_TEST,
      'node-documentation-config.yml',
      function before(testDir) {
        writeBasicPackageJson(testDir);
      },
      function after() {
        yoassert.file(['package.json', 'config/docs/serve.dev.js']);

        let pkg = fs.readJsonSync('package.json');

        assert.equal(pkg.scripts['docs:dev'], 'NODE_ENV=development node config/docs/serve.dev.js');
        assert.equal(pkg.scripts['docs:build'], 'NODE_ENV=production webpack -p --progress --config config/docs/swanky.webpack.config.js --colors');
        assert.equal(pkg.scripts['docs:build:serve'], 'npm-run-all docs:build docs:serve');
        assert.equal(pkg.scripts['docs:serve'], 'http-server webdocs/ -o');
        assert.equal(pkg.scripts['docs:publish'], 'npm-run-all docs:prepublish docs:build docs:_publish docs:postpublish');
        assert.equal(pkg.scripts['docs:_publish'], 'ns webdocs/');
        assert.equal(pkg.scripts['docs:prepublish'], 'node config/docs/prepublish.js');
        done();
      }
    ).withPrompts({
      publishMethod: 'cloud'
    });
  });


  it('should generate Angular-specific config and files when the framework is AngularJS 1.x', (done) => {
    utils.runGenerator(
      GENERATOR_UNDER_TEST,
      'browser-documentation-GitHub-config.yml',
      function before(testDir) {
        let confit = yaml.load(fs.readFileSync('confit.yml'));
        let documentation = confit['generator-confit'].documentation;

        assert.equal(documentation, undefined);

        writeBasicPackageJson(testDir);
      },
      function after() {
        yoassert.file(['confit.yml']);

        let confit = yaml.load(fs.readFileSync('confit.yml'));
        let docConfig = confit['generator-confit'].documentation;

        assert.equal(docConfig.srcDir, 'docs/');
        assert.equal(docConfig.createSampleDocs, true);

        // Sample docs are generated by default
        yoassert.file(['docs/swanky.config.yaml', 'docs/docs.js']);

        // Verify that the settings made it into the swanky.config.yaml file too
        let swanky = yaml.load(fs.readFileSync('docs/swanky.config.yaml'));

        // AngularJS-specific content
        assert.equal(confit['generator-confit'].buildJS.framework[0], 'AngularJS 1.x');
        assert.equal(swanky.sections[1].title, 'Components');
        assert.equal(swanky.sections[1].subSections[0].bootstrap[0].src, 'docs/config/bootstrap/angular.bootstrap.js');
        yoassert.file(['docs/config/bootstrap/angular.bootstrap.js']);

        done();
      }
    );
  });


  it('should convert invalid paths into valid paths', (done) => {
    utils.runGenerator(
      GENERATOR_UNDER_TEST,
      'node-documentation-config.yml',
      function before(testDir) {
        writeBasicPackageJson(testDir);
      },
      function after() {
        let confit = yaml.load(fs.readFileSync('confit.yml'));
        let docConfig = confit['generator-confit'].documentation;

        assert.equal(docConfig.srcDir, 'dotSlash/');
        assert.equal(docConfig.outputDir, 'webdocs/');        // Changed to the default directory
        done();
      }
    ).withPrompts({
      generateDocs: true,
      srcDir: './dotSlash/',
      outputDir: '   ',
      publishMethod: 'GitHub'
    });
  });


  it('should throw an error if a path contains ../', (done) => {
    utils.runGenerator(
      GENERATOR_UNDER_TEST,
      'node-paths-config.json',
      function before(testDir) {
        writeBasicPackageJson(testDir);
      },
      function after() {},
      function error(err) {
        assert.equal(err.message, '"outputDir" cannot contain "../"');
        done();
      }
    ).withPrompts({
      outputDir: 'a/../b//c/d'
    });
  });


  it('should throw an error if a path is an absolute path', (done) => {
    utils.runGenerator(
      GENERATOR_UNDER_TEST,
      'node-paths-config.json',
      function before(testDir) {
        writeBasicPackageJson(testDir);
      },
      function after() {},
      function error(err) {
        assert.equal(err.message, '"srcDir" cannot be an absolute path: /full/path/dir');
        done();
      }
    ).withPrompts({
      srcDir: '/full/path/dir'
    });
  });

});
