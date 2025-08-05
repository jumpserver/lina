<<<<<<< HEAD
FROM jumpserver/lina-base:20250805_081024 AS stage-build
=======
FROM jumpserver/lina-base:20250805_081024 AS stage-build
>>>>>>> origin/dev

ARG VERSION
ENV VERSION=$VERSION

ADD . /data

RUN --mount=type=cache,target=/usr/local/share/.cache/yarn,sharing=locked \
    sed -i "s@version-dev@${VERSION}@g" src/layout/components/NavHeader/About.vue \
    && yarn build

FROM nginx:1.24-bullseye
COPY --from=stage-build /data/lina /opt/lina
COPY nginx.conf /etc/nginx/conf.d/default.conf
