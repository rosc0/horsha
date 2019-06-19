import React, { PureComponent } from 'react'
import { StatusBar, StyleSheet, View } from 'react-native'
import { bindActionCreators } from 'redux'
import { FormattedProvider } from 'react-native-globalize'
import { connect } from 'react-redux'
import client from '@utils/crashReporting'
import { Sentry } from 'react-native-sentry'
import DropdownAlert from 'react-native-dropdownalert'

import PushNotificationController from '@utils/push/PushNotificationController'
import Messages from '@config/locales/content'
import RootStack, { LoggedOut } from '@application/routes'
import * as userActions from '@actions/user'
import * as settingsActions from '@actions/settings'
import * as authActions from '@actions/auth'

import Loading from '@components/Loading'
import NotificationsWebSocket from '@components/NotificationsWebSocket'
import analytics from '@config/segment'

class Main extends PureComponent {
  state = {
    showPushNotificationModal: false,
    initNotif: null,
  }

  analyticsInitialized = false

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-unused-vars
    client.notify(error, report => {
      report = {
        ...report,
        context: 'React',
        metadata: info,
      }
    })
    Sentry.captureMessage(`Something went, ${error}`)
    Sentry.setTagsContext({
      environment: 'production',
      react: true,
    })
  }

  componentDidUpdate(prevProps) {
    const { user: props, settings, app } = this.props

    if (app.isError === true && this.dropdown !== undefined) {
      const { type, title, message } = app.error
      this.dropdown.alertWithType(type, title, message)
    }

    // if (!this.analyticsInitialized && props.user.id) {
    //   this.analyticsInitialized = true

    //   analytics.identify({
    //     userId: props.user.id,
    //     traits: {
    //       name: props.user.name,
    //       email: props.user.primary_email,
    //       birthday: props.user.birthday,
    //       createdAt: props.user.date_created,
    //     },
    //   })
    // }

    if (
      !settings.pushNotificationsEnabled &&
      prevProps.user.user.id &&
      prevProps.user.user.id !== props.user.id &&
      !this.state.showPushNotificationModal
    ) {
      // TODO pass this for notification controller
      return this.requestPushNotificationPermission()
    }
  }

  requestPushNotificationPermission = () =>
    this.props.actions.enablePushNotifications()

  handleRegisterDevice = ({ token }) => this.props.actions.registerDevice(token)

  render() {
    const { language, statusBarHidden } = this.props.settings
    const { loggedIn, fetching, checking } = this.props.auth
    const { isDeviceConnected } = this.props.app
    const showLoading = fetching || checking || isDeviceConnected === null
    const isLoggedIn = !checking && loggedIn

    return (
      <FormattedProvider locale={language} messages={Messages}>
        <View style={styles.container}>
          <StatusBar barStyle="light-content" hidden={statusBarHidden} />
          {/* {showLoading && <Loading />} */}
          {isLoggedIn ? <RootStack /> : <LoggedOut />}
          {isDeviceConnected && isLoggedIn && <NotificationsWebSocket />}
          {isLoggedIn && (
            <PushNotificationController
              onChangeToken={token =>
                this.handleRegisterDevice({ token: token || '' })
              }
            />
          )}
        </View>
        <DropdownAlert
          inactiveStatusBarStyle="light-content"
          activeStatusBarStyle="light-content"
          ref={ref => (this.dropdown = ref)}
        />
      </FormattedProvider>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

const mapStateToProps = ({ settings, auth, user, app }) => ({
  settings,
  auth,
  user,
  app,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...userActions,
      ...settingsActions,
      ...authActions,
    },
    dispatch
  ),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Main)
