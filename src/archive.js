const path = require('path'),
  fs = require('fs'),
  tar = require('tar-stream'),
  pump = require('pump'),
  { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const ROOTFS = 'rootfs';
const MANIFEST = 'manifest';

export function createManifest(options = {}) {
  return Object.assign(
    {
      acKind: 'ImageManifest',
      acVersion: '0.8.11'
    },
    options
  );
}

export async function archive(out, dir, manifest) {
  const pack = tar.pack();

  const uname = 'root';
  const gname = 'sys';

  pump(pack, out, err => {
    console.log(`pump done ${err}`);
  });

  pack
    .entry(
      {
        name: MANIFEST,
        type: 'file',
        uname,
        gname
      },
      JSON.stringify(manifest)
    )
    .end();

  const queue = [];

  await walk(queue, dir, '');

  const append = () => {
    const q = queue.shift();
    if (q === undefined) {
      return;
    }
    const entry = pack.entry(q);
    const rs = fs.createReadStream(path.join(dir, q.name));

    rs.on('error', err => entry.destroy(err));

    if (!entry) {
      console.log(`no entry: ${JSON.stringify(q)}`);
    }

    pump(rs, entry);

    rs.on('end', () => append());
  };

  append();
}

async function walk(queue, base, dir) {
  const entries = await readdir(path.join(base, dir));

  const stats = await Promise.all(
    entries.map(entry => stat(path.join(base, dir, entry)))
  );

  for (const i in stats) {
    const stat = stats[i];
    if (stat.isDirectory()) {
      await walk(queue, base, path.join(dir, entries[i]));
    } else if (stat.isFile()) {
      const header = {
        name: path.join(ROOTFS, dir, entries[i]),
        mtime: stat.mtime,
        size: stat.size,
        type: 'file',
        uid: stat.uid,
        gid: stat.gid
      };

      queue.push(header);
    }
  }
}
