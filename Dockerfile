FROM node:10 as stage-build
WORKDIR /data
ADD ./package.json /data/package.json
ADD ./yarn.lock /data/yarn.lock
RUN yarn
ADD . /data
RUN yarn build:prod


FROM nginx:alpine
COPY --from=stage-build /data/dist /opt/lina/
# COPY ./src/assets/i18n /opt/luna/i18n
COPY nginx.conf /etc/nginx/conf.d/default.conf
