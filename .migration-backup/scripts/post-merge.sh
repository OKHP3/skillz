#!/bin/bash
set -e

cd forge
pnpm install --frozen-lockfile
cd ..
node forge/scripts/build-catalog.js
