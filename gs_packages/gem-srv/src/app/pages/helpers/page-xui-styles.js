/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  Revamped styles for the experimental UI interface.

  This is based on page-styles.js

  usage:
    // import
    import { useStylesHOC } from './common-styles'

    // at bottom of component
    export default withStyles(useStylesHOC)(MyComponentName);

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// COLORS ////////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const BG_COLOR = 'transparent';

const CLR_R = 60;
const CLR_G = 256;
const CLR_B = 256;

const CLR_HI_R = 256;
const CLR_HI_G = 30;
const CLR_HI_B = 30;

function RGBA(r, g, b, a) {
  return `rgba(${r},${g},${b},${a})`;
}
// Color Shift: Limit to 0 - 256
function CShift(c, shift) {
  return Math.max(0, Math.min(256, c + shift));
}
function RGBAShift(r, g, b, a, shift) {
  return `rgba(${CShift(r, shift)}, ${CShift(g, shift)}, ${CShift(
    b,
    shift
  )}, ${a})`;
}
function BaseColorShift(shift, alpha) {
  return RGBAShift(CLR_R, CLR_G, CLR_B, alpha, shift);
}

const BG_TITLE = BaseColorShift(0, 0.1); // '#404040';

const CLR_LABEL = BaseColorShift(-150, 1); // '#006600';
const CLR_DATA = BaseColorShift(-100, 1); // '#009900';
const CLR_DATA_INACTIVE = BaseColorShift(-200, 1); // '#003300';
const CLR_ACTIVE = BaseColorShift(50, 1); // '#33FF33';
const CLR_PANEL_BG = BaseColorShift(0, 0.1); // 'rgba(0,256,0,0.1)'; // gradient start
const CLR_PANEL_BG_END = BaseColorShift(0, 0.05); // 'rgba(0,256,0,0.05)'; // gradient end
const CLR_OBJECT = BaseColorShift(0, 0.04); // 'rgba(0,256,0,0.04)'; // a filled object that sits on top of a panel
const CLR_OBJECT_CLICKABLE = BaseColorShift(0, 0.1); // 'rgba(0,256,0,0.1)'; // a more prominent filled object that sits on top of a panel
const CLR_OBJECT_HIGHLIGHT = BaseColorShift(0, 0.25); // an eye catchign button
const CLR_BORDER_BACK = BaseColorShift(128, 0.15); // 'rgba(128,256,128,0.15)'; // backmost panel border
const CLR_BORDER = BaseColorShift(128, 0.3); // 'rgba(128,256,128,0.3)';
const CLR_BORDER_ACTIVE = BaseColorShift(0, 0.6); // 'rgba(0,256,0,0.6)';

const CLR_HI = RGBA(CLR_HI_R, CLR_HI_G, CLR_HI_B, 1); // red
const CLR_HI2 = RGBA(CLR_HI_R, CLR_HI_R, CLR_HI_B, 0.8); // yellow

const FONT_FAMILY = 'sans-serif'; // Andale Mono, monospace';

/// BASE STYLES ///////////////////////////////////////////////////////////////
const BUTTON = {
  fontSize: '18px',
  padding: '5px',
  margin: '5px',
  minHeight: '50px',
  minWidth: '50px',
  borderRadius: '5px',
  color: CLR_DATA,
  backgroundColor: CLR_OBJECT_CLICKABLE,
  borderTopColor: BaseColorShift(0, 0.2),
  borderLeftColor: BaseColorShift(0, 0.2),
  borderRightColor: BaseColorShift(-240, 0.2),
  borderBottomColor: BaseColorShift(-240, 0.2),
  cursor: 'pointer',
  '&:hover': {
    color: CLR_ACTIVE,
    borderTopColor: BaseColorShift(0, 0.4),
    borderLeftColor: BaseColorShift(0, 0.4),
    borderRightColor: BaseColorShift(-240, 0.4),
    borderBottomColor: BaseColorShift(-240, 0.4)
  },
  '&:disabled': {
    color: CLR_DATA_INACTIVE,
    backgroundColor: CLR_OBJECT,
    borderColor: BaseColorShift(-240, 0.2),
    cursor: 'not-allowed'
  }
};

/// STYLE DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const useStylesHOC = theme => ({
  root: {
    display: 'grid',
    width: '100vw',
    height: '100vh',
    gridTemplateColumns: '240px auto 120px',
    gridTemplateRows: '50px auto 100px',
    gridGap: theme.spacing(1),
    fontFamily: 'sans-serif',
    backgroundColor: '#000',
    scrollbarColor: 'red yellow',
    scrollbarWidth: '10px'
  },
  title: {
    fontSize: 'large'
  },
  a: {
    color: CLR_HI2,
    '&:hover': {
      color: CLR_HI
    }
  },
  cell: {
    padding: '5px',
    fontFamily: FONT_FAMILY
  },
  main: {
    gridColumnEnd: 'span 1',
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'scroll'
  },
  top: {
    gridColumnEnd: 'span 3',
    color: BaseColorShift(0, 0.8), // 'white',
    backgroundColor: BG_TITLE,
    overflow: 'hidden'
  },
  right: {
    display: 'grid',
    gridColumnEnd: 'span 1',
    backgroundColor: BG_COLOR,
    overflow: 'hidden'
  },
  left: {
    gridColumnEnd: 'span 1',
    backgroundColor: BG_COLOR,
    display: 'grid',
    overflow: 'hidden'
  },
  bottom: {
    gridColumnEnd: 'span 3',
    backgroundColor: BG_COLOR,
    overflow: 'hidden'
  },
  list: {
    marginLeft: 0,
    paddingLeft: 0,
    listStyle: 'none',
    '& a': {
      color: theme.palette.primary.main,
      fontSize: '150%',
      fontWeight: 'bold',
      display: 'block',
      marginBottom: theme.spacing(0.25),
      textDecoration: 'none'
    },
    '& a:visited': { color: theme.palette.primary },
    '& li + li': { marginTop: theme.spacing(2) }
  },
  panel: {
    color: CLR_DATA,
    border: `1px solid ${CLR_BORDER_BACK}`,
    background: `linear-gradient(${CLR_PANEL_BG}, ${CLR_PANEL_BG_END})`
  },
  panelTitle: {
    color: CLR_ACTIVE,
    backgroundColor: CLR_PANEL_BG
  },
  panelMessage: {
    color: CLR_ACTIVE
  },
  panelMessageError: {
    color: CLR_HI
  },
  infoHighlightColor: {
    color: CLR_HI
  },
  infoLabel: {
    display: 'inline-block',
    color: CLR_LABEL,
    width: '80px',
    textAlign: 'right',
    textTransform: 'uppercase',
    paddingRight: '0.5em'
  },
  infoLabelColor: {
    color: CLR_LABEL
  },
  infoLabelMinimized: {
    display: 'none'
  },
  infoData: {
    display: 'inline-block',
    color: CLR_DATA,
    width: '100px'
  },
  infoDataColor: {
    color: CLR_DATA
  },
  infoDataInactiveColor: {
    color: CLR_DATA_INACTIVE
  },
  infoDataMinimized: {
    width: 'auto',
    paddingRight: '0.5em'
  },
  infoActive: {
    color: CLR_ACTIVE
  },
  inspectorLabel: {
    display: 'inline-block',
    color: CLR_DATA,
    // width: '80px',
    textAlign: 'right',
    marginRight: '3px'
  },
  inspectorLabelLeft: {
    display: 'inline-block',
    color: CLR_DATA,
    textAlign: 'left'
  },
  inspectorData: {
    display: 'inline-block',
    color: CLR_ACTIVE // more visible
    // width: '100px'
  },
  outline: {
    border: `1px solid ${CLR_BORDER}`
  },
  filledOutline: {
    border: `1px solid ${CLR_BORDER}`,
    backgroundColor: CLR_OBJECT
  },
  instructions: {
    color: CLR_LABEL,
    fontStyle: 'italic',
    padding: '3px'
  },
  instanceListItem: {
    padding: '5px',
    margin: '5px',
    lineHeight: '0.8em',
    borderRadius: '5px',
    color: CLR_DATA,
    backgroundColor: CLR_OBJECT_CLICKABLE,
    cursor: 'pointer'
  },
  instanceListItemInactive: {
    color: CLR_LABEL,
    backgroundColor: CLR_OBJECT
  },
  instanceSpec: {
    backgroundColor: '#000',
    // width: '100%', // Keep it narrow so we can stack up multiple in a row
    margin: '0.5em 0 0.5em 0.5em',
    padding: '3px',
    border: '1px solid #00000000',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  instanceSpecHovered: {
    border: '1px solid #ff880088'
  },
  instanceSpecSelected: {
    border: '1px solid #ffff00',
    padding: '10px 5px'
  },
  instanceEditorLineItem: {
    // parent group
    display: 'grid',
    gridTemplateColumns: '80px auto 15px'
  },
  instanceEditorLine: {
    display: 'inline-block'
  },
  instanceEditorLabel: {
    display: 'inline-block',
    color: CLR_DATA,
    width: '80px',
    textAlign: 'right',
    paddingRight: '0.25em'
  },
  instanceEditorData: {
    color: CLR_ACTIVE
  },
  instanceEditorField: {
    width: '100%'
  },
  navButton: {
    fontSize: '14px',
    textDecoration: 'none',
    lineHeight: '30px',
    padding: '5px 1em',
    minHeight: '40px',
    minWidth: '40px',
    borderRadius: '5px',
    color: CLR_ACTIVE,
    backgroundColor: CLR_OBJECT_CLICKABLE,
    borderTopColor: BaseColorShift(0, 0.2),
    borderLeftColor: BaseColorShift(0, 0.2),
    borderRightColor: BaseColorShift(-240, 0.2),
    borderBottomColor: BaseColorShift(-240, 0.2),
    cursor: 'pointer'
  },
  button: {
    ...BUTTON
  },
  buttonHi: {
    ...BUTTON,
    color: CLR_HI,
    borderTopColor: CLR_HI2,
    borderLeftColor: CLR_HI2,
    borderRightColor: CLR_HI2,
    borderBottomColor: CLR_HI2
  },
  buttonSmall: {
    ...BUTTON,
    fontSize: '12px',
    minHeight: '25px',
    minWidth: '25px',
    borderRadius: '5px'
  },
  buttonMini: {
    ...BUTTON,
    fontSize: '10px',
    padding: '0',
    margin: '0',
    minHeight: '15px',
    minWidth: '15px',
    borderRadius: '3px',
    color: CLR_DATA
  },
  buttonLink: {
    // Text only button
    fontSize: '10px',
    padding: '2px',
    margin: '2px',
    minHeight: '15px',
    minWidth: '15px',
    color: CLR_HI2,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    '&:hover': {
      color: CLR_ACTIVE
    }
  },
  buttonOn: {
    ...BUTTON,
    color: CLR_HI,
    backgroundColor: CLR_OBJECT_HIGHLIGHT
  },
  buttonDisabled: {
    ...BUTTON,
    color: CLR_LABEL,
    backgroundColor: CLR_OBJECT,
    borderTopColor: BaseColorShift(0, 0.1),
    borderLeftColor: BaseColorShift(0, 0.1),
    borderRightColor: BaseColorShift(-240, 0.1),
    borderBottomColor: BaseColorShift(-240, 0.1),
    cursor: 'not-allowed'
  },
  disclosureCollapsed: {
    transition: 'transform 0.25s ease-in-out',
    transform: 'rotate(0deg)'
  },
  disclosureExpanded: {
    transition: 'transform 0.25s ease-in-out',
    transform: 'rotate(180deg)'
  },
  input: {
    fontSize: '18px',
    color: CLR_ACTIVE,
    borderTopColor: BaseColorShift(-240, 0.2),
    borderLeftColor: BaseColorShift(-240, 0.2),
    borderRightColor: BaseColorShift(0, 0.1),
    borderBottomColor: BaseColorShift(0, 0.1),
    backgroundColor: CLR_OBJECT_CLICKABLE
  },
  colorData: {
    color: CLR_DATA
  },
  ioTransform: {
    // FormTransform
    color: CLR_DATA
  }
});

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export { useStylesHOC };
