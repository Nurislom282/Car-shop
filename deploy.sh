#!/bin/bash

#PRODUCTION
git reset --hard
git checkout develop
git pull origin develop 

npm i
npm run build
pm2 start process.config.js --env production

#DEVELOPMENT
git reset --hard
git checkout develop
git pull origin develop 

npm i
npm run build
pm2 start process.config.js --env development
