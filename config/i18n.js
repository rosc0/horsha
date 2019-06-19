import { Globalize } from 'react-native-globalize'
import store from '@application/store'
import translations from '@config/locales/content'

Globalize.loadMessages(translations)
const I18n = new Globalize(store.getState().settings.language || 'en')

const translate = (string = false, values = undefined) => {
  if (!string) return
  return I18n.getMessageFormatter(string)(values)
}

export default translate
