FROM docker.io/node:22@sha256:a1f1274dadd49738bcd4cf552af43354bb781a7e9e3bc984cfeedc55aba2ddd8 AS build
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

FROM docker.io/node:22@sha256:a1f1274dadd49738bcd4cf552af43354bb781a7e9e3bc984cfeedc55aba2ddd8 AS test
WORKDIR /towers
COPY --from=build /towers /towers
COPY test test
RUN npm install
RUN npm run test

FROM docker.io/denoland/deno:2.5.6@sha256:3ea71953ff50e3ff15c377ead1a8521f624e2f43d27713675a8bed7b33f166aa AS run
WORKDIR /towers
COPY --from=build /towers/dist/ dist/
COPY src/ src/
COPY --from=test /towers/package.json /towers/package.json
CMD [ "deno" , "run", "--allow-net", "--allow-read", "--allow-env", "src/backend/backend.ts"]
