/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { useStylesHOC } from '../page-xui-styles';

class PanelChrome extends React.PureComponent {
  render() {
    const {
      id,
      title,
      isActive,
      children,
      topbar,
      bottombar,
      onClick,
      classes
    } = this.props;
    return (
      <div
        className={classes.panel}
        style={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <div
          className={classes.panelTitle}
          style={{
            fontSize: '12px',
            textTransform: 'uppercase',
            paddingLeft: '0.5em',
            cursor: 'pointer'
          }}
          onClick={() => onClick(id)}
        >
          {title}
        </div>
        {topbar}
        <div style={{ overflow: 'auto' }}>{children}</div>
        {bottombar}
      </div>
    );
  }
}

export default withStyles(useStylesHOC)(PanelChrome);
