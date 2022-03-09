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
    <DismissDialog title="User Agreement" show={props.showAgreement} onDismiss={sendAgree} className="error-modal">
        <em>By using this app, you agree to the following terms. If you do not agree, please DO NOT USE THIS APP.</em>
        <br/>
        <br/>
        Privacy Policy: This app doesn't collect any information remotely. Any data collected by this app is stored locally on your own computer. You can delete such data by clearing cookies and local storage of your browser. This app doesn't target children specifically. IF YOU ARE UNDER THE AGE OF 21, DO NOT USE THIS APP.
        <br/>
        <br/>
        This software is provided to you via the following LICENSE: 
        <br/>
        <br/>
        MIT License
        <br/>
        <br/>
        Copyright (c) 2022 Zhongzhi "Mark" Yu
        <br/>
        <br/>
        Permission is hereby granted, free of charge, to any person obtaining a copy
        of this software and associated documentation files (the "Software"), to deal
        in the Software without restriction, including without limitation the rights
        to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
        copies of the Software, and to permit persons to whom the Software is
        furnished to do so, subject to the following conditions:
        <br/>
        <br/>
        The above copyright notice and this permission notice shall be included in all
        copies or substantial portions of the Software.
        <br/>
        <br/>
        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
        OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
        SOFTWARE.
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
