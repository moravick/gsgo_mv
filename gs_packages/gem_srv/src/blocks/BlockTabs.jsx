/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  Draw the tabs and align them with children

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import React from 'react';
import merge from 'deepmerge';
// material ui
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
// styling
import { makeStyles } from '@material-ui/core/styles';
import wireframeStyles from '../modules/style/wireframing';

/// LOCAL STYLES AND PROPS ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const useStyles = makeStyles(theme =>
  merge.all([
    {
      tabs: {
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.secondary
      }
    },
    wireframeStyles(theme)
  ])
);
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function a11yProps(index) {
  return {
    id: `gem-subtab-${index}`,
    'aria-controls': `gem-subtabpanel-${index}`
  };
}

/// COMPONENT /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// NOTE: global theme properties are passed in _app.js by <ThemeProvider>
/// See theme.js and theme-derived.js to customize theme properties
function SubNavigation(props) {
  const classes = useStyles();
  const [subTabIndex, setSubTabIndex] = React.useState(0);
  const { children } = props;

  /// HANDLERS ////////////////////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  const handleChange = (event, tabIndex) => {
    setSubTabIndex(tabIndex);
  };

  /// RENDER //////////////////////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  ///

  // first generate <Tabs> tab elements from children
  const tabs = React.Children.map(children, (child, index) => {
    const key = `sub-${index}`;
    return (
      <Tab
        key={key} // why? https://reactjs.org/docs/lists-and-keys.html#keys
        label={`${child.props.label}`}
        {...a11yProps(index)}
      />
    );
  });
  // now find only the matching child
  const selectedTabView = React.Children.map(children, child => {
    const match = subTabIndex === child.props.index;
    return match ? child : undefined;
  });
  // return <Tabs> followed by matching child
  return (
    <>
      <Tabs
        value={subTabIndex}
        onChange={handleChange}
        aria-label="GEMSTEP application modes"
        className={classes.tabs}
      >
        {tabs}
      </Tabs>
      {selectedTabView}
    </>
  );
}

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default SubNavigation; // functional component
