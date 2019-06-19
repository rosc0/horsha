import { createStackNavigator } from 'react-navigation'
import { STACK_CONFIG } from './config'
import { globalScreens } from './SharedRouters'
// Offline
import Offline from '@screens/app/Offline'
// Horses
import HorsesList from '@screens/horses/HorsesList'
import AddHorse from '@screens/horses/AddHorse'
import AddHorseTeam from '@screens/horses/AddHorseTeam'
import HorseAlbum from '@screens/horses/HorseAlbum'

// Journal
import TrailCreate from '@screens/trails/Create'

export const HorsesStack = createStackNavigator({
  Horses: {
    screen: Offline(HorsesList),
    navigationOptions: STACK_CONFIG,
  },
  AddHorse: {
    screen: AddHorse,
    navigationOptions: STACK_CONFIG,
  },
  AddHorseTeam: {
    screen: AddHorseTeam,
    navigationOptions: STACK_CONFIG,
  },
  Create: {
    screen: TrailCreate,
    navigationOptions: STACK_CONFIG,
  },
  HorseAlbum: {
    screen: HorseAlbum,
    navigationOptions: STACK_CONFIG,
  },
  ...globalScreens,
})

HorsesStack.navigationOptions = ({ navigation }) => {
  let tabBarVisible = true
  if (navigation.state.index > 0) {
    tabBarVisible = false
  }

  return {
    tabBarVisible,
  }
}
