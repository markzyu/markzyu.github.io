import React from 'react';
import PropTypes from 'prop-types';
import Draggable from 'react-draggable';


const DismissDialog = props => {
  const extras = {style: {border: 'none', maxWidth: '75%'}};
  if (props.show) {
    extras.open = true;
    extras.onDragStart = console.log;
  }
  return (
    <Draggable handle='.title-bar'><dialog className="window" {...extras}>
      <div className='title-bar'>
        <div className="title-bar-text">{props.title}</div>
        <div className='title-bar-controls'>
          <button aria-label='Close' onClick={props.onDismiss}></button>
        </div>
      </div>
      <div className='window-body'>
        {props.children}
        <div className='field-row' style={{justifyContent: 'flex-end', marginTop: 5}}>
          <button onClick={props.onDismiss}>Dismiss</button>
        </div>
      </div>
    </dialog></Draggable>
  )
};

DismissDialog.propTypes = {
  children: PropTypes.node.isRequired,
  onDismiss: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
}

export default DismissDialog;
