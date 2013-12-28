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
   * @return string
   *         For example, "/sys/devices/bone_capemgr.8/".
   */
  getCapeManager: function() {
    var path = "/sys/devices";
    var devices = fs.readdirSync(path);

    return devices.filter(function(s) {
      return s.indexOf("bone_capemgr") == 0;
    }).pop();
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
        throw err;
      }
      cp.exec("cp " + dts + "-00A0.dtbo /lib/firmware/", function(err) {
        if (err) {
          throw err;
        }
        fs.appendFile("/sys/devices/" + capemgr + "/slots", dts, function(err) {
          if (err) {
            throw err;
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
    var capemgr = BBIO.getCapeManager();

    if (index == 0) {
      BBIO.enable(capemgr, "BB-SPI0-01", callback);
    }
    else if (index == 1) {
      BBIO.enable(capemgr, "BB-SPI1-01", callback);
    }
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
    var capemgr = BBIO.getCapeManager();

    if (index == 1) {
      BBIO.enable(capemgr, "BB-UART1", callback);
    }
    else if (index == 2) {
      BBIO.enable(capemgr, "BB-UART2", callback);
    }
    else if (index == 4) {
      BBIO.enable(capemgr, "BB-UART4", callback);
    }
    else if (index == 5) {
      BBIO.enable(capemgr, "BB-UART5", callback);
    }
  }
};

module.exports = BBIO;
