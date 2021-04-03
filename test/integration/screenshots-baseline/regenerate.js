/**
* @license
* Copyright (c) Zev Isert, All rights reserved
* This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
*/

const puppeteer = require('puppeteer');
const {createConfig, startServer} = require('es-dev-server');
const path = require('path');
const fs = require('fs');
const baselineDir = `${process.cwd()}/test/integration/screenshots-baseline`;

describe('🎁 regenerate screenshots', function() {
  let result, browser, page;

  before(async function() {
    const config = createConfig({
      port:4444,
      appIndex: path.join(__dirname, '../..', 'index.html'),
      moduleDirs: ['src', 'node_modules'].map(dir => path.join(__dirname, '../..', dir)),
      nodeResolve: true
    })
    result = await startServer(config);

    // Create the test directory if needed.
    if (!fs.existsSync(baselineDir)){
      fs.mkdirSync(baselineDir);
    }
    // And it's subdirectories.
    if (!fs.existsSync(`${baselineDir}/wide`)){
      fs.mkdirSync(`${baselineDir}/wide`);
    }
    if (!fs.existsSync(`${baselineDir}/narrow`)){
      fs.mkdirSync(`${baselineDir}/narrow`);
    }
  });

  after((done) => result.server.close(done));

  beforeEach(async function() {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterEach(() => browser.close());

  it('did it', async function() {
    return generateBaselineScreenshots(page);
  });
});

async function generateBaselineScreenshots(page) {
  const breakpoints = [
      {width: 800, height: 600},
      {width: 375, height: 667}];
  const prefixes = ['wide', 'narrow'];

  for (let i = 0; i < prefixes.length; i++) {
    const prefix = prefixes[i];
    console.log(prefix + '...');
    page.setViewport(breakpoints[i]);
    // Index.
    await page.goto('http://127.0.0.1:4444/');
    await page.screenshot({path: `${baselineDir}/${prefix}/index.png`});
    // Views.
    for (let i = 1; i <= 3; i++) {
      await page.goto(`http://127.0.0.1:4444/view${i}`);
      await page.screenshot({path: `${baselineDir}/${prefix}/view${i}.png`});
    }
    // 404.
    await page.goto('http://127.0.0.1:4444/batmanNotAView');
    await page.screenshot({path: `${baselineDir}/${prefix}/batmanNotAView.png`});
  }
}
