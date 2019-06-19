import { createStackNavigator } from 'react-navigation'

import { STACK_CONFIG } from './config'
import POIFilter from '@screens/poi/Filter'

export const ModalPoiStack = createStackNavigator(
  {
    FilterPOIModal: POIFilter,
  },
  {
    initialRouteName: 'FilterPOIModal',
    defaultNavigationOptions: STACK_CONFIG,
  }
)
