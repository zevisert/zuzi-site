/**
* @license
* Copyright (c) Zev Isert, All rights reserved
* This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
*/

module.exports = {
  importScripts: ['./push-listener.js'],
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
      urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
      handler: 'fastest'
    },
    {
      urlPattern: '/uploads/(.*)',
      handler: 'cacheFirst',
      options: {
        cache: { name: 'artwork' }
      }
    },
    {
      urlPattern: '/api/:version/(.*)',
      handler: 'networkOnly'
    }
  ]
};
