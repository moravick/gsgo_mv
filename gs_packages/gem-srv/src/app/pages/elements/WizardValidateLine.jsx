/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  WizardTestLine

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import React from 'react';
import UR from '@gemstep/ursys/client';
import * as WIZCORE from '../../../modules/appcore/ac-wizcore';

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const PR = UR.PrefixUtil('TestLine', 'TagPurple');
const LOG = console.log;
const TESTLINE = 'prop';

/// COMPONENT DEFINITION //////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** Returns placeholder text line editor to do script processing of a line
 *  for testing purposes
 */
export function ValidateLineBox(/* props */) {
  /// DEFINE STATE ////////////////////////////////////////////////////////////
  const [input, setInput] = React.useState(TESTLINE);

  /// UI STATE MAINTENANCE ////////////////////////////////////////////////////
  function uiUpdateLine(e) {
    const line = e.target.value;
    setInput(line);
  }
  /// COMPONENT EVENT HANDLERS ////////////////////////////////////////////////
  const processInput = e => {
    console.group(...PR('validating...'));
    LOG(`%c${input}`, 'font-size:1.1rem');
    const { validTokens, vmTokens, lineScript } = WIZCORE.WizardTestLine(input);
    console.groupEnd();
  };

  /// RENDER COMPONENTS ///////////////////////////////////////////////////////
  const iStyle = { backgroundColor: 'white', margin: 0 };
  const bStyle = { margin: 0 };
  return (
    <div
      style={{
        width: '100%',
        display: 'inline-grid',
        gridTemplateColumns: '150px 1fr 150px',
        columnGap: '10px',
        rowGap: 0,
        alignItems: 'center'
      }}
    >
      <tt style={{ color: 'gray' }}>SINGLE LINE DEBUG</tt>
      <input type="text" value={input} onChange={uiUpdateLine} style={iStyle} />
      <button type="submit" onClick={processInput} style={bStyle}>
        VALIDATE
      </button>
    </div>
  );
}
