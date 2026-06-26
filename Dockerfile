FROM jumpserver/lina-base:20251204_081759 AS stage-build

ARG VERSION
ENV VERSION=$VERSION

ADD . /data

RUN --mount=type=cache,target=/pnpm/store,sharing=locked \
    sed -i "s@version-dev@${VERSION}@g" src/layout/components/NavHeader/About.vue \
    && pnpm build

FROM nginx:1.24-bullseye
COPY --from=stage-build /data/lina /opt/lina
COPY nginx.conf /etc/nginx/conf.d/default.conf
