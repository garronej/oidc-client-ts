#!/bin/bash

npm run build
cd ../oidc-spa
rm -rf node_modules .yarn_home
yarn
rm -rf patches/oidc-client-ts+3.1.0.patch
rm -rf node_modules/oidc-client-ts/dist/umd
rm -rf node_modules/oidc-client-ts/dist/types
cp -r ../oidc-client-ts/dist/umd   node_modules/oidc-client-ts/dist/
cp -r ../oidc-client-ts/dist/types node_modules/oidc-client-ts/dist/
npx patch-package oidc-client-ts
yarn start-tanstack-router-example
