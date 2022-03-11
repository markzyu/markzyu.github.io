import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {connect, useDispatch} from 'react-redux';

import ErrorDialog from './ErrorDialog.js';
import './App.css';
import UserAgreementDialog from './UserAgreementDialog.js';
import { setTheme } from '../actions/index.js';
import { DesktopIcon } from '../components/DesktopIcon.js';
import { faBoxArchive, faCalendarCheck, faCircleInfo, faCopyright, faRecycle, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { AboutMeDialog } from '../components/AboutMeDialog.js';
import { CreditsDialog } from '../components/CreditsDialog.js';
import { ExhibitADialog } from '../components/ExhibitADialog.js';
import { ExhibitBDialog } from '../components/ExhibitBDialog.js';
import { ExhibitCDialog } from '../components/ExhibitCDialog.js';

const App = props => {
  const dispatch = useDispatch();
  const [showAboutMe, setShowAboutMe] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [showExhibitA, setShowExhibitA] = useState(false);
  const [showExhibitB, setShowExhibitB] = useState(false);
  const [showExhibitC, setShowExhibitC] = useState(false);
  const anyShowing = showAboutMe || showCredits || props.showAgreement || props.showError
    || showExhibitA || showExhibitB || showExhibitC; 
  const changeTheme = () => {
    if (props.themeCssPath === 'https://unpkg.com/xp.css@0.2.3/dist/98.css') {
      dispatch(setTheme('https://unpkg.com/xp.css'));
    } else {
      dispatch(setTheme('https://unpkg.com/xp.css@0.2.3/dist/98.css'));
    }
  }
  return (
    <div style={{height: '100%', width: '100%'}}>
      <link rel='stylesheet' type='text/css' href={props.themeCssPath} />
      <div style={{flexDirection: 'row'}}>
        <div style={{flexDirection: 'column'}}>
          <DesktopIcon icon={faCopyright} title='Credits' onClick={() => setShowCredits(true)}/>
          {anyShowing && <DesktopIcon icon={faRecycle} title='Change Theme' onClick={changeTheme}/>}
        </div>
      </div>
      <br/>
      <DesktopIcon icon={faCircleInfo} title='About me' onClick={() => setShowAboutMe(true)}
        className="fixedAboutMe" noposition={true} textColor='#71b1cd' iconColor='#71b1cd' />
      <DesktopIcon icon={faCalendarCheck} title='Exhibit A' onClick={() => setShowExhibitA(true)}
        className="fixedExhibitA" noposition={true} textColor='#3d8daf' iconColor='#3d8daf' />
      <DesktopIcon icon={faBoxArchive} title='Exhibit B' onClick={() => setShowExhibitB(true)}
        className="fixedExhibitB" noposition={true} textColor='#1d4454' iconColor='#1d4454' />
      <DesktopIcon icon={faTrashCan} title='Exhibit C' onClick={() => setShowExhibitC(true)}
        className="fixedExhibitC" noposition={true} textColor='red' iconColor='darkred'/>
      <AboutMeDialog show={showAboutMe} onDismiss={() => setShowAboutMe(false)} />
      <ExhibitCDialog show={showExhibitC} onDismiss={() => setShowExhibitC(false)} />
      <ExhibitBDialog show={showExhibitB} onDismiss={() => setShowExhibitB(false)} />
      <ExhibitADialog show={showExhibitA} onDismiss={() => setShowExhibitA(false)} />
      <CreditsDialog show={showCredits} onDismiss={() => setShowCredits(false)} />
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

  showAgreement: !state.agreement.agreed,
  showError: state.errors.showDialog,
})

export default connect(mapStateToProps)(App);
