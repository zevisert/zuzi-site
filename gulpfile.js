/**
* @license
* Copyright (c) Zev Isert, All rights reserved
*/

const gulp = require('gulp');
const source = require('vinyl-source-stream');
const del = require('del');
const spawn = require('child_process').spawn;
const grey = require('ansi-grey');

let node;

process.on('exit', () => {
  if (node) {
    node.kill();
    log(console.info, 'Killed hanging node instance', 'gulpfile');
  }
});

function log(output, data, tag) {
  tag = tag.length % 2 == 0 ? tag : `${tag} `;

  const timestamp = (new Date).toLocaleTimeString(undefined, { hour12: false });
  const fill = ' '.repeat(Math.max((8 - tag.length) / 2, 0));
  const prefix = `[${grey(timestamp)}][${fill}${grey(tag)}${fill}]`;
  const lines = data
    .toString()
    .split('\n')
    .filter(line => line.length > 0)
    .map(line => `${prefix} ${line}`)
    .join('\n');

  output(lines);
}

gulp.task('server:dev', () => {

  return new Promise((resolve, reject) => {
    if (node) node.kill()
    node = spawn(
      'node', [
      '--experimental-modules',
      '--inspect',
      'server/src/index.mjs'
    ], {
      env: {
        PATH: process.env.PATH
      }
    }
    );

    node.on('close', code => {
      if (code === 8) {
        log(console.warn, 'Error detected, waiting for changes...', 'gulpfile');
      } else {
        reject();
      }
    });

    node.stdout.on('data', data => log(console.log, data, 'Node'));
    node.stderr.on('data', data => log(console.error, data, 'Node'));

    resolve();
  });
});

gulp.task('server:pipe', () => {
  return new Promise((resolve, reject) => {
    const serve = spawn('polymer', ['serve']);

    serve.stdout.on('data', data => log(console.log, data, 'Pipe'));
    serve.stderr.on('data', data => log(console.error, data, 'Pipe'));

    serve.stdout.once('data', resolve);
    serve.stderr.once('data', reject);
  });
});


gulp.task('email:render', () => {
  return new Promise((resolve, reject) => {
    const context = require('./test/email/context.json')
    const mjml2html = require('mjml');
    const nunjucks = require('nunjucks');

    const env = new nunjucks.Environment(
        new nunjucks.FileSystemLoader('server/src/email/templates/'),
        { throwOnUndefined: true }
    );

    env.addFilter('asCAD', val => `$${val} CAD`)

    const render = (template, context) => {
        return mjml2html(env.render(template, context));
    }

    del('build/email').then( () => {
      for (const template of [
        'mjml/etransfer/accepted.mjml.njk',
        'mjml/etransfer/pending.mjml.njk',
        'mjml/etransfer/rejected.mjml.njk',
        'mjml/etransfer/admin/generated.mjml.njk',
        'mjml/stripe/accepted.mjml.njk',
        'mjml/stripe/failed.mjml.njk',
        'mjml/stripe/admin/generated.mjml.njk',
        'mjml/stripe/admin/notprocessed.mjml.njk',
        'mjml/subscribers/new-artwork.mjml.njk',
        // 'subscribers/message.mjml.njk'
      ]) {
        try {
          const stream = source(template.replace('mjml.njk', 'html'))
          stream.end(render(template, { ...context }).html)
          stream.pipe(gulp.dest('build/email/'))
        } catch (e) {
          reject(e);
        }
      }

      for (const template of [
        'plaintext/etransfer/accepted.text.njk',
        'plaintext/etransfer/pending.text.njk',
        'plaintext/etransfer/rejected.text.njk',
        'plaintext/etransfer/admin/generated.text.njk',
        'plaintext/stripe/accepted.text.njk',
        'plaintext/stripe/failed.text.njk',
        'plaintext/stripe/admin/generated.text.njk',
        'plaintext/stripe/admin/notprocessed.text.njk',
        'plaintext/subscribers/new-artwork.text.njk',
        // 'subscribers/message.text.njk'
      ]) {
        try {
          const stream = source(template.replace('text.njk', 'txt'))
          stream.end(env.render(template, { ...context }))
          stream.pipe(gulp.dest('build/email/'))
        } catch (e) {
          reject(e);
        }
      }

      resolve();
    })
  })
})


gulp.task('default', () => {
  gulp.parallel('server:dev', 'server:pipe')();
  gulp.watch(['server/src/**/*.mjs', 'server/process.env'], gulp.series('server:dev'));
});
