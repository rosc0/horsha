// eslint-disable-next-line no-unused-vars
import React, { Component } from 'react'
import { Platform } from 'react-native'
import firebase from 'react-native-firebase'
import setupPushNotifications from '@utils/pushNotification'
import Slack from '../../components/Slack'

const getCircularReplacer = () => {
  const seen = new Set()
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return
      }
      seen.add(value)
    }
    return value
  }
}

class PushNotificationController extends Component {
  async componentDidMount() {
    setupPushNotifications()

    if (!(await firebase.messaging().hasPermission())) {
      try {
        await firebase.messaging().requestPermission()
      } catch (e) {
        alert('Failed to grant permission')
      }
    }

    this.refreshTokenListener = firebase.messaging().onTokenRefresh(token => {
      console.log('TOKEN (onTokenRefresh getFCMToken)', token)
      new Slack(
        'https://hooks.slack.com/services/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'
      ).post(`>> TOKEN refresh >> ${token}`, '@ronaldo')
      if (token) {
        this.props.onChangeToken(token)
      }
    })

    firebase
      .messaging()
      .getToken()
      .then(token => {
        console.log('TOKEN (getFCMToken)', token)
        // this.setState({ token: token || "" })
        // new Slack('https://hooks.slack.com/services/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').post(`>> TOKEN >> ${token}`, '@ronaldo')
        if (token) {
          this.props.onChangeToken(token)
        }
      })

    this.notificationListener = firebase
      .notifications()
      .onNotification(notification => {
        new Slack(
          'https://hooks.slack.com/services/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'
        ).post(
          `>> onNotification >> ${JSON.stringify(
            notification,
            getCircularReplacer()
          )}`,
          '@ronaldo'
        )

        // Display the notification
        firebase.notifications().displayNotification(notification)
      })

    this.notificationOpenedListener = firebase
      .notifications()
      .onNotificationOpened(notificationOpen => {
        new Slack(
          'https://hooks.slack.com/services/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'
        ).post(
          `>> notificationOpen >> ${JSON.stringify(
            notificationOpen,
            getCircularReplacer()
          )}`,
          '@ronaldo'
        )

        const notif = notificationOpen.notification

        if (notif.data.targetScreen === 'detail') {
          // setTimeout(() => {
          //   navigation.navigate('Detail')
          // }, 500)
        }
        setTimeout(() => {
          alert(`User tapped notification\n${notif.notificationId}`)
        }, 500)
        firebase.notifications().displayNotification(notificationOpen)
      })
  }

  componentWillUnmount() {
    if (this.refreshTokenListener) {
      this.refreshTokenListener()
    }
    if (this.notificationListener) {
      this.notificationListener()
    }
    if (this.notificationOpenedListener) {
      this.notificationOpenedListener()
    }
  }

  render() {
    return null
  }
}

export default PushNotificationController
