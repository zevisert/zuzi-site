import { AboutPage } from "../../../../../models/index.js";

export async function get(ctx) {
  let aboutPage = await AboutPage.findOne();
  if (!aboutPage) {
    aboutPage = new AboutPage();
  }

  ctx.body = { lines: aboutPage.lines };
}
