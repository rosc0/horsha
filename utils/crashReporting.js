import { Client } from 'bugsnag-react-native'

export default (__DEV__ // eslint-disable-line no-undef
  ? {
      notify: () => {},
    }
  : new Client())
