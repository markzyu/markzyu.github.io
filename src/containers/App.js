import React from 'react';
import PropTypes from 'prop-types';
import {connect, useDispatch} from 'react-redux';

import ErrorDialog from './ErrorDialog.js';
import './App.css';
import UserAgreementDialog from './UserAgreementDialog.js';
import { setTheme, showError } from '../actions/index.js';
import { DesktopIcon } from '../components/DesktopIcon.js';
import { faBug, faRecycle } from '@fortawesome/free-solid-svg-icons';

const App = props => {
  const dispatch = useDispatch();
  const throwError = () => {
    try {
      undefined();
    } catch (err) {
      dispatch(showError(err.toString()));
    }
  }
  const changeTheme = () => {
    if (props.themeCssPath === 'https://unpkg.com/xp.css@0.2.3/dist/98.css') {
      dispatch(setTheme('https://unpkg.com/xp.css'));
    } else {
      dispatch(setTheme('https://unpkg.com/xp.css@0.2.3/dist/98.css'));
    }
  }
  return (
    <div>
      <link rel='stylesheet' type='text/css' href={props.themeCssPath} />
      <div style={{flexDirection: 'row'}}>
        <div style={{flexDirection: 'column'}}>
          <DesktopIcon icon={faBug} title='Throw an Error' onClick={throwError}/>
          <DesktopIcon icon={faRecycle} title='Change Theme' onClick={changeTheme}/>
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
  themeCssPath: PropTypes.string.isRequired,
}

const mapStateToProps = (state, props) => ({
  content: 'foobar',
  themeCssPath: state.themeCss.themeCssPath,
})

export default connect(mapStateToProps)(App);
