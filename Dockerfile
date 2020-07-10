FROM node:10 as stage-build
ARG VERSION
ENV VERSION=$VERSION

WORKDIR /data
ADD . /data
RUN cd utils && bash -xieu build.sh

FROM nginx:alpine
COPY --from=stage-build /data/release/lina /opt/lina
COPY nginx.conf /etc/nginx/conf.d/default.conf
