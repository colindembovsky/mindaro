#!/bin/bash

patch=$1
branch=$2

git checkout -b $branch
git apply patches/$patch.patch