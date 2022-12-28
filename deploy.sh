#!/usr/bin/env sh

set -e

npm run docs:build

cd docs/.vitepress/dist

git init
git add -A
git commit -m "git actions 自动部署"
git push -f https://gitee.com/li-yangjing/docs.git master:gh-pages

cd -
rm -rf docs/.vitepress/dist
