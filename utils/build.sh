#!/bin/bash
#
# 该build基于 node:10
utils_dir=$(pwd)
project_dir=$(dirname "$utils_dir")
release_dir=${project_dir}/release

if [[ $(uname) == 'Darwin' ]];then
  alias sedi="sed -i ''"
else
  alias sedi='sed -i'
fi

function change_version() {
   sedi "s@Version <strong>.*</strong>@Version <strong>${VERSION}</strong>@g" "${project_dir}/src/layout/components/Footer/index.vue" || return 2
}

# 修改版本号文件
if [[ -n ${VERSION-''} ]]; then
  change_version || exit 2
fi

# 下载依赖模块并构建
cd "${project_dir}" || exit 3
yarn || exit 4
rm -rf lina dist
yarn build:prod || exit 5

# 打包
rm -rf "${release_dir:?}"/*
mkdir -p "${release_dir}"
to_dir="${release_dir}/lina"

if [[ -d "dist" ]];then
  mv dist "${to_dir}"
elif [[ -d "lina" ]]; then
  mv lina "${to_dir}"
fi
