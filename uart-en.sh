#!/bin/sh
# UART4
sudo config-pin P9.11 uart
sudo config-pin P9.13 uart
config-pin -q P9.11
config-pin -q P9.13
# UART1
sudo config-pin P9.24 uart
sudo config-pin P9.26 uart
config-pin -q P9.24
config-pin -q P9.26

