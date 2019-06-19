import { createStackNavigator } from 'react-navigation'

import { STACK_CONFIG } from './config'
import PickRideModal from '@screens/trails/components/PickRideModal'

export const ModalPickRideStack = createStackNavigator(
  {
    PickRideModal: PickRideModal,
  },
  {
    initialRouteName: 'PickRideModal',
    defaultNavigationOptions: STACK_CONFIG,
  }
)
