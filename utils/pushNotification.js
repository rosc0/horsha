import { Platform, AsyncStorage, AppState } from 'react-native'
import TimerMixin from 'react-timer-mixin'

// import FCM, {
//   FCMEvent,
//   RemoteNotificationResult,
//   WillPresentNotificationResult,
//   NotificationType,
// } from 'react-native-fcm'

import firebase from 'react-native-firebase'

import NavigationService from './NavigationService'

export const getToken = async () => {
  if (!(await firebase.messaging().hasPermission())) {
    try {
      await firebase.messaging().requestPermission()
    } catch (e) {
      alert('Failed to grant permission')
    }
  }
  // return FCM.getFCMToken()
  return firebase.messaging().getToken()
}

function displayNotificationFromCustomData(message) {
  if (message.data && message.data.title) {
    let notification = new firebase.notifications.Notification()
    notification = notification
      .setTitle(message.data.title)
      .setBody(message.data.body)
      .setData(message.data)
      .setSound('bell.mp3')
    notification.android.setPriority(
      firebase.notifications.Android.Priority.High
    )
    notification.android.setChannelId('test-channel')
    firebase.notifications().displayNotification(notification)
  }
}

export async function registerHeadlessListener(message) {
  await AsyncStorage.setItem('headless', new Date().toISOString())
  displayNotificationFromCustomData(message)
}

export default () => {
  // Build a channel
  const channel = new firebase.notifications.Android.Channel(
    'test-channel',
    'Test Channel',
    firebase.notifications.Android.Importance.Max
  ).setDescription('My apps test channel')

  // Create the channel
  firebase.notifications().android.createChannel(channel)

  // FCM.getInitialNotification().then(notif => {
  //   // this.setState({
  //   //   initNotif: notif
  //   // });
  //   if (notif && notif.opened_from_tray) {
  //     if (notif.type === 'journal_entry_created') {
  //       console.log('notif', notif)
  //       const pay = JSON.parse(notif.payload)
  //       TimerMixin.setTimeout(() => {
  //         NavigationService.navigate('JournalDetail', {
  //           journalId: pay.journal_entry_id,
  //         })
  //       }, 500)
  //     }
  //   }
  // })

  firebase
    .notifications()
    .getInitialNotification()
    .then(notificationOpen => {
      if (notificationOpen) {
        // Get information about the notification that was opened
        const notif = notificationOpen.notification
        // this.setState({
        //   initNotif: notif.data
        // })
        if (notif.type === 'journal_entry_created') {
          console.log('notif', notif)
          const pay = JSON.parse(notif.payload)
          TimerMixin.setTimeout(() => {
            NavigationService.navigate('JournalDetail', {
              journalId: pay.journal_entry_id,
            })
          }, 500)
        }
      }
    })

  // FCM.on(FCMEvent.Notification, async notif => {
  //   if (
  //     Platform.OS === 'ios' &&
  //     notif._notificationType === NotificationType.WillPresent &&
  //     !notif.local_notification
  //   ) {
  //     // this notification is only to decide if you want to show the notification when user if in foreground.
  //     // usually you can ignore it. just decide to show or not.
  //     notif.finish(WillPresentNotificationResult.All)
  //     return
  //   }

  //   // const userInteraction = AppState.currentState === 'background'
  //   // if (userInteraction) {
  //   //   appLink(notif)
  //   // }

  //   if (Platform.OS === 'ios') {
  //     //optional
  //     //iOS requires developers to call completionHandler to end notification process. If you do not call it your background remote notifications could be throttled, to read more about it see the above documentation link.
  //     //This library handles it for you automatically with default behavior (for remote notification, finish with NoData; for WillPresent, finish depend on "show_in_foreground"). However if you want to return different result, follow the following code to override
  //     //notif._notificationType is available for iOS platfrom
  //     switch (notif._notificationType) {
  //       case NotificationType.Remote:
  //         notif.finish(RemoteNotificationResult.NewData) //other types available: RemoteNotificationResult.NewData, RemoteNotificationResult.ResultFailed
  //         break
  //       case NotificationType.NotificationResponse:
  //         notif.finish()
  //         break
  //       case NotificationType.WillPresent:
  //         notif.finish(WillPresentNotificationResult.All) //other types available: WillPresentNotificationResult.None
  //         // this type of notificaiton will be called only when you are in foreground.
  //         // if it is a remote notification, don't do any app logic here. Another notification callback will be triggered with type NotificationType.Remote
  //         break
  //     }
  //   }

  //   // Only handle notifications in background mode
  //   // if (_notificationType !== NotificationType.Remote) {
  //   //   return
  //   // }
  // })

  // this.notificationListener = firebase.notifications().onNotification(notification => {
  //   firebase.notifications().displayNotification(notification);
  // })

  // this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
  //   const notif = notificationOpen.notification;

  //   if (notif.data.targetScreen === 'detail') {
  //     // setTimeout(() => {
  //     //   navigation.navigate('Detail')
  //     // }, 500)
  //   }
  //   setTimeout(() => {
  //     alert(`User tapped notification\n${notif.notificationId}`)
  //   }, 500)
  // });

  // TimerMixin.setTimeout(() => {
  //   FCM.isDirectChannelEstablished().then(d => console.log(d))
  // }, 1000)
}
