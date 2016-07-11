'use strict';
const assert = require('assert');
const childProc = require('child_process');
const fs = require('fs-extra');

const VERIFY_CMD = 'npm run verify';
const FIXTURE_DIR = __dirname + '/fixtures/';

// Pass the confit config to this module... (use module.exports

function runCommand(ioMode) {
  // If there is an error, an exception will be thrown
  return childProc.execSync(VERIFY_CMD, {
    stdio: ioMode || 'inherit',
    cwd: process.env.TEST_DIR
  });
}


module.exports = function(confitConfig, srcDir, hasJS, hasCSS) {

  describe('npm run verify', () => {

    it('should not find errors in the sampleApp code', function() {
      // The verify command should contain the "thumbs-up" code when there are no errors
      let consoleData;
      assert.doesNotThrow(() => {
        consoleData = runCommand('pipe').toString();
        console.log(consoleData);
      });

      // NOTE: I'm not a fan of conditional logic in tests, but this is a small exception
      if (hasJS) {
        assert.equal(consoleData.indexOf('\ud83d\udc4d verify:js success') > -1, true, 'expected "verify:js success" to be printed in the console');
      }
      if (hasCSS) {
        assert.equal(consoleData.indexOf('\ud83d\udc4d verify:css success') > -1, true, 'expected "verify:css success" to be printed in the console');
      }
    });


    if (confitConfig.verify.jsCodingStandard !== 'none') {
      describe('- JS Coding Standards', () => {
        let jsFixtureFile = 'js-syntax-fail.js';
        let destFixtureFile =  srcDir + jsFixtureFile;

        before(function() {
          fs.copySync(FIXTURE_DIR + jsFixtureFile, destFixtureFile);
          fs.copySync(FIXTURE_DIR + jsFixtureFile, destFixtureFile.replace('.js', '.ts'));
        });

        after(function() {
          fs.removeSync(destFixtureFile);
          fs.removeSync(destFixtureFile.replace('.js', '.ts'));
        });


        it('should throw an error when the code fails to lint', function() {
          assert.throws(runCommand, Error);
        });
      });
    }

    if (confitConfig.buildCSS && confitConfig.buildCSS.sourceFormat !== 'css') {
      describe('- CSS Linting', function() {
        var cssFixtureFile = 'css-lint-fail.css';
        var destFixtureFile =  process.env.TEST_DIR + confitConfig.paths.input.modulesDir + process.env.SAMPLE_APP_MODULE_DIR +
                               confitConfig.paths.input.stylesDir + cssFixtureFile;

        before(function() {
          fs.copySync(FIXTURE_DIR + cssFixtureFile, destFixtureFile);
          fs.copySync(FIXTURE_DIR + cssFixtureFile, destFixtureFile.replace('.css', '.styl'));
          fs.copySync(FIXTURE_DIR + cssFixtureFile, destFixtureFile.replace('.css', '.sass'));
        });

        after(function() {
          fs.removeSync(destFixtureFile);
          fs.removeSync(destFixtureFile.replace('.css', '.styl'));
          fs.removeSync(destFixtureFile.replace('.css', '.sass'));
        });


        it('should throw an error when the code fails to lint', function() {
          assert.throws(runCommand, Error);
        });
      });
    }
  });
};
