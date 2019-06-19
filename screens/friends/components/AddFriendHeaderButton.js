import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { StyleSheet, View } from 'react-native'

import AddButton from '@components/AddButton'
import NotificationsHeader from '@components/NotificationsHeader'

class AddFriendButton extends PureComponent {
  render() {
    const { navigation, user } = this.props
    const unverified = user.user.verification_state === 'unverified'

    return (
      <View style={styles.headerIcons}>
        {unverified ? (
          <AddButton
            onPress={() =>
              navigation.navigate('UnverifiedEmail', { context: 'addFriend' })
            }
          />
        ) : (
          <AddButton
            imageStyle={styles.addButton}
            onPress={() => navigation.navigate('AddFriend')}
          />
        )}
        <NotificationsHeader navigation={navigation} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  headerIcons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  addButton: {
    marginRight: 10,
  },
})

export default connect(state => ({
  user: state.user,
}))(AddFriendButton)
