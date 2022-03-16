/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  ScriptContextor - Displays the overall context of a blueprint, as well
  as providing help as needed. I'm imagining it as an accordion view.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import React from 'react';
import UR from '@gemstep/ursys/client';
import * as WIZCORE from 'modules/appcore/ac-wizcore';
import Console from './Console';
import { SymbolSelector } from './SymbolSelector';
import { sButtonConsole, buttonStyle } from './wizard-style';

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const PR = UR.PrefixUtil('ScriptContextor');

/// COMPONENT PLAYGROUND //////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function SelectionList(props) {
  const { label, selected } = props;
  const { sel_linenum: line, sel_linepos: pos } = selected;
  /*** here we do things ***/

  // can get get the current GToken?
  const { sel_validation } = WIZCORE.State();
  /** now we output stuff ***/
  if (line < 0) return <p>no selection</p>;
  return (
    <div style={{ fontFamily: 'monospace' }}>
      <p>{label}</p>
      <p>
        [token {line}:{pos}]
      </p>
    </div>
  );
}

/// COMPONENT DEFINITION //////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export function ScriptContextor(props) {
  // we need the current selection
  const { selected } = props;
  const { sel_linenum, sel_linepos } = selected;
  const label = `options for token ${sel_linenum}:${sel_linepos}`;
  // this is a managed TextBuffer with name "ScriptContextor"
  const allDicts = [];

  const { dbg_console } = WIZCORE.State();

  /// RENDER //////////////////////////////////////////////////////////////////
  return (
    <>
      <SymbolSelector selected={selected} />
      <SelectionList label={label} selected={selected} />
      <Console name={dbg_console} rows={5} />
    </>
  );
}
