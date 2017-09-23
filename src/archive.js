const path = require('path'),
  fs = require('fs'),
  child_process = require('child_process'),
  tar = require('tar-stream'),
  pump = require('pump'),
  { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

export async function archive(out, dir, manifest) {
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
    } else {
      const header = {
        name: path.join(dir, entries[i]),
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
