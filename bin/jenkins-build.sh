#!/bin/bash -x
set -e

SOURCE_FOLDER=GIT
BRANCH=$GIT_BRANCH 
TARGET=$WORKSPACE/target

rm -rf $TARGET
mkdir -p $TARGET

cd $SOURCE_FOLDER

/usr/local/bin/jekyll build --destination $TARGET

# We have some issues with less occationally aka it fails to 
# build but when tried again it works. Prevent us from deploying 
# a broken website.
if [ -s "$TARGET/css/xceptance.css" ]
then
    HOST="<your host>"
    USER="<your ftp user>"
    PASS="<your password>"
    FTPURL="ftp://$USER:$PASS@$HOST"
    LCD=$TARGET
    RCD=""
    #DEBUG="debug 13;"
    DELETE="--delete"

    lftp -c "set ftp:list-options -a;
    set ftp:ssl-auth TLS;
    set ssl:verify-certificate off;
    set ftp:ssl-protect-data true;
    set ftp:ssl-force true;
    $DEBUG
    open '$FTPURL';
    lcd $LCD;
    cd $RCD;
    mirror --reverse \
           --use-cache \
           --parallel=4 \
           $DELETE \
           --verbose"
else
    echo "Less failed."
    exit -1
fi
