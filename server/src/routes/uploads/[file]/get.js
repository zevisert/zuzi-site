export async function get(ctx) {
  const file = ctx.params.file;
  const cdn_url = `${process.env.CDN_SPACENAME}.${process.env.CDN_REGION}.cdn.${process.env.CDN_HOST}`;
  const requested_file = `${process.env.CDN_DIR}/${file}`;

  ctx.redirect(`https://${cdn_url}/${requested_file}`);
}
