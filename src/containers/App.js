import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {connect, useDispatch} from 'react-redux';

import ErrorDialog from './ErrorDialog.js';
import './App.css';
import UserAgreementDialog from './UserAgreementDialog.js';
import { setTheme } from '../actions/index.js';
import { DesktopIcon } from '../components/DesktopIcon.js';
import { faBoxArchive, faCalendarCheck, faCircleInfo, faCopyright, faGem, faRecycle, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { AboutMeDialog } from '../components/AboutMeDialog.js';
import { CreditsDialog } from '../components/CreditsDialog.js';
import { ExhibitADialog } from '../components/ExhibitADialog.js';
import { ExhibitBDialog } from '../components/ExhibitBDialog.js';
import { ExhibitCDialog } from '../components/ExhibitCDialog.js';
import { useParams } from 'react-router-dom';
import { NotFoundDialog } from '../components/NotFoundDialog.js';
import history from '../history.js';
import { TTSApp } from '../components/TTSApp.js';
import { OLEDSaver } from '../components/OLEDSaver.js';
import { StonePractice } from '../components/StonePractice.js';

const dialogConfig = {
  'about-me': {title: 'About Me', Component: AboutMeDialog},  //, icon: faCircleInfo, noposition: true, iconClass: 'fixedAboutMe', color: '#71b1cd'},
  'credits': {title: 'Credits', Component: CreditsDialog},
  'exhibit-a': {title: 'Exhibit: A', Component: ExhibitADialog},  //, icon: faCalendarCheck, noposition: true, iconClass: 'fixedExhibitA', color: '#3d8daf'},
  'exhibit-b': {title: 'Exhibit: B', Component: ExhibitBDialog},  //, icon: faBoxArchive, noposition: true, iconClass: 'fixedExhibitB', color: '#1d4454'},
  'exhibit-c': {title: 'Exhibit: C', Component: ExhibitCDialog},  //, icon: faTrashCan, noposition: true, iconClass: 'fixedExhibitC', color: 'red'},
  'not-found': {title: 'Page Not Found', Component: NotFoundDialog},
  'tts-app': {title: 'TTSApp', Component: TTSApp},
  'oled-saver': {title: 'OLED Saver', Component: OLEDSaver},
  'stone-practice': {title: 'Lost Ark Stone Practice', Component: StonePractice, icon: faGem},
};

const validAppIds = new Set(Object.keys(dialogConfig));

const DEFAULT_TITLE = "Mark Yu's homepage";

const App = props => {
  var initAppId = useParams().appId || props.appId;
  if (initAppId && !validAppIds.has(initAppId)) initAppId = 'not-found';

  const dispatch = useDispatch();
  const [appId, setAppId] = useState(initAppId);
  const [isLoaded, setIsLoaded] = useState(false);
  const [dialogOrders, setDialogOrders] = useState(appId ? [appId] : []);
  const [visibleDialogs, setVisibleDialogs] = useState(new Set(appId ? [appId]: []));

  if (appId) {
    document.title = dialogConfig[appId].title;
    history.replace(`/${appId}`);
  }
  else {
    document.title = DEFAULT_TITLE;
    history.replace('/');
  }

  useEffect(() => {
    const onLoad = () => {
      const loadingGif = document.getElementById("loadingGif");
      if(loadingGif) setTimeout(() => {
        loadingGif.style['display'] = 'none';   // Workaround for not having gif during test.
      }, 1000);
      setIsLoaded(true);
    };
    const onAppUnmount = () => window.removeEventListener('load', onLoad);
    window.addEventListener('load', onLoad);
    return onAppUnmount;
  });

  if (!isLoaded) return (
    <link rel='stylesheet' type='text/css' href={props.themeCssPath} />
  );

  // dialogOrders: last element in array shows up on top
  const anyShowing = visibleDialogs.size > 0 || props.showAgreement || props.showError;
  const helpSetShow = (name, show) => {
    var newVisible = new Set(visibleDialogs);
    var newOrders = dialogOrders.filter(x => x !== name);
    if (show) {
      newVisible.add(name);
      newOrders.push(name);
      history.replace(`/${name}`);
      setAppId(name);
    } else {
      newVisible.delete(name);
      const newName = newOrders[newOrders.length - 1];
      history.replace(`/${newName}`);
      setAppId(newName);
    }
    setVisibleDialogs(newVisible);
    setDialogOrders(newOrders);
  };
  const setShow = (name) => () => helpSetShow(name, true);
  const dialogProp = (name) => ({
    onPromote: () => helpSetShow(name, true),
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

  if (!anyShowing) {
    document.title = DEFAULT_TITLE;
    history.replace('/');
  }

  const icons = Object.entries(dialogConfig).filter(([_, {icon}]) => icon).map(([id, {icon, title, iconClass, noposition, color}]) => (
    <DesktopIcon icon={icon} className={iconClass} noposition={noposition} textColor={color} iconColor={color} 
    title={title} linkName={`/${id}`} onClick={() => helpSetShow(id, true)} key={`icon-${id}`} />
  ));

  const dialogs = Object.entries(dialogConfig).map(([id, {Component}]) => (
    <Component key={`dialog-${id}`} {...dialogProp(id)}/>
  ));

  return (
    <div style={{height: '100%', width: '100%'}}>
      <link rel='stylesheet' type='text/css' href={props.themeCssPath} />
      <div style={{flexDirection: 'row'}}>
        <div style={{flexDirection: 'column'}}>
          <DesktopIcon icon={faCopyright} title='Credits' linkName='/credits' onClick={setShow('credits')}/>
          {icons}
          {anyShowing && <DesktopIcon icon={faRecycle} title='Change Theme' onClick={changeTheme}/>}
        </div>
      </div>
      <br/>
      {dialogs}
      <ErrorDialog />
      <UserAgreementDialog />
    </div>
  );
}

App.propTypes = {
  content: PropTypes.string.isRequired,
  themeCssPath: PropTypes.string.isRequired,
  appId: PropTypes.string,
}

const mapStateToProps = (state, props) => ({
  content: 'foobar',
  themeCssPath: state.themeCss.themeCssPath,

  showAgreement: !state.agreement.agreed,
  showError: state.errors.showDialog,
})

export default connect(mapStateToProps)(App);
