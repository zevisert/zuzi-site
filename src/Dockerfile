FROM node:15.11.0 as base

WORKDIR /site

COPY package*.json /site/
RUN npm clean-install

COPY src/ /site/src/
COPY images/ /site/images/

COPY \
    index-legacy.html \
    index.html \
    manifest.json \
    prpl.config.json \
    push-listener.js \
    push-manifest.json \
    rollup.config.js \
    service-worker.js \
    workbox-config.js \
    /site/

EXPOSE 80

FROM base as prpl
RUN npm run build
CMD ["npm", "run", "serve:prpl", "--", "--host=0.0.0.0", "--port=80"]

FROM base as dev
CMD ["npm", "run", "start", "--", "--host=0.0.0.0", "--port=80"]
