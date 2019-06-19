import React, { PureComponent } from 'react'
import { StyleSheet, View } from 'react-native'
import Text from '@components/Text'
import Button from '@components/Button'
import { theme } from '@styles/theme'

class NewsfeedError extends PureComponent {
  render = () => (
    <View style={styles.container}>
      <Text
        type="title"
        weight="bold"
        style={styles.errorTitle}
        message="newsfeed/errorTitle"
      />

      <Text style={styles.errorContent} message="newsfeed/errorContent" />

      <Button label="common/tryAgain" onPress={this.props.tryAgain} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: theme.backgroundColor,
  },
  errorTitle: {
    fontSize: 20,
    alignSelf: 'center',
  },
  errorContent: {
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 80,
  },
})

export default NewsfeedError
