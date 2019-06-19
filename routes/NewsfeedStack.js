import { createStackNavigator } from 'react-navigation'
import { STACK_CONFIG } from './config'

import Offline from '@screens/app/Offline'
// Newsfeed
import Newsfeed from '@screens/newsfeed/Newsfeed'

import { globalScreens } from './SharedRouters'

export const NewsfeedStack = createStackNavigator({
  News: {
    screen: Offline(Newsfeed),
    navigationOptions: STACK_CONFIG,
  },
  ...globalScreens,
})

NewsfeedStack.navigationOptions = ({ navigation }) => {
  let tabBarVisible = true
  if (navigation.state.index > 0) {
    tabBarVisible = false
  }

  return {
    tabBarVisible,
  }
}
