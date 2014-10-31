#!/bin/bash

# Cleanup
function finish {
    rm imagelist.txt
    rm mask.png
    rm mask.jpg
}

trap finish EXIT 

# Remove demo reports
rm -rf ../demo-reports

# Make all employee pictures anonymous
cp ../images/company/re.jpg mask.jpg
convert mask.jpg -normalize -flop -blur 0x5 mask.jpg
for F in $(ls ../images/company/*.jpg)
do
    convert $F mask.jpg -compose blend  -define compose:args=60 -composite -blur 0x5 -scale 10% -scale 1000% -normalize $F
done
rm mask.jpg

# Remove press resources
rm -rf ../resources/*

# Mark all pictures as Example Only, except the already changed employee images
find .. -type f -exec file {} \; | grep -v SVG | awk -F: '{ if ($2 ~/image/) print $1}'|grep -v '../images/company' > imagelist.txt
convert -size 140x80 xc:none -fill grey -gravity NorthWest -draw "text 10,10 'Example Only'" -gravity SouthEast -draw "text 5,15 'Example Only'" mask.png

for F in $(cat imagelist.txt)
do
    composite -tile mask.png $F $F
done

rm imagelist.txt
rm mask.png

