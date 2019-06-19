import { createStackNavigator } from 'react-navigation'

import { STACK_CONFIG } from './config'
import TrailsFilter from '@screens/trails/Filter'

export const ModalTrailsStack = createStackNavigator(
  {
    FilterTrailsModal: TrailsFilter,
  },
  {
    initialRouteName: 'FilterTrailsModal',
    defaultNavigationOptions: STACK_CONFIG,
  }
)
