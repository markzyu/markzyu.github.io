import React from 'react';
import PropTypes from 'prop-types';
import {connect, useDispatch} from 'react-redux';

import ErrorDialog from './ErrorDialog.js';
import './App.css';
import UserAgreementDialog from './UserAgreementDialog.js';
import { showError } from '../actions/index.js';
import { DesktopIcon } from '../components/DesktopIcon.js';
import { faBug } from '@fortawesome/free-solid-svg-icons';

const App = props => {
  const dispatch = useDispatch();
  const throwError = () => {
    try {
      undefined();
    } catch (err) {
      dispatch(showError(err.toString()));
    }
  }
  return (
    <div>
      <div style={{flexDirection: 'row'}}>
        <div style={{flexDirection: 'column'}}>
          <DesktopIcon icon={faBug} title='Throw an Error' onClick={throwError}/>
        </div>
      </div>
      <br/>
      <ErrorDialog />
      <UserAgreementDialog />
    </div>
  );
}

App.propTypes = {
  content: PropTypes.string.isRequired,
}

const mapStateToProps = (state, props) => ({
  content: 'foobar',
})

export default connect(mapStateToProps)(App);
