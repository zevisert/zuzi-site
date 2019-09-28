
import mjml2html from 'mjml';
import nunjucks from 'nunjucks';


const env = new nunjucks.Environment(
    new nunjucks.FileSystemLoader('server/src/email/mjml'),
    { throwOnUndefined: true }
);

env.addFilter('price', val => `$${val} CAD`)

export const render = (template, context) => {
    return mjml2html(env.render(template, context)).html;
}
