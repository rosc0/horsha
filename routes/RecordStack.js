import { createStackNavigator } from 'react-navigation'
import { STACK_CONFIG } from './config'
// Record
import Record from '@screens/record/Record'
import RecordAddRide from '@screens/record/RecordAddRide'

import { globalScreens } from './SharedRouters'

export const RecordStack = createStackNavigator(
  {
    Record: {
      screen: Record,
      navigationOptions: STACK_CONFIG,
    },
    AddRide: {
      screen: RecordAddRide,
      navigationOptions: STACK_CONFIG,
    },
    ...globalScreens,
  },
  {
    initialRouteName: 'Record',
    navigationOptions: STACK_CONFIG,
  }
)
