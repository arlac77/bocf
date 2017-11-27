import { expand } from 'config-expander';
import { archive, createManifest } from './archive';
import { version } from '../package.json';

const path = require('path');
const fs = require('fs');
const program = require('caporal');

program
  .version(version)
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
