'use strict';

const fs = require('node:fs');
const crypto = require('node:crypto');
const hashes = require('./libvips-8.11.3-integrity.json');
const MAX_ARCHIVE_BYTES = 128 * 1024 * 1024;

function verifyBuffer(bytes, integrity) {
  if (!/^sha512-[A-Za-z0-9+/]{86}==$/.test(integrity || '')) {
    throw new Error('Missing or invalid approved libvips checksum');
  }
  const expected = Buffer.from(integrity.slice(7), 'base64');
  const actual = crypto.createHash('sha512').update(bytes).digest();
  if (!crypto.timingSafeEqual(expected, actual)) {
    throw new Error('libvips checksum mismatch; refusing to extract this archive');
  }
  return bytes;
}

function readVerifiedArchive(tarPath, version, platform) {
  const filename = `libvips-${version}-${platform}.tar.br`;
  if (!Object.hasOwn(hashes, filename)) {
    throw new Error(`No approved libvips checksum for ${filename}`);
  }
  const fd = fs.openSync(tarPath, 'r');
  try {
    const stat = fs.fstatSync(fd);
    if (!stat.isFile() || stat.size <= 0 || stat.size > MAX_ARCHIVE_BYTES) {
      throw new Error('Invalid libvips archive size or file type');
    }
    const bytes = Buffer.alloc(stat.size + 1);
    let size = 0;
    while (size < bytes.length) {
      const count = fs.readSync(fd, bytes, size, bytes.length - size, null);
      if (!count) break;
      size += count;
    }
    if (size !== stat.size) throw new Error('libvips archive changed while reading');
    // Extraction must use this same verified buffer, never reopen the path.
    return verifyBuffer(bytes.subarray(0, size), hashes[filename]);
  } finally {
    fs.closeSync(fd);
  }
}

module.exports = { readVerifiedArchive, verifyBuffer };
