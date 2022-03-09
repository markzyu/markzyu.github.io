export const dismissError = () => ({type: 'DISMISS_ERROR'})
export const showError = (msg) => ({type: 'SHOW_ERROR', msg})
export const setTheme = (path) => ({type: 'SET_THEME_CSS', path})

export const loadAgreementStatus = agreed => ({type: 'LOAD_USER_AGREEMENT_STATUS', agreed})
