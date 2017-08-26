import { expand } from 'config-expander';
import { archive } from './archive';

const program = require('caporal');
const fs = require('fs');

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

    archive(out, '.', manifest);
  })
  .option('-c, --config <file>', 'use config from file');

program.parse(process.argv);
