import test from 'ava';

import { archive } from '../src/archive';

const fs = require('fs');
const { promisify } = require('util');

test('archive', async t => {
  const outFileName = '/tmp/a.tar';
  const out = fs.createWriteStream(outFileName);

  await archive(out, __dirname, {
    acKind: 'ImageManifest',
    acVersion: '0.8.9'
  });

  const stat = await promisify(fs.stat)(outFileName);

  t.is(stat.size, 1024);
});
