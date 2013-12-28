BeagleBone-SPI-UART
===================

Enables SPI and UART (serial tty*) hardware ports on the BeagleBone Black.

## How to use
On the BeagleBone Black, the SPI ports are both disabled by default, and only the UART0 serial port is accessible via dedicated headers. To easily bypass these limitations, you can use this library in your project, or configure the ports beforehand via the command line interface.

```
$ node BBIO.js --enable-spi 0
$ node BBIO.js --enable-uart 5
```
or
```javascript
var BBIO = require("./BBIO.js");
BBIO.SPI.enable(0, function(){});
BBIO.UART.enable(5, function(){});
```

## API

* __**`BBIO.SPI.enable(index, callback)`**__

Enables the SPI ports on the BeagleBone Black. The `index` parameter specifies the SPI port to enable. Can be either 0 or 1 (there are only two SPI ports on the BeagleBone Black). *Caveat: the HDMI port is inaccessible while the SPI1 is enabled. Be careful!* The `callback` function is invoked after the SPI port is enabled.

* __**`BBIO.UART.enable(index, callback)`**__

Enables the UART (serial tty*) ports on the BeagleBone Black. The `index` parameter specifies the UART port to enable. Can be either 1, 2, 4 or 5 (port 0 is enabled by default and has a dedicated header, while port 3 is sort of irrelevant as it can't receive data). The `callback` function is invoked after the UART port is enabled.

## Activate SPI or UART on boot

As of kernel 3.8.13-r23a.17 the SPI or UART overlays can be automatically activated during system startup, if you already enabled them at least once. There is a special `uEnv.txt` on the boot partition that specifies the user environment setup, with the initial content of `optargs=quiet drm.debug=7`. To access it:

```
$ if [ ! -d /mnt/boot ]; then mkdir /mnt/boot; fi
$ mount /dev/mmcblk0p1 /mnt/boot
$ nano /mnt/boot/uEnv.txt
```

For example, to enable both SPI ports on boot, change the file contents to the following:
```
optargs=quiet drm.debug=7 capemgr.disable_partno=BB-BONELT-HDMI,BB-BONELT-HDMIN capemgr.enable_partno=BB-SPI1-01,BB-SPI0-01
```
*Caveat: the HDMI port is inaccessible while the SPI1 is enabled. Be careful!*
