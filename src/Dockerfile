FROM node:15.11.0

WORKDIR /site

COPY package-lock.json package.json /site/
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

RUN npm run build

EXPOSE 8081
CMD [ "npm", "run", "serve:prpl", "--",  "--host", "0.0.0.0"]
