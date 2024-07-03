FROM node:16.20-bullseye-slim as stage-build
ARG TARGETARCH

ARG DEPENDENCIES="                    \
        g++                           \
        make                          \
        python3"

ARG APT_MIRROR=http://mirrors.ustc.edu.cn
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    set -ex \
    && rm -f /etc/apt/apt.conf.d/docker-clean \
    && echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' >/etc/apt/apt.conf.d/keep-cache \
    && sed -i "s@http://.*.debian.org@${APT_MIRROR}@g" /etc/apt/sources.list \
    && apt-get update \
    && apt-get -y install --no-install-recommends ${DEPENDENCIES} \
    && echo "no" | dpkg-reconfigure dash

ARG NPM_REGISTRY="https://registry.npmmirror.com"

RUN set -ex \
    && npm config set registry ${NPM_REGISTRY} \
    && yarn config set registry ${NPM_REGISTRY}

WORKDIR /data

RUN --mount=type=cache,target=/usr/local/share/.cache/yarn,sharing=locked \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    yarn install

ARG VERSION
ENV VERSION=$VERSION

ADD . /data

RUN --mount=type=cache,target=/usr/local/share/.cache/yarn,sharing=locked \
    sed -i "s@version-dev@${VERSION}@g" src/layout/components/NavHeader/About.vue \
    && yarn build

FROM nginx:1.24-bullseye
COPY --from=stage-build /data/lina /opt/lina
COPY nginx.conf /etc/nginx/conf.d/default.conf
