/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

var cp = require("child_process");
var fs = require("fs");

/**
 * Example use:
 *
 * var ports = require("./BBIO.js");
 * ports.SPI.enable(0, function(){});
 * ports.UART.enable(5, function(){});
 */

var BBIO = {
  /**
   * Gets the path to the bone_capemgr device.
   *
   * @param function callback
   *        Invoked with a path argument, e.g. "/sys/devices/bone_capemgr.8/".
   */
  getCapeManager: function(callback) {
    var devices = fs.readdir("/sys/devices", function(err, devices) {
      if (err) {
        throw "Couldn't get the cape manager device";
      }
      var file = "bone_capemgr";
      var matches = devices.filter(function(s) { return s.indexOf(file) == 0; });
      callback(matches.pop());
    });
  },

  /**
   * Compiles and enables a device tree overlay.
   *
   * @param string capemgr
   *        The path to the bone_capemgr device.
   * @param string dts
   *        A device tree identifier, like "BB-SPI0-01" or "BB-UART1".
   * @param function callback
   *        Invoked when the operation finishes without errors.
   */
  enable: function(capemgr, dts, callback) {
    cp.exec("dtc -O dtb -o " + dts + "-00A0.dtbo -b 0 -@ " + dts + "-00A0.dts", function(err) {
      if (err) {
        throw "Couldn't compile the device tree source";
      }
      cp.exec("cp " + dts + "-00A0.dtbo /lib/firmware/", function(err) {
        if (err) {
          throw "Couldn't copy the device tree into the firmware";
        }
        fs.appendFile("/sys/devices/" + capemgr + "/slots", dts, function(err) {
          if (err) {
            throw "Couldn't enable the " + dts + " device tree overlay";
          }
          callback();
        });
      });
    });
  }
};

BBIO.SPI = {
  /**
   * Enables the SPI ports on the BeagleBone Black.
   *
   * @param number index
   *        The SPI port to enable. Can be either 0 or 1 (there are only two
   *        SPI ports on the BeagleBone Black).
   * @param function callback
   *        Invoked when the SPI port is enabled.
   */
  enable: function(index, callback) {
    BBIO.getCapeManager(function(capemgr) {
      if (index == 0) {
        BBIO.enable(capemgr, "BB-SPI0-01", callback);
      } else if (index == 1) {
        BBIO.enable(capemgr, "BB-SPI1-01", callback);
      }
    });
  },
};

BBIO.UART = {
  /**
   * Enables the UART (serial tty*) ports on the BeagleBone Black.
   *
   * @param number index
   *        The UART port to enable. Can be either 1, 2, 4 or 5 (port 0 is
   *        enabled by default and has a dedicated header, while port 3 is
   *        sort of irrelevant as it can't receive data).
   * @param function callback
   *        Invoked when the UART port is enabled.
   */
  enable: function(index, callback) {
    BBIO.getCapeManager(function(capemgr) {
      if (index == 1) {
        BBIO.enable(capemgr, "BB-UART1", callback);
      } else if (index == 2) {
        BBIO.enable(capemgr, "BB-UART2", callback);
      } else if (index == 4) {
        BBIO.enable(capemgr, "BB-UART4", callback);
      } else if (index == 5) {
        BBIO.enable(capemgr, "BB-UART5", callback);
      }
    });
  }
};

/**
 * Prints information about the current SPI and UART devices to the stdout.
 */
function printDiagnosticInfo() {
  console.log("Checking enabled SPI and UART devices...\n");

  cp.exec("ls /dev/spi*", function(err, stdout, strerr) {
    if (stdout.trim().length) {
      console.log("Available SPI devices:\n" + stdout);
    } else {
      console.log("No SPI devices.\n");
    }

    cp.exec("ls /lib/firmware/BB-SPI*", function(err, stdout, strerr) {
      if (stdout.trim().length) {
        console.log("Installed SPI firmware:\n" + stdout);
      }

      cp.exec("ls /dev/ttyO*", function(err, stdout, strerr) {
        if (stdout.trim().length) {
          console.log("Available UART devices:\n" + stdout);
        } else {
          console.log("No UART devices.\n");
        }

        cp.exec("ls /lib/firmware/BB-UART*", function(err, stdout, strerr) {
          if (stdout.trim().length) {
            console.log("Installed UART firmware:\n" + stdout);
          }
        });
      });
    });
  });
}

/**
 * Function called when this module is ran directly, not imported.
 */
var main = function() {
  var enableSPI = process.argv.indexOf("--enable-spi");
  var enableUART = process.argv.indexOf("--enable-uart");

  if (enableSPI != -1) {
    var port = process.argv[enableSPI + 1];
    console.log("Enabling SPI port " + port + "...");

    BBIO.SPI.enable(port, function() {
      enableSPI = -1;
      maybePrintDiagnosticInfo();
    });
  }

  if (enableUART != -1) {
    var port = process.argv[enableUART + 1];
    console.log("Enabling UART port " + port + "...");

    BBIO.UART.enable(port, function() {
      enableUART = -1;
      maybePrintDiagnosticInfo();
    });
  }

  function maybePrintDiagnosticInfo() {
    if (enableSPI == -1 && enableUART == -1) {
      printDiagnosticInfo();
    }
  }

  maybePrintDiagnosticInfo();
}

if (require.main == module) {
  main();
}

module.exports = BBIO;
