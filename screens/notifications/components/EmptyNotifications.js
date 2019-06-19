import React, { PureComponent } from 'react'
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native'

import Text from '@components/Text'
import Loading from '@components/Loading'

class EmptyNotifications extends PureComponent {
  handleReturn = () => this.props.navigation.goBack(null)

  render() {
    const { fetching } = this.props
    return fetching ? (
      <Loading type="spinner" containerStyle={{ height: 250 }} />
    ) : (
      <ScrollView contentContainerStyle={styles.container}>
        <Text
          message="notifications/noNotifications"
          style={[styles.text, styles.noNotificationsText]}
        />

        <Text message="notifications/noNotificationsInfo" style={styles.text} />

        <TouchableOpacity
          onPress={this.handleReturn}
          style={styles.returnButton}
        >
          <Text
            type="title"
            message="notifications/returnButton"
            style={styles.returnButtonText}
          />
        </TouchableOpacity>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  text: {
    textAlign: 'center',
  },
  noNotificationsText: {
    fontSize: 17,
    color: 'black',
    marginBottom: 5,
  },
  returnButton: {
    backgroundColor: '#73B0A4',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 30,
    marginTop: 30,
  },
  returnButtonText: {
    color: 'white',
  },
})

export default EmptyNotifications
