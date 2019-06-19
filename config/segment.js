import Analytics from 'analytics-react-native'
import config from 'react-native-config'

export default (__DEV__ // eslint-disable-line no-undef
  ? {
      track: () => {},
      identify: () => {},
      page: () => {},
    }
  : new Analytics(config.SEGMENT_KEY))
