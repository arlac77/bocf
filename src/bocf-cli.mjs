import { expand } from 'config-expander';
import { archive, createManifest } from './archive.mjs';
import { basename } from 'path';
import { createWriteStream } from 'fs';
import program from "commander";


program
  .description('build ocf image')
  .action(async (args, options) => {
    const out = createWriteStream('/tmp/a.tar');
    const config = await expand(
      options.config ? "${include('" + basename(options.config) + "')}" : {}
    );

    archive(out, '.', createManifest({ name: 'example.com/reduce-worker' }));
  })
  .option('-c, --config <file>', 'use config from file');
 .parse(process.argv);
