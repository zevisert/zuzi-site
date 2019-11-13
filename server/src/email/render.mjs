
import mjml2html from 'mjml';
import nunjucks from 'nunjucks';
import stream from 'stream';
import Spaces from 'aws-sdk';
import path from 'path';
import justified from 'justified';

const env = new nunjucks.Environment(
    new nunjucks.FileSystemLoader('server/src/email/templates'),
    { throwOnUndefined: true }
);

env.addFilter('asCAD', totalCents => `$${(totalCents / 100).toFixed(2)} CAD`)
env.addFilter('justified', (text, width=63) => justified(text, {width}))

export const render = async (template, context) => {

    const result = mjml2html(env.render(template.mjml, context))

    // Upload to DO spaces
    const endpoint = new Spaces.Endpoint(`${process.env.CDN_REGION}.${process.env.CDN_HOST}`);
    const space = new Spaces.S3({
        endpoint,
        accessKeyId: process.env.CDN_ACCESSKEY,
        secretAccessKey: process.env.CDN_SECRET_ACCESSKEY
    });

    const body = stream.PassThrough()
    body.end(result.html)

    await space.upload({
        Bucket: process.env.CDN_SPACENAME,
        Key: path.join(process.env.CDN_DIR, context.message.permalink),
        Body: body,
        ACL: 'public-read',
        ContentType: "text/html"
    }).promise();

    return result.html;
}

export const plaintext = async (template, context) => {
    return env.render(template.text, context)
}
