FROM node:15.11.0 as base

RUN npm install --global --depth 0 pnpm

WORKDIR /site

COPY package.json pnpm-lock.yaml /site/
RUN pnpm install --frozen-lockfile

COPY src/ /site/src/
COPY public/ /site/public/

COPY \
    index.html \
    push-listener.js \
    push-manifest.json \
    vite.config.ts \
    tsconfig.json \
    service-worker.js \
    /site/

EXPOSE 80


FROM base as build
RUN pnpm run build


FROM nginx:alpine as static
COPY nginx.default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /site/.build /usr/share/nginx/html

FROM base as dev
CMD ["npm", "run", "dev", "--", "--host=0.0.0.0", "--port=80"]
