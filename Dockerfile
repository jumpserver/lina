FROM node:14.16 as stage-build
ARG TARGETARCH
ARG NPM_REGISTRY="https://registry.npmmirror.com"
ENV NPM_REGISTY=$NPM_REGISTRY

WORKDIR /data

RUN set -ex \
    && npm config set registry ${NPM_REGISTRY} \
    && yarn config set registry ${NPM_REGISTRY} \
    && yarn config set cache-folder /root/.cache/yarn/lina

ADD package.json yarn.lock /data
RUN --mount=type=cache,target=/root/.cache/yarn \
    yarn install

ARG VERSION
ENV VERSION=$VERSION
ADD . /data
RUN --mount=type=cache,target=/root/.cache/yarn \
    sed -i "s@Version <strong>.*</strong>@Version <strong>${VERSION}</strong>@g" src/layout/components/Footer/index.vue \
    && yarn build

FROM nginx:alpine
COPY --from=stage-build /data/lina /opt/lina
COPY nginx.conf /etc/nginx/conf.d/default.conf
