/* jslint node: true, esnext: true */

'use strict';

const program = require('commander'),
  path = require('path'),
  fs = require('fs'),
  child_process = require('child_process'),
  mkdirp = require('mkdirp'),
  tar = require('tar-stream'),
  pump = require('pump'),
  walk = require('walk');

require('pkginfo')(module, 'version');

import {
  expand
}
from 'config-expander';


program
  .version(module.exports.version)
  .description('build ocf image')
  .option('-c, --config <file>', 'use config from file')
  .parse(process.argv);

expand(program.config ? "${include('" + path.basename(program.config) + "')}"
 : {}).then(config => {

   const manifest = {
     acKind: 'ImageManifest',
     acVersion: '0.8.9'
   };

   const pack = tar.pack();

   pump(pack,process.stderr);

   pack.entry({ name: 'manifest' }, JSON.stringify(manifest));

   const walker = walk.walk('./', {});


   walker.on('file', (root, fileStats, next) => {

     console.log(`got: ${fileStats.name}`);
     const entry = pack.entry({ name: fileStats.name, size: fileStats.size }, err => {
       console.log(`end: ${err}`);

       if (err) return pack.destroy(err);
       next();
     }
   );

     const rs = fs.createReadStream(fileStats.name);

     pump(rs,entry);
   });

   walker.on('end', () => {
     console.log("all done");
     pack.finalize();

   });

 });
