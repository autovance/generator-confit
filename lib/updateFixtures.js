'use strict';
const resources = require('./resources.js').getResources();
const _ = require('lodash');
const checksum = require('checksum');
const path = require('path');
const async = require('async');
const fs = require('fs-extra');

const FIXTURE_DIR = path.join(__dirname, '/../test/fixtures/');

main();

function main() {
  var generatorFiles = [':app'].concat(resources.app.subGenerators)
    .map(item => item.split(':')[1])
    .map(name => { return {name: name, file: path.resolve(__dirname + '/../generators/' + name + '/index.js') }; });

  // Calculate the checksum on each generator file, then once that's done, update the fixtures
  async.each(generatorFiles, (item, cb)  => {
    checksum.file(item.file, function(err, checksum) {
      item.version = checksum;
      cb(err);
    });
  }, () => updateFixtures(FIXTURE_DIR, resources.rootGeneratorName, generatorFiles));
}


function updateFixtures(dir, rootGeneratorName, versionInfo) {
  // Get the files
  var files = fs.readdirSync(dir)
    .filter(function(file) {
      return fs.statSync(path.join(dir, file)).isFile() && (file.match(/^[^x]+\.json$/) !== null);
    });

  // Update each file
  files.forEach(file => {
    var json = fs.readJsonSync(path.join(dir, file));
    var confit = json[rootGeneratorName];
    var fileChanged = false;

    // Loop through the version information
    versionInfo.forEach(item => {
      //console.log(confit[item.name]._version, item.version);
      if (confit[item.name]._version && confit[item.name]._version !== item.version) {
        console.log('Updating ' + file + '[' + item.name + '] from ' + confit[item.name]._version + ' to ' + item.version);
        confit[item.name]._version = item.version;
        fileChanged = true;
      }
    });

    if (fileChanged) {
      fs.writeJsonSync(path.join(dir, file), json);
    }
  });
}