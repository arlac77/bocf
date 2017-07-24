import { expand } from 'config-expander';

const program = require('caporal'),
  path = require('path'),
  fs = require('fs'),
  child_process = require('child_process'),
  tar = require('tar-stream'),
  tarfs = require('tar-fs'),
  pump = require('pump');

program
  .version(require(path.join(__dirname, '..', 'package.json')).version)
  .description('build ocf image')
  .action(async (args, options) => {
    const out = fs.createWriteStream('/tmp/a.tar');
    const config = await expand(
      options.config
        ? "${include('" + path.basename(options.config) + "')}"
        : {}
    );

    const manifest = {
      acKind: 'ImageManifest',
      acVersion: '0.8.9'
    };

    const pack = tar.pack();

    pump(pack, out, err => {
      console.log(`pump done ${err}`);
    });

    pack
      .entry(
        {
          name: 'manifest'
        },
        JSON.stringify(manifest)
      )
      .end();

    //console.log(`entry: ${JSON.stringify(entry)}`);
    //add(pack, '.');
  })
  .option('-c, --config <file>', 'use config from file');

program.parse(process.argv);

function statAll(cwd = '.', entries = ['.']) {
  const queue = entries;

  return callback => {
    if (queue.length === 0) {
      return callback();
    }
    let next = queue.shift();
    let nextAbs = path.join(cwd, next);

    fs.stat(nextAbs, (err, stat) => {
      if (err) {
        return callback(err);
      }

      if (!stat.isDirectory()) {
        return callback(null, next, stat);
      }

      fs.readdir(nextAbs, (err, files) => {
        if (err) {
          return callback(err);
        }

        files.forEach(file => queue.push(path.join(next, file)));

        callback(null, next, stat);
      });
    });
  };
}

function add(pack, cwd = '.') {
  const statNext = statAll();

  const onStat = (err, filename, stat) => {
    if (err) {
      return pack.destroy(err);
    }
    if (!filename) {
      return pack.finalize();
    }

    console.log(`onStat: ${filename}`);
    const header = {
      name: filename,
      mtime: stat.mtime,
      size: stat.size,
      type: 'file',
      uid: stat.uid,
      gid: stat.gid
    };

    if (stat.isDirectory()) {
      header.size = 0;
      header.type = 'directory';
      return pack.entry(header, onNextEntry);
    }

    const entry = pack.entry(header, onNextEntry);
    if (!entry) {
      return;
    }

    /*
         const rs = fs.createReadStream(path.join(cwd, filename));

         rs.on('error', err => entry.destroy(err));
         rs.on('end', () => console.log(`end ${filename}`));

         pump(rs, entry);
         */
  };

  const onNextEntry = err => {
    //console.log(`onnextentry: ${err}`);

    if (err) {
      return pack.destroy(err);
    }
    statNext(onStat);
  };

  onNextEntry();
}
