/**
* @license
* Copyright (c) Zev Isert, All rights reserved
* This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
*/

module.exports = {
  staticFileGlobs: [
    'manifest.json',
    'src/**/*',
  ],
  runtimeCaching: [
    {
      urlPattern: /\/@webcomponents\/webcomponentsjs\//,
      handler: 'fastest'
    },
    {
      urlPattern: /^https:\/\/fonts.gstatic.com\//,
      handler: 'fastest'
    }
  ]
};
