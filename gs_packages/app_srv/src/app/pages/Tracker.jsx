/* eslint-disable react/destructuring-assignment */
/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  Tracker - Main Application View

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

import UR from '@gemstep/ursys/client';
import { Init, HookResize, Draw } from '../modules/tests/test-renderer';
import '../modules/sim/runtime';

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const PR = UR.PrefixUtil('TRACKER', 'TagBlue');
const FCOUT = UR.HTMLConsoleUtil('ursys-console', 1, 0);

/// STYLES ////////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const useStyles = theme => ({
  root: {
    display: 'grid',
    width: '100vw',
    height: '100vh',
    gridTemplateColumns: 'repeat(12,1fr)',
    gridTemplateRows: '50px 1fr 100px',
    gridGap: theme.spacing(1)
  },
  cell: {
    padding: '5px'
  }
});
/// DEBUGGING STUFF ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// debugging stuff
let X = 0;
let INC = 1;
const ZIP = '=@=';
const ZIP_BLNK = ''.padEnd(ZIP.length, ' ');
UR.SystemHook('SIM', 'VIS_UPDATE', frameCount => {
  FCOUT(`framecount: ${frameCount}`);
  if (frameCount % 6) return;
  FCOUT(ZIP_BLNK, 3, X);
  X += INC;
  FCOUT(ZIP, 3, X);
  FCOUT(`X: ${X}`, 4);
  if (X < 1) INC = 1;
  if (X > 24) INC = -1;
});
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// END DEBUGGING STUFF ///////////////////////////////////////////////////////

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class Tracker extends React.Component {
  componentDidMount() {
    const renderRoot = document.getElementById('root-renderer');
    Init(renderRoot);
    HookResize();
    Draw();
  }

  componentWillUnmount() {
    console.log('componentWillUnmount Tracker');
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <div
          style={{
            gridColumnEnd: 'span 12',
            backgroundColor: 'lightcyan'
          }}
        >
          <Typography>RESIZEABLE PIXIJS SHELL</Typography>
        </div>
        <div
          id="ursys-console"
          className={classes.cell}
          style={{ gridColumnEnd: 'span 2', backgroundColor: 'lavender' }}
        >
          DEBUGGER
        </div>
        <div
          id="root-renderer"
          style={{
            gridColumnEnd: 'span 8',
            position: 'relative',
            width: '100%',
            height: '100%'
          }}
        >
          mid
        </div>
        <div
          className={classes.cell}
          style={{ gridColumnEnd: 'span 2', backgroundColor: 'lavender' }}
        >
          right
        </div>
        <div
          className={classes.cell}
          style={{ gridColumnEnd: 'span 12', backgroundColor: 'thistle' }}
        >
          footer
        </div>
      </div>
    );
  }
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// include MaterialUI styles
export default withStyles(useStyles)(Tracker);
