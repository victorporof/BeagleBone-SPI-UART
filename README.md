BeagleBone-SPI-UART
===================

Enables SPI and UART (serial tty*) hardware ports on the BeagleBone Black.

## How to use
On the BeagleBone Black, the SPI ports are both disabled by default, and only the UART0 serial port is accessible via dedicated headers. To easily bypass these limitations, you can use this library.

```javascript
var BBIO = require("./BBIO.js");
BBIO.SPI.enable();
BBIO.UART.enable();
```

## API

* __**`BBIO.SPI.enable(index)`**__

Enables the SPI ports on the BeagleBone Black. The optional `index` parameter specifies the SPI port to enable. Can be either 0 or 1 (there are only two SPI ports on the BeagleBone Black). If unspecified, both SPI ports will be enabled.

* __**`BBIO.UART.enable(index)`**__

Enables the UART (serial tty*) ports on the BeagleBone Black. The optional `index` parameter specifies the UART port to enable. Can be either 1, 2, 4 or 5 (port 0 is enabled by default and has a dedicated header, while port 3 is sort of irrelevant as it can't receive data). If unspecified, all supported UART ports will be enabled.
