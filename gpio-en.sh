#!/bin/sh

if [ ! -d /sys/class/gpio/gpio44 ]; then echo 44 > /sys/class/gpio/export; fi
if [ ! -d /sys/class/gpio/gpio46 ]; then echo 46 > /sys/class/gpio/export; fi

#echo 44 > /sys/class/gpio/export
#echo 46 > /sys/class/gpio/export
echo in > /sys/class/gpio/gpio44/direction
echo out > /sys/class/gpio/gpio46/direction

while :
do
        echo 0 > /sys/class/gpio/gpio46/value
        sleep 2
        echo 1 > /sys/class/gpio/gpio46/value
        sleep 2
        echo 0 > /sys/class/gpio/gpio46/value
        sleep 2
        echo 1 > /sys/class/gpio/gpio46/value
        sleep 2
done
