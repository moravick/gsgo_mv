/* eslint-disable @typescript-eslint/no-use-before-define */
/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  server debug - centralized debugging utilities

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

const DBG = {
  init: true, // urnet initialization
  mesg: false, // urnet message logic
  sock: false, // socket logic
  calls: false, // message brokering
  reg: false, // message registration
  device: true, // device connections
  xact: false, // server-urnet mRouteMessage
  track: false // step tracking system
};

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
module.exports = {
  // server-wide debug flags
  DBG
};
