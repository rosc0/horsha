import React from 'react'
import {
  createBottomTabNavigator,
  createStackNavigator,
  createSwitchNavigator,
  createAppContainer,
} from 'react-navigation'
import { getConfig, getModalConfig, STACK_CONFIG, TAB_CONFIG } from './config'
import NavigationService from '../utils/NavigationService'
// Auth
import Welcome from '@screens/welcome/Welcome'
import Login from '@screens/auth/Login'
import SignUp from '@screens/auth/SignUp'
import ForgotPassword from '@screens/auth/ForgotPassword'

import { ModalStack } from './ModalStack'
import { ModalPoiStack } from './ModalPoiStack'
import { ModalTrailsStack } from './ModalTrailsStack'
import { NewsfeedStack } from './NewsfeedStack'
import { RecordStack } from './RecordStack'
import { HorsesStack } from './HorsesStack'
import { TrailsStack } from './TrailsStack'
import { FriendsStack } from './FriendsStack'
import { ModalPickRideStack } from './ModalPickRideStack'

export const LoggedIn = createBottomTabNavigator(
  {
    Record: {
      screen: RecordStack,
      navigationOptions: getModalConfig('record', 'record_ride'),
    },
    Horses: {
      screen: HorsesStack,
      navigationOptions: getConfig('horses', 'horse'),
    },
    Newsfeed: {
      screen: NewsfeedStack,
      navigationOptions: getConfig('newsfeed'),
    },
    Trails: {
      screen: TrailsStack,
      navigationOptions: getConfig('trails'),
    },
    Friends: {
      screen: FriendsStack,
      navigationOptions: getConfig('friends'),
    },
  },
  TAB_CONFIG
)

export const AppNavigator = createAppContainer(
  createStackNavigator(
    {
      LoggedIn: {
        screen: LoggedIn,
        navigationOptions: STACK_CONFIG,
      },
      AddJournalPostModal: {
        screen: ModalStack,
        navigationOptions: STACK_CONFIG,
      },
      FilterPOIModal: {
        screen: ModalPoiStack,
        navigationOptions: STACK_CONFIG,
      },
      FilterTrailModal: {
        screen: ModalTrailsStack,
        navigationOptions: STACK_CONFIG,
      },
      RecordModal: {
        screen: RecordStack,
        navigationOptions: STACK_CONFIG,
      },
      ModalPickRideStack: {
        screen: ModalPickRideStack,
        navigationOptions: STACK_CONFIG,
      },
    },
    {
      mode: 'modal',
      headerMode: 'none',
    }
  )
)

export default class RootStack extends React.PureComponent {
  render() {
    return (
      <AppNavigator
        ref={navigatorRef => {
          NavigationService.setTopLevelNavigator(navigatorRef)
        }}
      />
    )
  }
}

export const LoggedOut = createAppContainer(
  createStackNavigator(
    {
      Welcome: {
        screen: Welcome,
        navigationOptions: { ...STACK_CONFIG, header: null },
      },
      Login: {
        screen: Login,
        navigationOptions: STACK_CONFIG,
      },
      SignUp: {
        screen: SignUp,
        navigationOptions: STACK_CONFIG,
      },
      ForgotPassword: {
        screen: ForgotPassword,
        navigationOptions: STACK_CONFIG,
      },
    },
    { headerMode: 'screen' }
  )
)

export const createRootNavigator = isLoggedIn =>
  createAppContainer(
    createSwitchNavigator(
      {
        LoggedOut: LoggedOut,
        LoggedIn: RootStack,
      },
      {
        initialRouteName: isLoggedIn ? 'LoggedIn' : 'LoggedOut',
      }
    )
  )
