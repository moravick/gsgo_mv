/* eslint-disable react/destructuring-assignment */
/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  Compiler - Script Parsing and Compiling

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

import UR from '@gemstep/ursys/client';

/// APP MAIN ENTRY POINT //////////////////////////////////////////////////////
import KEYGEN from 'modules/tests/test-keygen';

// this is where classes.* for css are defined
import { useStylesHOC } from './page-styles';

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const PR = UR.PrefixUtil('COMPILER', 'TagBlue');
const HCON = UR.HTMLConsoleUtil('console-left');

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const source = `
defTemplate Bee
defProp nectarAmount GSNumber 0
useFeature FishCounter
useFeature BeanCounter
endTemplate
defTemplate HoneyBee Bee
defProp honeySacks GSNumber 0
endTemplate
`.trim();

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// NOTE: STYLES ARE IMPORTED FROM COMMON-STYLES.JS
class Compiler extends React.Component {
  constructor() {
    super();
    // prep
    this.state = { jsx: <div />, source };
    // bind
    this.dataUpdate = this.dataUpdate.bind(this);
    // hook
    UR.RegisterMessage('SCRIPT_UI_RENDER', this.dataUpdate);
  }

  componentDidMount() {
    document.title = 'GEMSTEP';
    // run test installed by converter.ts
    KEYGEN.TestListSource();
    KEYGEN.TestSourceToProgram();
    KEYGEN.TestSourceToUI();
  }

  componentWillUnmount() {
    console.log('componentWillUnmount');
    UR.UnregisterMessage('SCRIPT_UI_RENDER', this.dataUpdate);
  }

  dataUpdate(jsx) {
    console.log('update');
    this.setState({ jsx });
  }

  /*  Renders 2-col, 3-row grid with TOP and BOTTOM spanning both columns.
   *  The base styles from page-styles are overidden with inline styles to
   *  make this happen.
   */
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root} style={{ gridTemplateColumns: '50% 50%' }}>
        <div
          id="console-top"
          className={clsx(classes.cell, classes.top)}
          style={{ gridColumnEnd: 'span 2' }}
        >
          <span style={{ fontSize: '32px' }}>COMPILER/TEST</span>
        </div>
        <div id="console-left" className={clsx(classes.cell, classes.left)}>
          <h3>SCRIPT PROTO</h3>
          <textarea
            rows={20}
            style={{ boxSizing: 'border-box', width: '100%' }}
            defaultValue="tbd"
          />
          <button type="button" name="toReact">
            Source To React
          </button>{' '}
          <button type="button" name="toSMC">
            Source To SMC
          </button>
        </div>
        <div id="console-right" className={clsx(classes.cell, classes.right)}>
          <h3>UI PROTO</h3>
          {this.state.jsx}
        </div>
        <div
          id="console-bottom"
          className={clsx(classes.cell, classes.bottom)}
          style={{ gridColumnEnd: 'span 2' }}
        >
          console-bottom
        </div>
      </div>
    );
  }
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// include MaterialUI styles
export default withStyles(useStylesHOC)(Compiler);
