/**
 * @license
 * Copyright (c) Zev Isert, All rights reserved
 */

import gulp from "gulp";
import source from "vinyl-source-stream";
import del from "del";
import mjml2html from "mjml";
import nunjucks from "nunjucks";
import fs from "fs";
import justified from "justified";

export async function renderEmails() {
  const context = JSON.parse(
    await fs.promises.readFile("test/email/context.json")
  );

  const env = new nunjucks.Environment(
    new nunjucks.FileSystemLoader("src/email/templates/"),
    { throwOnUndefined: true }
  );

  env.addFilter("asCAD", (val) => `$${val} CAD`);
  env.addFilter("justified", (text, width = 63) => justified(text, { width }));

  const render = (template, context) => {
    return mjml2html(env.render(template, context));
  };

  await del(".build/email");

  for (const template of [
    "mjml/etransfer/accepted.mjml.njk",
    "mjml/etransfer/pending.mjml.njk",
    "mjml/etransfer/rejected.mjml.njk",
    "mjml/etransfer/admin/generated.mjml.njk",
    "mjml/stripe/accepted.mjml.njk",
    "mjml/stripe/failed.mjml.njk",
    "mjml/stripe/admin/generated.mjml.njk",
    "mjml/stripe/admin/notprocessed.mjml.njk",
    "mjml/subscribers/new-artwork.mjml.njk",
    // 'subscribers/message.mjml.njk'
  ]) {
    const stream = source(template.replace("mjml.njk", "html"));
    stream.end(render(template, { ...context }).html);
    stream.pipe(gulp.dest(".build/email/"));
  }

  for (const template of [
    "plaintext/etransfer/accepted.text.njk",
    "plaintext/etransfer/pending.text.njk",
    "plaintext/etransfer/rejected.text.njk",
    "plaintext/etransfer/admin/generated.text.njk",
    "plaintext/stripe/accepted.text.njk",
    "plaintext/stripe/failed.text.njk",
    "plaintext/stripe/admin/generated.text.njk",
    "plaintext/stripe/admin/notprocessed.text.njk",
    "plaintext/subscribers/new-artwork.text.njk",
    // 'subscribers/message.text.njk'
  ]) {
    const stream = source(template.replace("text.njk", "txt"));
    stream.end(env.render(template, { ...context }));
    stream.pipe(gulp.dest(".build/email/"));
  }
}

export default renderEmails
