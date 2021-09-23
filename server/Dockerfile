FROM node:15.11.0

WORKDIR /app

COPY package-lock.json package.json /app/
RUN npm clean-install

COPY server/src/ /app/server/src/

EXPOSE 8080
CMD [ "npm", "run", "serve:api" ]
