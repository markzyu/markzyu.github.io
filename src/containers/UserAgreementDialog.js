import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import DismissDialog from '../components/DismissDialog';
import { loadAgreementStatus } from '../actions';
import { getAgreementRead, setAgreementRead } from '../store';

const UADialog = props => {
  const sendAgree = () => {
    setAgreementRead(true);
    props.dispatch(loadAgreementStatus(getAgreementRead()));
  };
  return (
    <DismissDialog title="User Agreement" show={props.showAgreement} onDismiss={sendAgree} className="medium-modal">
        <em>By using this app, you agree to the following terms. If you do not agree, please DO NOT USE THIS APP.</em>
        <br/>
        <br/>
        Privacy Policy: This app doesn't collect any information remotely. Any data collected by this app is stored locally on your own computer. You can delete such data by clearing cookies and local storage of your browser. This app doesn't target children specifically. IF YOU ARE UNDER THE AGE OF 21, DO NOT USE THIS APP.
        <br/>
        <br/>
        Copyright (c) 2022 Zhongzhi "Mark" Yu
    </DismissDialog>
  )
};

UADialog.propTypes = {
  showAgreement: PropTypes.bool.isRequired,
}

const mapStateToProps = (state, props) => ({
  showAgreement: !state.agreement.agreed,
});

export const UADialogTestable = UADialog;
export default connect(mapStateToProps)(UADialog);
