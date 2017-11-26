import { expand } from 'config-expander';
import { archive, createManifest } from './archive';

const path = require('path');
const fs = require('fs');
const program = require('caporal');

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

    archive(out, '.', createManifest({ name: 'example.com/reduce-worker' }));
  })
  .option('-c, --config <file>', 'use config from file');

program.parse(process.argv);
