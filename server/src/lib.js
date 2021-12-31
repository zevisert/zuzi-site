import shortid from "shortid";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import os from "os";
import Spaces from "aws-sdk";

export function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z-AZ0-9-]+/g, " ")
    .replace(/-/g, " ")
    .trim()
    .replace(/\s+/g, "-");
}

export async function processImage(image, shouldWatermark = false) {
  const id = shortid.generate();
  const uploadName = `${id}.jpg`;

  const watermarkName = path.join(process.cwd(), "images", "watermark.png");
  const tmpLocalName = path.join(os.tmpdir(), `${id}.png`);
  const localName = path.join(process.cwd(), "server", "uploads", uploadName);
  const cdnName = path.join(process.env.CDN_DIR, uploadName);

  // Resize and downscale image
  await sharp(image.path)
    .resize({ width: 1000 })
    .jpeg({
      progressive: true,
      quality: 100,
    })
    .toFile(tmpLocalName);

  if (shouldWatermark) {
    const raster = sharp(tmpLocalName);
    const image = await raster.metadata();

    // Compose the watermark
    await raster
      .composite([
        {
          input: watermarkName,
          left: 0,
          top: Math.floor(image.height * 0.9),
          blend: "atop",
        },
      ])
      .toFile(localName);

    // Remove the tmpWatermark
    fs.unlinkSync(tmpLocalName);
  } else {
    try {
      fs.renameSync(tmpLocalName, localName);
    } catch (err) {
      fs.copyFileSync(tmpLocalName, localName);
      fs.unlinkSync(tmpLocalName);
    }
  }

  // Upload to DO spaces
  const endpoint = new Spaces.Endpoint(
    `${process.env.CDN_REGION}.${process.env.CDN_HOST}`
  );
  const space = new Spaces.S3({
    endpoint,
    accessKeyId: process.env.CDN_ACCESSKEY,
    secretAccessKey: process.env.CDN_SECRET_ACCESSKEY,
  });

  await space
    .upload({
      Bucket: process.env.CDN_SPACENAME,
      Key: cdnName,
      Body: fs.createReadStream(localName),
      ACL: "public-read",
    })
    .promise();

  return uploadName;
}
