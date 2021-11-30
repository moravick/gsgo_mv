/* eslint-disable @typescript-eslint/no-use-before-define */
/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  GUI ViewModel Support

  Implement a Model-View-ViewModel style support module for GEMSCRIPT Script
  Wizard renderer.

  STATE MODULE NOTES - State module initialization can only be done once. This
  is similar to setting this.state directly in a React class component
  constructor. The properties set here determine what values are settable, and
  their names must be LOWERCASE and UNIQUE across all StateModules!!! This is to
  help prevent stupid naming errors or ambiguities by forcing you to think
  things through.

  LIFECYCLE NOTES - This module's state data is initialized on load by
  _initializeState(), which occurs well before React initializes

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import UR from '@gemstep/ursys/client';
import StateMgr from '@gemstep/ursys/src/class-state-mgr';
import {
  TextToScript,
  ScriptToText,
  ScriptToLines
} from '../sim/script/transpiler-v2';

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const PR = UR.PrefixUtil('AC-MVVM', 'TagCyan');
const DBG = true;
const DEFAULT_TEXT = `
# BLUEPRINT HoneyBee Bee

// start of agent definition
# PROGRAM DEFINE
addProp frame Number 3
useFeature Movement
# PROGRAM UPDATE
prop skin setTo "bunny.json"
featCall agent.Movement jitterPos -5 5

// start of frame updates
#PROGRAM UPDATE
featCall Movement flapwings

// start of interactive code
# PROGRAM EVENT
onEvent Tick [[
  ifExpr {{ agent.getProp('name').value==='bun0' }} [[
    dbgOut 'my tick' 'agent instance' {{ agent.getProp('name').value }}
    if {{ true }} [[
      // nested nested
    ]]
  ]]
  prop agent.x setTo  0
  prop agent.y setTo 0
]]
# PROGRAM CONDITION
when Bee sometest [[
  dbgOut SingleTest
]]
when Bee sometest Bee [[
  dbgOut PairTest
]]
`.trim();

/// MODULE STATE INITIALIZATION ///////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// create the new instance, and extract the methods we plan to use
const STORE = new StateMgr('WIZARDVIEW');
/// extract methods we want to use interrnally or export
const {
  _initializeState, // special state initializer method
  _interceptState, // special state interceptor method
  State, // return state
  SendState, // send { type, ...data } action to save
  SubscribeState, // provide listener for { type, ...data } on change
  UnsubscribeState // remove listener
} = STORE;

/// declare the allowed state keys for 'WIZARDVIEW'
_initializeState({
  script_text: DEFAULT_TEXT, // the source text
  script_tokens: TextToScript(DEFAULT_TEXT), // an array of tokenized statements
  script_page: ScriptToLines(TextToScript(DEFAULT_TEXT)), // an array of statements turned into lines
  sel_line_num: -1, // selected line of wizard. If < 0 it is not set
  sel_line_pos: -1 // select index into line. If < 0 it is not set
});

/// spy on incoming SendState events and modify/add events as needed
_interceptState(state => {
  const { script_text, script_tokens } = state;

  // if script_text is changing, we also want to emit new script_token
  if (!script_tokens && script_text) {
    try {
      const toks = TextToScript(script_text);
      state.script_tokens = toks;
    } catch (e) {
      // ignore TextTpScript compiler errors during live typing
    }
  }
  // if script_tokens is changing, we also want to emit new script_text
  if (!script_text && script_tokens) {
    try {
      const text = ScriptToText(state.script_tokens);
      state.script_text = text;
    } catch (e) {
      // ignore TextTpScript compiler errors during live typing
    }
  }
});

/// EVENT DISPATCHERS (REDUCERS) //////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function DispatchClick(event) {
  // handle click-outside
  if (this.boxRef && !this.boxRef.current.contains(event.target)) {
    if (DBG) console.log('you just clicked outside of box!');
    return;
  }
  // did a GToken get clicked? It will have token-id set
  const tokId = event.target.getAttribute('data-tokenid');
  if (tokId !== null) {
    if (DBG) console.log(`data clicked ${JSON.stringify(tokId)}`);
    const [line, pos] = tokId.split(',');
    SendState({ sel_line_num: line, sel_line_pos: pos });
    return;
  }
  // if nothing processed, thne unset selection
  if (DBG) console.log('unhandled click. deselecting');
  SendState({ sel_line_num: -1, sel_line_pos: -1 });
}

/// WIZCORE HELPER METHODS ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** return a flat array of all token objects for refence comparison purposes */
function GetAllTokenObjects(statements) {
  const allToks = [];
  statements.forEach(stm => {
    const stmToks = [...stm];
    stmToks.forEach(stok => {
      const { block } = stok;
      if (Array.isArray(block)) {
        allToks.push(...GetAllTokenObjects(block));
      } else allToks.push(stok);
    });
  });
  return allToks;
}

/// MODULE METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** given a token object, return true if the object reference is found anywhere
 *  in the current script_token state object. Used to debug whether we are
 *  passing the same object references around
 */
function IsTokenInMaster(tok) {
  // script_tokens is an array of statements
  let found = false;
  const all = GetAllTokenObjects(State().script_tokens);
  all.forEach(stok => {
    found = found || tok === stok;
  });
  if (DBG) {
    if (found) console.log(...PR('tokens are same object'));
    else console.log('%ctokens are different objects', 'color:red', tok);
  }
  return found;
}

/// FORWARDED STATE METHODS ///////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// dispatchers
export { DispatchClick };
/// utilities
export { IsTokenInMaster, GetAllTokenObjects };
/// forwarded state methods
export { State, SendState, SubscribeState, UnsubscribeState };
