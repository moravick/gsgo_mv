/* eslint-disable consistent-return */
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
import { TStateObject } from '@gemstep/ursys/types';
import * as ASSETS from 'modules/asset_core/asset-mgr';
import * as TRANSPILER from 'script/transpiler-v2';
import * as SENGINE from 'modules/datacore/dc-script-engine';
import { ScriptLiner } from 'script/tools/script-helpers';
import { VSymError } from 'script/tools/symbol-helpers';
// load state
const { StateMgr } = UR.class;

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const PR = UR.PrefixUtil('WIZCORE', 'TagCyan');
const DBG = true;
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let PROJECTS; // current project class-asset-loader
const DEF_ASSETS = 'test-assets'; // gs_assets is root
const DEF_PRJID = 'test-ui';
const DEF_BPID = 'TestAgent';

/// MODULE STATE INITIALIZATION ///////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// First create the new instance, and extract the methods we plan to use
const STORE = new StateMgr('WIZARDVIEW');
/// extract methods we want to use interrnally or export
const {
  _initializeState, // special state initializer method
  _interceptState, // special state interceptor method
  _setState, // special state set without notifier
  State, // return state
  SendState, // send { type, ...data } action to save
  SubscribeState, // provide listener for { type, ...data } on change
  UnsubscribeState // remove listener
} = STORE;
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// initial values of state have to be defined for constructors of components
/// that are relying on it, but these are not yet loaded
_initializeState({
  script_text: '# BLUEPRINT AWAIT LOAD', // the source text (WizardText)
  script_tokens: [], // source tokens (from text)
  script_page: [], // source tokens 'printed' as lines
  line_tokmap: new Map(), // lookup map from tokenLine+Pos to original token
  sel_line_num: -1, // selected line of wizard. If < 0 it is not set
  sel_line_pos: -1, // select index into line. If < 0 it is not set
  error: '', // used fo error messages
  proj_list: [], // project list
  cur_prjid: null, // current project id
  cur_bpid: null, // current blueprint
  cur_bdl: null // current blueprint bundle
});

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// DEFERRED CALL: LOAD_ASSETS will fire after module loaded (and above code)
UR.HookPhase('UR/LOAD_ASSETS', async () => {
  [PROJECTS] = await ASSETS.PromiseLoadAssets(DEF_ASSETS);
  console.log(...PR(`loaded assets from '${DEF_ASSETS}'`));
});
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// DEFERRED CALL: APP_CONFIGURE fires after LOAD_ASSETS (above) completes
UR.HookPhase('UR/APP_CONFIGURE', () => {
  const cur_prjid = DEF_PRJID;
  const cur_bpid = DEF_BPID;
  const bp = GetProjectBlueprint(cur_prjid, cur_bpid);
  const { scriptText: script_text } = bp;
  const vmState = { cur_prjid, cur_bpid, script_text };
  SendState(vmState);
  console.log(...PR(`loaded blueprint '${DEF_BPID}' from '${DEF_PRJID}'`));
});

/// DERIVED STATE LOGIC ///////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// spy on incoming SendState events and modify/add events as needed
_interceptState(state => {
  const { script_text, script_tokens } = state;
  // if script_text is changing, we also want to emit new script_token
  if (!script_tokens && script_text) {
    const toks = TRANSPILER.TextToScript(script_text);
    state.script_tokens = toks;
    state.cur_bdl = TRANSPILER.CompileBlueprint(toks);
    const [vmPage, tokMap] = TRANSPILER.ScriptToLines(toks);
    state.script_page = vmPage;
    state.line_tokmap = tokMap;
  }
  // if script_tokens is changing, we also want to emit new script_text
  if (!script_text && script_tokens) {
    try {
      const text = TRANSPILER.ScriptToText(state.script_tokens);
      state.script_text = text;
      const [vmPage, tokMap] = TRANSPILER.ScriptToLines(script_tokens);
      state.script_page = vmPage;
      state.line_tokmap = tokMap;
    } catch (e) {
      // ignore TextTpScript compiler errors during live typing
      console.error(`wizcore_interceptState tokens: ${e.toString()}`);
    }
  }
});

/// EVENT DISPATCHERS ("REDUCERS") ////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** Called by the document handler set in DevWizard. There are no other
 *  click handlers. Note that event is a React synthetic event which wraps
 *  the native event. https://reactjs.org/docs/events.html
 *  List of mouse events: https://www.w3.org/TR/DOM-Level-3-Events/#events-mouseevents
 */
function DispatchClick(event) {
  const fn = 'DispatchClick:';
  const newState: TStateObject = {};

  /** (1) GToken was clicked? ************************************************/
  const tokenKey = event.target.getAttribute('data-key');
  if (tokenKey !== null) {
    // if (DBG) console.log(...PR(`${fn} clicked ${JSON.stringify(tokenKey)}`));

    // notify subscribers of new current line and token index
    const [line, pos] = tokenKey.split(',');
    newState.sel_line_num = Number(line); // STATE UPDATE: selected line
    newState.sel_line_pos = Number(pos); // STATE UPDATE: selected pos
    SendState(newState);

    const { sel_line_num, sel_line_pos, script_page } = State();
    if (sel_line_num > 0 && sel_line_pos > 0) {
      return;
    }
  }

  /** (N) DESELECT IF NO SPECIFIC CLICK **************************************/
  // if nothing processed, then unset selection
  SendState({ sel_line_num: -1, sel_line_pos: -1 });
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** Called by the EditBox component, or anything that wants to intercept
 *  a click before DispatchClick() guesses no token was clicked
 */
function DispatchEditorClick(event) {
  event.preventDefault();
  event.stopPropagation();
  console.log('form click', event);
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** Called after text editing in CodeJar has stopped and there has been no
 *  input for a few hundred milliseconds. Updates the script_page (token)
 *  display and also updates the text/script privately without sending the
 *  changes bak out
 */
function WizardTextChanged(text) {
  let script_tokens;
  let cur_bdl;
  try {
    script_tokens = TRANSPILER.TextToScript(text); // can throw error
    cur_bdl = TRANSPILER.CompileBlueprint(script_tokens); // can throw error
    const [script_page] = TRANSPILER.ScriptToLines(script_tokens);
    SendState({ script_page });
    _setState({ script_text: text, script_tokens, cur_bdl });
  } catch (e) {
    SendState({ error: e.toString() });
    // eslint-disable-next-line no-useless-return
    return;
  }
  // if there was no error above, then everything was ok
  // so erase the error state!
  SendState({ error: '' });
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** given a scriptText consiting of a single line, return the validation
 *  data for testing. Note that this will nuke the PAGE and MAP structures
 *  for the rest of the script because script-helpers doesn't handle multiple
 *  instances
 */
function WizardTestLine(text) {
  const SPRINTER = new ScriptLiner();
  //  try {
  const script = TRANSPILER.TextToScript(text);
  const [vmPage] = SPRINTER.scriptToLines(script); // note: use different instance
  const [vmPageLine] = vmPage;
  const validTokens = ValidateLine(vmPageLine);
  const { vmTokens, lineScript } = vmPageLine;
  return { validTokens, vmTokens, lineScript };
  //  } catch (e) {
  // const error = e.toString();
  // const re = /(.*)@(\d+):(\d+).*/;
  // let matches = re.exec(error);
  // if (matches) {
  //   const [, errMsg, line, pos] = matches;
  //   const col = Number(pos);
  //   const errLine = `${text.slice(0, col)}***ERROR***`;
  //   // eslint-disable-next-line no-alert
  //   alert(
  //     `LineTester Error in position ${col}:\n\n${errLine}\n${text}\n\n${errMsg}`
  //   );
  // } else console.log(error);
  // } // try-catch
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** given a lineVM, ensure that the scriptUnit is (1) valid and (2) return
 *  TValidationToken objects
 */
function ValidateLine(vmPageLine) {
  // ERRORS AND DEBUG STUFF
  const fn = 'ValidateLine:';
  const { lineScript, globalRefs } = vmPageLine;
  const { cur_bdl } = State();
  if (!Array.isArray(lineScript)) throw Error(`${fn} not a lineScript`);

  // DO THE RIGHT THING: lookup the keyword processor for this line
  const [kw] = TRANSPILER.DecodeStatement(lineScript);
  const kwp = SENGINE.GetKeyword(kw);
  if (kwp === undefined) {
    const keywords = SENGINE.GetAllKeywords();
    return [new VSymError('noexist', `invalid keyword '${kw}'`, { keywords })];
  }
  // DO THE RIGHT THING II: return the Validation Tokens
  kwp.validateInit({ bundle: cur_bdl, globals: globalRefs });
  return kwp.validate(lineScript);
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function GetTokenGUIData(validationToken) {
  const { error, unitText, keywords, features, props, methods, arg } =
    validationToken;
  let names: any = {};
  if (unitText) names.unitText = unitText;
  if (error) names.error = `${error.code} - ${error.info}`;
  if (keywords) names.keywords = keywords.join(', ');
  if (features) names.features = [...Object.keys(features)].join(', ');
  if (props) names.props = [...Object.keys(props)].join(', ');
  if (methods) names.methods = [...Object.keys(methods)].join(', ');
  if (arg) names.arg = arg;
  return names;
}

/// WIZCORE HELPER METHODS ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** Return a flat array of all token objects for refence comparison purposes */
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
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** Return the string of form '1,2', which is the line number and line position
 *  with 1 being the first element. This string is used as a hash.
 */
function SelectedTokenId() {
  const { sel_line_num, sel_line_pos } = State();
  if (sel_line_num < 1) return undefined; // START_COUNT=1 in script-helpers
  if (sel_line_pos < 1) return `${sel_line_num}`;
  return `${sel_line_num},${sel_line_pos}`;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** Return the current line number */
function SelectedLineNum() {
  const { sel_line_num } = State();
  return Number(sel_line_num);
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** return the token by tokenKey 'line,pos'
 */
function GetTokenById(key) {
  const scriptToken = State('line_tokmap').get(key);
  // this can happen if script-helpers ScriptToLines() is called on another body
  // of text that isn't what you're clicking on
  return scriptToken;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** Return selection information, used for interactive lookup */
function SelectedTokenInfo() {
  const scriptToken = GetTokenById(SelectedTokenId());
  const context = {}; // TODO: look up scope from symbol-utilities
  const { sel_line_num: lineNum, sel_line_pos: linePos, script_page } = State();
  if (lineNum > 0 && linePos > 0) {
    const vmPageLine = script_page[lineNum - TRANSPILER.LINE_START_NUM];
    return {
      scriptToken, // the actual script token (not vmToken)
      lineNum, // line number in VMPage
      linePos, // line position in VMPage[lineNum]
      context, // the memory context for this token
      vmPageLine // all the VMTokens in this line
    };
  }
  return undefined;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** Return a string version of a ScriptUnit */
function GetLineScriptText(lineScript) {
  return TRANSPILER.StatementToText(lineScript);
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

/// ASSET UTILITIES ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API: return array of string project ids (.gemprj files) using the
 *  current PROJECTS asset loader instance
 */
function GetProjectList() {
  if (PROJECTS === undefined) throw Error('GetProjectList: no projects loaded');
  return PROJECTS.getProjectsList(); // Array{ id, label }
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API: return { id, metadata, blueprints, instances, rounds, label }
 *  for the given project id (.gemprj files)
 */
function GetProject(prjId = DEF_PRJID) {
  if (PROJECTS === undefined) throw Error('GetProject: no projects loaded');
  const project = PROJECTS.getProjectByProjId(prjId);
  return project;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API: return the blueprint object { id, label, scriptText } for the
 *  given projectId and blueprintId
 */
function GetProjectBlueprint(prjId = DEF_PRJID, bpId = DEF_BPID) {
  const fn = 'GetProjectBlueprint:';
  const project = GetProject(prjId);
  if (project === undefined) throw Error(`no asset project with id ${prjId}`);
  const { blueprints } = project;
  const match = blueprints.find(bp => bp.id === bpId);
  if (match === undefined)
    throw Error(`${fn} no blueprint ${bpId} in project ${prjId}`);
  return match;
}

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API: return the blueprint of the given project,
 *  { id, label, scriptText, ... }
 *  object or undefined if no exist
 */
function LoadProjectBlueprint(prjId, bpId) {
  const { blueprints } = PROJECTS.getProjectByProjId(prjId);
  if (!blueprints) return `no projectId '${prjId}'`;
  const found = blueprints.find(bp => bp.id === bpId);
  if (!found) return `no blueprint '${bpId}' found in '${bpId}'`;
  const { scriptText } = found;
  const scriptToks = TRANSPILER.TextToScript(scriptText);
  let cur_bdl = TRANSPILER.CompileBlueprint(scriptToks);
  SendState({ script_text: scriptText, cur_bdl }, () => {});
}

/// DEBUGGING METHODS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
UR.AddConsoleTool({
  wizcore_script_test: () => {
    console.log(JSON.stringify(State().script_tokens, null, 2));
  }
});

/// EXPORTED BLUEPRINT UTILS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export {
  GetProjectList, // return projectIds in current assets (.gemprj)
  GetProject, // return project data by projectId or undefined
  GetProjectBlueprint // return prjId's bpId or undefined
};
export {
  LoadProjectBlueprint // load scriptText, trigger Wizard redraw
};

/// EXPORTED STATE METHODS ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export { State, SendState, SubscribeState, UnsubscribeState };

/// EXPORTED EVENT DISPATCHERS ////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export {
  DispatchClick, // handles clicks on Wizard document
  WizardTextChanged, // handle incoming change of text
  WizardTestLine, // handle test line for WizardTextLine tester
  DispatchEditorClick, // handle clicks on editing box
  GetTokenGUIData
};

/// EXPORTED VIEWMODEL INFO UTILS //////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export {
  IsTokenInMaster, // does tok exist inside the script_page? (for ref debug)
  GetAllTokenObjects // return a flat array of all tokens (for ref debugging)
};
export {
  SelectedTokenId, // return current selected token identifier
  SelectedLineNum, // return line number of current selected token
  SelectedTokenInfo, // return contextual info about current selected token
  GetLineScriptText, // return string version of a scriptUnit
  ValidateLine // return TValidationToken[]
};
