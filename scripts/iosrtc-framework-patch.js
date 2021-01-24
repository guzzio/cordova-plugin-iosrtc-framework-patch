// cordova-plugin-iosrtc includes a WebRTC framework that contains architectures
// for both iOS devices and iOS simulators.
// Xcode does not accept device builds with this framework anymore, so we
// have to strip the simulator architectures out.

const fs = require('fs');
const path = require('path');
const exec = require('child_process').execSync;

const ARCH_TYPES = ['i386', 'x86_64', 'armv7', 'arm64'];

module.exports = function(context) {
  var projectRoot = context.opts.projectRoot;
  var projectName = getProjectName(projectRoot);
  const frameworkPath = `./platforms/ios/${projectName}/plugins/cordova-plugin-iosrtc/WebRTC.framework`;
  const WEBRTC_BIN_PATH = path.join(projectRoot, frameworkPath);
  debug('Removing simulator architectures from WebRTC framework of iosrtc plugin');
  debug('Extracting all architectures');
  ARCH_TYPES.forEach(elm => {
    exec(`lipo -extract ${elm} WebRTC -o WebRTC-${elm}`, { cwd: WEBRTC_BIN_PATH });
  });
  debug('Repackage device architectures');
  exec(`lipo -o WebRTC -create WebRTC-armv7 WebRTC-arm64`, { cwd: WEBRTC_BIN_PATH });
  debug('Cleanup other architectures');
  exec(`rm -f WebRTC-*`, { cwd: WEBRTC_BIN_PATH })
    .toString()
    .trim();
};

function debug(msg) {
  console.log('iosrtc-framework-patch.js ' + msg);
}

// Returns the project name
function getProjectName(projectRoot) {
  var cordovaConfigPath = path.join(projectRoot, 'config.xml');
  var content = fs.readFileSync(cordovaConfigPath, 'utf-8');
  return /<name>([\s\S]*)<\/name>/im.exec(content)[1].trim();
}
