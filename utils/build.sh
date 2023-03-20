#!/bin/bash
#
# 该build基于 node:10
utils_dir=$(pwd)
project_dir=$(dirname "$utils_dir")
release_dir=${project_dir}/release

if [[ $(uname) == 'Darwin' ]]; then
  alias sedi="sed -i ''"
else
  alias sedi='sed -i'
fi

function change_version() {
  sedi "s@version-dev@${VERSION}@g" "${project_dir}/src/layout/components/NavHeader/About.vue" || return 2
}

function install_deps() {
  # 下载依赖模块并构建
  cd "${project_dir}" || exit 3
  yarn install --verbose || exit 4
  npm rebuild node-sass || exit 5
}

function build() {
  cd "${project_dir}" || exit 1
  # 修改版本号文件
  if [[ -n ${VERSION-''} ]]; then
    change_version || exit 2
  fi
  yarn build:prod || exit 5
  # 打包
  rm -rf "${release_dir:?}"/*
  mkdir -p "${release_dir}"
  to_dir="${release_dir}/lina"

  if [[ -d "dist" ]]; then
    mv dist "${to_dir}"
  elif [[ -d "lina" ]]; then
    mv lina "${to_dir}"
  fi
}

case "${1-}" in
dep)
  install_deps
  ;;
build)
  build
  ;;
*)
  install_deps
  build
  ;;
esac
