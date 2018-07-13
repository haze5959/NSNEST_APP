cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
  {
    "id": "cordova-plugin-statusbar.statusbar",
    "file": "plugins/cordova-plugin-statusbar/www/statusbar.js",
    "pluginId": "cordova-plugin-statusbar",
    "clobbers": [
      "window.StatusBar"
    ]
  },
  {
    "id": "cordova-plugin-splashscreen.SplashScreen",
    "file": "plugins/cordova-plugin-splashscreen/www/splashscreen.js",
    "pluginId": "cordova-plugin-splashscreen",
    "clobbers": [
      "navigator.splashscreen"
    ]
  },
  {
    "id": "cordova-plugin-geolocation.geolocation",
    "file": "plugins/cordova-plugin-geolocation/www/android/geolocation.js",
    "pluginId": "cordova-plugin-geolocation",
    "clobbers": [
      "navigator.geolocation"
    ]
  },
  {
    "id": "cordova-plugin-geolocation.PositionError",
    "file": "plugins/cordova-plugin-geolocation/www/PositionError.js",
    "pluginId": "cordova-plugin-geolocation",
    "runs": true
  },
  {
    "id": "cordova-plugin-fcm.FCMPlugin",
    "file": "plugins/cordova-plugin-fcm/www/FCMPlugin.js",
    "pluginId": "cordova-plugin-fcm",
    "clobbers": [
      "FCMPlugin"
    ]
  },
  {
    "id": "cordova-plugin-device.device",
    "file": "plugins/cordova-plugin-device/www/device.js",
    "pluginId": "cordova-plugin-device",
    "clobbers": [
      "device"
    ]
  },
  {
    "id": "com.cordova.plugins.cookiemaster.cookieMaster",
    "file": "plugins/com.cordova.plugins.cookiemaster/www/cookieMaster.js",
    "pluginId": "com.cordova.plugins.cookiemaster",
    "clobbers": [
      "cookieMaster"
    ]
  },
  {
    "id": "cordova-plugin-inappbrowser.inappbrowser",
    "file": "plugins/cordova-plugin-inappbrowser/www/inappbrowser.js",
    "pluginId": "cordova-plugin-inappbrowser",
    "clobbers": [
      "cordova.InAppBrowser.open",
      "window.open"
    ]
  }
];
module.exports.metadata = 
// TOP OF METADATA
{
  "cordova-plugin-whitelist": "1.3.3",
  "cordova-plugin-statusbar": "2.4.2",
  "cordova-plugin-splashscreen": "5.0.2",
  "cordova-plugin-geolocation": "4.0.1",
  "cordova-plugin-fcm": "2.1.2",
  "cordova-plugin-device": "2.0.2",
  "com.cordova.plugins.cookiemaster": "1.0.0",
  "cordova-plugin-inappbrowser": "3.0.0"
};
// BOTTOM OF METADATA
});