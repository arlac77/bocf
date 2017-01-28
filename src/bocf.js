/* jslint node: true, esnext: true */

'use strict';

const program = require('commander'),
  path = require('path'),
  fs = require('fs'),
  child_process = require('child_process'),
  mkdirp = require('mkdirp'),
  tar = require('tar-stream'),
  tarfs = require('tar-fs'),
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

const out = fs.createWriteStream('/tmp/a.tar');

expand(program.config ? "${include('" + path.basename(program.config) + "')}"
 : {}).then(config => {

   const manifest = {
     acKind: 'ImageManifest',
     acVersion: '0.8.9'
   };

   const pack = tar.pack();

   pump(pack,out);

   pack.entry({ name: 'manifest' }, JSON.stringify(manifest));

   for(const name of ['.gitignore','LICENSE','.npmignore']) {
   fs.stat(name,(err,stat) => {
     if(err) { console.log(err); return ; }
     console.log(stat);
     const entry = pack.entry({ name: name, size: stat.size }, (err) => {
       console.log('end');
       pack.finalize();
     });
     fs.createReadStream(name).pipe(entry);
   });
}

/*
   const walker = walk.walk('./', {});


   walker.on('file', (root, fileStats, next) => {

     console.log(`got: ${fileStats.name}`);

     const entry = pack.entry({ name: fileStats.name, size: fileStats.size },fs.readFileSync(fileStats.name));

     next();
     //const rs = fs.createReadStream(fileStats.name);

     //pump(rs,entry);
     //setTimeout(() => next(),1000);
   });

   walker.on('end', () => {
     console.log("all done");
     pack.finalize();
   });
*/

 });
