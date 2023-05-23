FROM node:14.16 as stage-build
ARG TARGETARCH
ARG NPM_REGISTRY="https://registry.npmmirror.com"

WORKDIR /data

RUN set -ex \
    && npm config set registry ${NPM_REGISTRY} \
    && yarn config set registry ${NPM_REGISTRY}

ADD package.json yarn.lock /data
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn,sharing=locked,id=lina \
    yarn install

ARG VERSION
ENV VERSION=$VERSION
ADD . /data
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn,sharing=locked,id=lina \
    sed -i "s@version-dev@${VERSION}@g" src/layout/components/NavHeader/About.vue \
    && yarn build

FROM nginx:1.24
COPY --from=stage-build /data/lina /opt/lina
COPY nginx.conf /etc/nginx/conf.d/default.conf
