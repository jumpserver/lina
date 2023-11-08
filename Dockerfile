FROM node:16.20-bullseye-slim as stage-build
ARG TARGETARCH

ARG DEPENDENCIES="                    \
        g++                           \
        make                          \
        python3"

ARG APT_MIRROR=http://mirrors.ustc.edu.cn
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked,id=lina \
    sed -i "s@http://.*.debian.org@${APT_MIRROR}@g" /etc/apt/sources.list \
    && rm -f /etc/apt/apt.conf.d/docker-clean \
    && ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && apt-get update \
    && apt-get install -y --no-install-recommends ${DEPENDENCIES} \
    && echo "no" | dpkg-reconfigure dash \
    && rm -rf /var/lib/apt/lists/*

ARG NPM_REGISTRY="https://registry.npmmirror.com"
RUN set -ex \
    && npm config set registry ${NPM_REGISTRY} \
    && yarn config set registry ${NPM_REGISTRY}

WORKDIR /data

ADD package.json yarn.lock /data
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn,sharing=locked,id=lina \
    yarn install

ARG VERSION
ENV VERSION=$VERSION
ADD . /data
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn,sharing=locked,id=lina \
    sed -i "s@version-dev@${VERSION}@g" src/layout/components/NavHeader/About.vue \
    && yarn build

FROM nginx:1.24-bullseye
COPY --from=stage-build /data/lina /opt/lina
COPY nginx.conf /etc/nginx/conf.d/default.conf
