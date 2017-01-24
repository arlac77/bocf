/* jslint node: true, esnext: true */

'use strict';

const program = require('commander'),
path = require('path'),
fs = require('fs'),
  child_process = require('child_process'),
  mkdirp = require('mkdirp');

require('pkginfo')(module, 'version');

import {
  expand
}
from 'config-expander';


program
  .version(module.exports.version)
  .description('build aci image')
  .option('-c, --config <file>', 'use config from file')
  .parse(process.argv);

expand(program.config ? "${include('" + path.basename(program.config) + "')}"
 : {}).then(config => {
   
 });
