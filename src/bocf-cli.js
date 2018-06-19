import { expand } from 'config-expander';
import { archive, createManifest } from './archive';
import { version } from '../package.json';
import { basename } from 'path';
import { createWriteStream } from 'fs';

const program = require('caporal');

program
  .version(version)
  .description('build ocf image')
  .action(async (args, options) => {
    const out = createWriteStream('/tmp/a.tar');
    const config = await expand(
      options.config ? "${include('" + basename(options.config) + "')}" : {}
    );

    archive(out, '.', createManifest({ name: 'example.com/reduce-worker' }));
  })
  .option('-c, --config <file>', 'use config from file');

program.parse(process.argv);
