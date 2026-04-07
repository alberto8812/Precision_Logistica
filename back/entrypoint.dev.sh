#!/bin/sh

echo "Running prisma client"

npx prisma generate

mkdir -p /usr/src/app/dist
ln -sfn /usr/app/generated /usr/src/app/dist/generated

echo "runing prisma migrate"

npx prisma migrate deploy

echo "starting server"
exec pnpm run start:dev