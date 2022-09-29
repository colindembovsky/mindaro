branch=$1
patch=$2

git checkout -b $branch
git apply patches/$patch.patch