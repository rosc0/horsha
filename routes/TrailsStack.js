import { createStackNavigator } from 'react-navigation'
import { STACK_CONFIG } from './config'
// Offline
import Offline from '@screens/app/Offline'
// Trails
import Trails from '@screens/trails/Trails'
import TrailDetails from '@screens/trails/Details'
import TrailAlbum from '@screens/trails/TrailAlbum'
import TrailCreate from '@screens/trails/Create'
import TrailEdit from '@screens/trails/Edit'
import SeeMore from '@screens/trails/SeeMore'
import { globalScreens } from './SharedRouters'

export const TrailsStack = createStackNavigator({
  Trails: {
    screen: Offline(Trails),
    navigationOptions: STACK_CONFIG,
  },
  Details: {
    screen: TrailDetails,
    navigationOptions: STACK_CONFIG,
  },
  Create: {
    screen: TrailCreate,
    navigationOptions: STACK_CONFIG,
  },
  Edit: {
    screen: TrailEdit,
    navigationOptions: STACK_CONFIG,
  },
  SeeMore: {
    screen: SeeMore,
    navigationOptions: STACK_CONFIG,
  },
  TrailAlbum: {
    screen: TrailAlbum,
    navigationOptions: STACK_CONFIG,
  },
  ...globalScreens,
})

TrailsStack.navigationOptions = ({ navigation }) => {
  let tabBarVisible = true
  if (navigation.state.index > 0) {
    tabBarVisible = false
  }

  return {
    tabBarVisible,
  }
}
