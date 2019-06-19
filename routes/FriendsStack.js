import { createStackNavigator } from 'react-navigation'
import { STACK_CONFIG } from './config'
// Offline
import Offline from '@screens/app/Offline'

// Friends
import Friends from '@screens/friends/Friends'
import AddFriend from '@screens/friends/AddFriend'
import FriendList from '@screens/friends/FriendList'
import FriendRequests from '@screens/friends/FriendRequests'
import FriendsByKm from '@screens/friends/FriendsByKm'

import { globalScreens } from './SharedRouters'

export const FriendsStack = createStackNavigator({
  Main: {
    screen: Offline(Friends),
    navigationOptions: STACK_CONFIG,
  },
  FriendList: {
    screen: FriendList,
    navigationOptions: STACK_CONFIG,
  },
  FriendRequests: {
    screen: FriendRequests,
    navigationOptions: STACK_CONFIG,
  },
  AddFriend: {
    screen: AddFriend,
    navigationOptions: STACK_CONFIG,
  },
  FriendsByKm: {
    screen: FriendsByKm,
    navigationOptions: STACK_CONFIG,
  },
  ...globalScreens,
})

FriendsStack.navigationOptions = ({ navigation }) => {
  let tabBarVisible = true
  if (navigation.state.index > 0) {
    tabBarVisible = false
  }

  return {
    tabBarVisible,
  }
}
