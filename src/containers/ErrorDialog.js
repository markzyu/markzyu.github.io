import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import DismissDialog from '../components/DismissDialog';
import { dismissError } from '../actions';

const ErrorDialog = props => {
  const sendClose = () => props.dispatch(dismissError());
  return (
    <DismissDialog title="Error Message" show={props.showError} onDismiss={sendClose} className="error-modal">
      <span selects='none'>{props.errorMsg}</span>
    </DismissDialog>
  )
};

ErrorDialog.propTypes = {
  showError: PropTypes.bool.isRequired,
  errorMsg: PropTypes.string.isRequired,
}

const mapStateToProps = (state, props) => ({
  showError: state.errors.showDialog,
  errorMsg: state.errors.msg,
});

export const ErrorDialogTestable = ErrorDialog;
export default connect(mapStateToProps)(ErrorDialog);
