import countries from 'react-native-country-picker-modal/data/countries-emoji.json'
import store from '@application/store'

const languages = [
  'common',
  'deu',
  'fra',
  'hrv',
  'ita',
  'jpn',
  'nld',
  'por',
  'rus',
  'spa',
  'svk',
  'fin',
  'zho',
  'isr',
]

export const filterLaguage = () => {
  const state = store.getState().settings.language
  const lg = languages.includes(state) ? state : 'common'
  return lg
}

export { countries }
