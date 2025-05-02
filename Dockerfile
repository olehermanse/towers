FROM node:22@sha256:a1f1274dadd49738bcd4cf552af43354bb781a7e9e3bc984cfeedc55aba2ddd8 AS build
WORKDIR /towers
COPY package-lock.json package.json ./
RUN npm install --only=prod
COPY .git .git
COPY src src
COPY public public
COPY add_version.sh add_version.sh
COPY tsconfig.json tsconfig.json
COPY vite.config.js vite.config.js
COPY index.html index.html
RUN rm -rf dist
RUN npm run build
RUN bash add_version.sh

FROM node:22@sha256:a1f1274dadd49738bcd4cf552af43354bb781a7e9e3bc984cfeedc55aba2ddd8 AS test
WORKDIR /towers
COPY --from=build /towers /towers
COPY test test
RUN npm install
RUN npm run test

FROM denoland/deno:2.3.1@sha256:c75db9474ed7bfc24a4b0aa946767ee4a84a30034c188ce55078a591477d5f3e AS run
WORKDIR /towers
COPY --from=build /towers/dist/ dist/
COPY src/ src/
COPY --from=test /towers/package.json /towers/package.json
CMD [ "deno" , "run", "--allow-net", "--allow-read", "--allow-env", "src/backend/backend.ts"]
