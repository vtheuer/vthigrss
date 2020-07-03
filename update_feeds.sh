#!/bin/sh

date
node index.js ultraneophyte domaine_des_teyssieres
git add .
git commit -m"update $(date +'%F %R')"
git push
