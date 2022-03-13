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
  
  // dialogOrders: last element in array shows up on top
  const [dialogOrders, setDialogOrders] = useState([]);
  const [visibleDialogs, setVisibleDialogs] = useState(new Set());
  const anyShowing = visibleDialogs.size > 0 || props.showAgreement || props.showError;
  const helpSetShow = (name, show) => {
    var newVisible = new Set(visibleDialogs);
    var newOrders = dialogOrders.filter(x => x !== name);
    if (show) {
      newVisible.add(name);
      newOrders.push(name);
    } else {
      newVisible.delete(name);
    }
    setVisibleDialogs(newVisible);
    setDialogOrders(newOrders);
  };
  const setShow = (name) => () => helpSetShow(name, true);
  const dialogProp = (name) => ({
    onDismiss: () => helpSetShow(name, false),
    show: visibleDialogs.has(name),
    zIndex: dialogOrders.indexOf(name),
  });
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
          <DesktopIcon icon={faCopyright} title='Credits' onClick={setShow('credits')}/>
          {anyShowing && <DesktopIcon icon={faRecycle} title='Change Theme' onClick={changeTheme}/>}
        </div>
      </div>
      <br/>
      <DesktopIcon icon={faCircleInfo} title='About me' onClick={setShow('about-me')}
        className="fixedAboutMe" noposition={true} textColor='#71b1cd' iconColor='#71b1cd' />
      <DesktopIcon icon={faCalendarCheck} title='Exhibit A' onClick={setShow('exhibit-a')}
        className="fixedExhibitA" noposition={true} textColor='#3d8daf' iconColor='#3d8daf' />
      <DesktopIcon icon={faBoxArchive} title='Exhibit B' onClick={setShow('exhibit-b')}
        className="fixedExhibitB" noposition={true} textColor='#1d4454' iconColor='#1d4454' />
      <DesktopIcon icon={faTrashCan} title='Exhibit C' onClick={setShow('exhibit-c')}
        className="fixedExhibitC" noposition={true} textColor='red' iconColor='darkred'/>
      <AboutMeDialog {...dialogProp('about-me')} />
      <ExhibitCDialog {...dialogProp('exhibit-c')} />
      <ExhibitBDialog {...dialogProp('exhibit-b')} />
      <ExhibitADialog {...dialogProp('exhibit-a')} />
      <CreditsDialog {...dialogProp('credits')} />
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
