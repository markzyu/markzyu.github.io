import { combineReducers } from 'redux'
import { getAgreementRead } from "../store";

const agreement = (state = {agreed: getAgreementRead(), msg: ""}, action) => {
  switch(action.type) {
    case 'LOAD_USER_AGREEMENT_STATUS':
      return {...state, agreed: action.agreed}
    default:
      return state
  }
}

const errors = (state = {showDialog: false, msg: ""}, action) => {
  switch(action.type) {
    case 'DISMISS_ERROR':
      return {...state, showDialog: false}
    case 'SHOW_ERROR':
      return {showDialog: true, msg: action.msg.toString()};
    default:
      return state
  }
}

const themeCss = (state = {themeCssPath: 'https://unpkg.com/xp.css'}, action) => {
  switch(action.type) {
    case 'SET_THEME_CSS':
      return {...state, themeCssPath: action.path}
    default:
      return state
  }
}

export default combineReducers({
  agreement,
  errors,
  themeCss,
})
