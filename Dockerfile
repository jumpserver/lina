FROM jumpserver/lina-base:20260812_055240 AS stage-build

ARG VERSION
ENV VERSION=$VERSION

ADD . /data
WORKDIR /data

RUN --mount=type=cache,target=/usr/local/share/.cache/yarn,sharing=locked \
    corepack enable \
    && corepack prepare yarn@4.13.0 --activate \
    && yarn --version \
    && yarn install \
    && sed -i "s@version-dev@${VERSION}@g" src/layout/components/NavHeader/About.vue \
    && yarn build

FROM nginx:1.24-bullseye

COPY --from=stage-build /data/lina /opt/lina
COPY nginx.conf /etc/nginx/conf.d/default.conf
