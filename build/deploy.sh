#!/bin/bash

git checkout heroku
git rebase master
node build/build.js
git add --all
git commit -a --amend
git push origin heroku -f
git push heroku heroku:master -f
heroku ps:scale web=1
heroku open
git checkout master