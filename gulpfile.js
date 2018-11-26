const gulp    = require('gulp');
const spawn   = require('child_process').spawn;
const grey    = require('ansi-grey');

let node;

process.on('exit', () => {
    if (node) {
        node.kill();
        log(console.info, 'Killed hanging node instance', 'gulpfile');
    }
});

function log(output, data, tag) {
    tag = tag.length % 2 == 0 ? tag : `${tag} `;

    const timestamp = (new Date).toLocaleTimeString(undefined, {hour12: false});
    const fill = ' '.repeat(Math.max((8 - tag.length) / 2, 0));
    const prefix = `[${grey(timestamp)}][${fill}${grey(tag)}${fill}]`;
    const lines = data
        .toString()
        .split('\n')
        .map(line => line.trim())
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
                'server/src/index.mjs'
            ], {
                stdio: 'inherit',
                env: {
                    NODE_ENV: 'DEVELOPMENT',
                    PORT: 8080
                }
            }
        );

        node.on('close', function (code) {
            if (code === 8) {
                log(console.warn, 'Error detected, waiting for changes...', 'gulpfile');
            } else {
                reject();
            }
        });

        resolve();
    });
});

gulp.task('server:pipe', async () => {
    return new Promise((resolve, reject) => {
        const serve = spawn('npx', ['polymer', 'serve']);

        serve.stdout.on('data', data => log(console.log, data, 'Pipe'));
        serve.stderr.on('data', data => log(console.error, data, 'Pipe'));
        
        serve.stdout.once('data', resolve);
        serve.stderr.once('data', reject);
    });
});

gulp.task('default', () => {
    gulp.parallel('server:dev', 'server:pipe')();
    gulp.watch('server/src/*.mjs', gulp.series('server:dev'));
});
