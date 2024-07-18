FROM jumpserver/lina-base:20240718_032301 AS stage-build

ARG VERSION
ENV VERSION=$VERSION

ADD . /data

RUN --mount=type=cache,target=/usr/local/share/.cache/yarn,sharing=locked \
    sed -i "s@version-dev@${VERSION}@g" src/layout/components/NavHeader/About.vue \
    && yarn build

FROM nginx:1.24-bullseye
COPY --from=stage-build /data/lina /opt/lina
COPY nginx.conf /etc/nginx/conf.d/default.conf
