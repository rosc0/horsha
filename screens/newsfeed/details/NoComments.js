import React, { PureComponent } from 'react'
import { StyleSheet, View } from 'react-native'
import Text from '@components/Text'

class NoComments extends PureComponent {
  render() {
    return (
      <View style={styles.noComments}>
        <Text
          type="title"
          style={styles.noCommentsText}
          message="newsfeed/noComments"
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  noComments: {
    marginTop: 0,
    marginBottom: 20,
    alignItems: 'center',
  },
  noCommentsText: {
    color: '#999',
  },
})

export default NoComments
