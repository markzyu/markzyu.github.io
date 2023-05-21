const KEY_STONE_STATS = "datav1-lost-ark-stone-stats";
const KEY_USER_AGREEMENT_READ = "metav1-user-agreement-read";

export const setAgreementRead = boolVal => {
  window.localStorage.setItem(KEY_USER_AGREEMENT_READ, JSON.stringify(boolVal));
}

export const setStoneStats = json => {
  window.localStorage.setItem(KEY_STONE_STATS, JSON.stringify(json));
}

export const getAgreementRead = () => !!JSON.parse(window.localStorage.getItem(KEY_USER_AGREEMENT_READ));

export const getStoneStats = () => JSON.parse(window.localStorage.getItem(KEY_STONE_STATS));