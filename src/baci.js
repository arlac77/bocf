/* jslint node: true, esnext: true */

'use strict';

const program = require('commander'),
  path = require('path'),
  fs = require('fs'),
  child_process = require('child_process'),
  mkdirp = require('mkdirp'),
  tar = require('tar-stream'),
  walk = require('walk');

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

   const manifest = {
     acKind: 'ImageManifest',
     acVersion: '0.8.9'
   };

   const pack = tar.pack();
   pack.entry({ name: 'manifest' }, JSON.stringify(manifest));

   const walker = walk.walk('./', {});

   walker.on('file', (root, fileStats, next) => {
     const entry = pack.entry({ name: fileStats.name });
     const rs = fs.createReadStream(fileStats.name);
     rs.on('end',() => { entry.end(); next();});
     rs.pipe(entry);
   });

   pack.pipe(process.stdout);
 });
