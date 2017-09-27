import test from 'ava';

import { archive, createManifest } from '../src/archive';

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

test('archive', async t => {
  const outFileName = path.join(__dirname, '..', 'build', 'test.aci');
  const out = fs.createWriteStream(outFileName);

  await archive(
    out,
    __dirname,
    createManifest({
      labels: [
        {
          name: 'version',
          value: '1.0.0'
        },
        {
          name: 'arch',
          value: 'amd64'
        },
        {
          name: 'os',
          value: 'linux'
        }
      ],
      app: {
        exec: ['/usr/bin/reduce-worker', '--quiet'],
        user: '100',
        group: '300'
      },
      supplementaryGids: [400, 500],
      eventHandlers: [
        {
          exec: ['/usr/bin/data-downloader'],
          name: 'pre-start'
        },
        {
          exec: ['/usr/bin/deregister-worker', '--verbose'],
          name: 'post-stop'
        }
      ],
      workingDirectory: '/opt/work',
      environment: [
        {
          name: 'REDUCE_WORKER_DEBUG',
          value: 'true'
        }
      ]
    })
  );

  const stat = await promisify(fs.stat)(outFileName);

  t.is(stat.size, 1536);
});
