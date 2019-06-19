import React, { PureComponent } from 'react'
import { AsyncStorage, NetInfo } from 'react-native'
import { Provider } from 'react-redux'
import { persistStore } from 'redux-persist'
import Mapbox from '@mapbox/react-native-mapbox-gl'

import Main from '@screens/Main'
import { setConnectionStatus } from '@actions/app'
import { isUserAlreadyLoggedIn } from '@actions/auth'
import store from '@application/store'
import setupPushNotifications from '@utils/pushNotification'
import Loading from '@components/Loading'
import config from 'react-native-config'
import * as k from '@constants/storageKeys'

import { ApolloProvider } from 'react-apollo'
import { client } from './apollo/init'

import './config/ReactotronConfig'

const REDUCERS_PERSIST = [
  'auth',
  'settings',
  'newsfeed',
  'notifications',
  'record',
  'rides',
  'poi',
  // 'trails',
]

Mapbox.setAccessToken(config.MAPBOX_TOKEN)

setupPushNotifications()

class Application extends PureComponent {
  state = {
    rehydrated: false,
  }

  componentDidMount() {
    NetInfo.isConnected.addEventListener(
      'connectionChange',
      this.handleConnectionStatus
    )

    persistStore(
      store,
      {
        storage: AsyncStorage,
        whitelist: REDUCERS_PERSIST,
      },
      this.handleRehydrationComplete
    )
  }

  // Callback to when redux-persist rehydrates the store
  handleRehydrationComplete = async () => {
    // Check if device is connected to internet
    // await this.handleConnectionStatus(await NetInfo.isConnected.fetch())

    // Add listener to when the connectivity changes
    NetInfo.isConnected.addEventListener(
      'connectionChange',
      this.handleConnectionStatus
    )

    const state = store.getState()

    // Attempt to check login if device is connected
    if (state.app.isDeviceConnected) {
      // Attempt to check if user has token before to go to verify token
      const token = await AsyncStorage.getItem(k.AUTH_NEW_TOKENS)
      if (token) {
        await store.dispatch(isUserAlreadyLoggedIn())
      }

      return this.setState({
        rehydrated: true,
      })
    }
    // Device was not connected, listen to internet changes so it validates the token
    return this.setState({
      rehydrated: true,
      shouldTryTokenValidation: true,
    })
  }

  handleConnectionStatus = async status => {
    await store.dispatch(setConnectionStatus(status))

    this.handleUserToken()
  }

  handleUserToken = () => {
    if (this.state.shouldTryTokenValidation) {
      this.setState({
        shouldTryTokenValidation: false,
      })

      return store.dispatch(isUserAlreadyLoggedIn())
    }
  }

  renderContent() {
    const { rehydrated } = this.state

    if (!rehydrated) {
      return <Loading />
    }

    return (
      <ApolloProvider client={client}>
        <Provider store={store}>
          <Main />
        </Provider>
      </ApolloProvider>
    )
  }

  componentWillUnmount() {
    NetInfo.removeEventListener('connectionChange', this.handleConnectionStatus)
  }

  render() {
    return this.renderContent()
  }
}

export default Application
