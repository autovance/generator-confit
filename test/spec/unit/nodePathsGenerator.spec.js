'use strict';

const utils = require('./unitTestUtils');
const yoassert = require('yeoman-assert');
const assert = require('assert');
const fs = require('fs-extra');
const yaml = require('js-yaml');

const GENERATOR_UNDER_TEST = 'paths';

describe('Node Paths Generator', () => {
  it('should should generate default path values', (done) => {
    utils.runGenerator(
      GENERATOR_UNDER_TEST,
      'node-paths-config.json',
      function before() {
        let confit = fs.readJsonSync('confit.json');
        let paths = confit['generator-confit'].paths;

        assert.equal(paths, undefined);
      },
      function after() {
        yoassert.file(['confit.yml']);

        let confit = yaml.load(fs.readFileSync('confit.yml'));
        let paths = confit['generator-confit'].paths;

        assert.equal(paths.input.srcDir, 'src/');
        assert.equal(paths.input.unitTestDir, 'test/');
        assert.equal(paths.output.prodDir, 'dist/');
        assert.equal(paths.output.reportDir, 'reports/');
        assert.equal(paths.config.configDir, 'config/');
        done();
      }
    );
  });


  it('should allow the default paths to be changed', (done) => {
    utils.runGenerator(
      GENERATOR_UNDER_TEST,
      'node-paths-config.json',
      function before() {},
      function after() {
        yoassert.file(['confit.yml']);

        let confit = yaml.load(fs.readFileSync('confit.yml'));
        let paths = confit['generator-confit'].paths;

        assert.equal(paths.input.srcDir, 'willy/');
        done();
      }
    ).withPrompts({
      'useDefaults': false,
      'input.srcDir': 'willy/',
    });
  });


  it('should convert invalid paths into valid paths', (done) => {
    utils.runGenerator(
      GENERATOR_UNDER_TEST,
      'node-paths-config.json',
      function before() {},
      function after() {
        yoassert.file(['confit.yml']);

        let confit = yaml.load(fs.readFileSync('confit.yml'));
        let paths = confit['generator-confit'].paths;

        assert.equal(paths.input.srcDir, 'dotSlash/');
        assert.equal(paths.output.reportDir, 'reports/');        // Changed to the default directory
        done();
      }
    ).withPrompts({
      'useDefaults': false,
      'input.srcDir': './dotSlash/',
      'input.modulesSubDir': '   ',
      'output.reportDir': '   ',
    });
  });


  it('should throw an error if a path contains ../', (done) => {
    utils.runGenerator(
      GENERATOR_UNDER_TEST,
      'node-paths-config.json',
      function before() {},
      function after() {},
      function error(err) {
        assert.equal(err.message, '"paths.output.reportDir" cannot contain "../"');
        done();
      }
    ).withPrompts({
      'useDefaults': false,
      'output.reportDir': 'a/../b//c/d',
    });
  });


  it('should throw an error if a path is an absolute path', (done) => {
    utils.runGenerator(
      GENERATOR_UNDER_TEST,
      'node-paths-config.json',
      function before() {},
      function after() {},
      function error(err) {
        assert.equal(err.message, '"paths.config.configDir" cannot be an absolute path: /up/a/dir');
        done();
      }
    ).withPrompts({
      'useDefaults': false,
      'config.configDir': '/up/a/dir',
    });
  });
});
