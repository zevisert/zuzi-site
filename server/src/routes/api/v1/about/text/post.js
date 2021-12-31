import { AboutPage } from "../../../../../models/index.js";

export async function post(ctx) {
  let aboutPage = await AboutPage.findOne();
  if (!aboutPage) {
    aboutPage = new AboutPage();
  }

  const body = ctx.request.body;
  const lines = body.lines;
  aboutPage.lines = lines;
  await aboutPage.save();

  ctx.body = { lines: aboutPage.lines };
}
