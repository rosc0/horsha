import React, { PureComponent } from 'react'
import { StyleSheet, View, Text as RNText } from 'react-native'
import Autolink from 'react-native-autolink'
import { theme } from '@styles/theme'

/**
 * <Text content={content} />
 */

class Text extends PureComponent {
  render() {
    const { content } = this.props

    if (!content) {
      return null
    }

    return (
      <View style={styles.wrapper}>
        <Autolink
          showAlert
          linkStyle={styles.link}
          style={styles.textContent}
          text={content.replace(/\s{2,}/g, ' ')}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 10,
  },
  textContent: {
    fontSize: theme.font.default.fontSize,
    lineHeight: 20,
    color: theme.fontColorDark,
  },
  link: {
    fontFamily: 'OpenSans-Bold',
    color: theme.secondaryColor,
  },
})

export default Text
