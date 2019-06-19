import React, { PureComponent } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import ProgressBar from 'react-native-progress/Bar'

import Text from '@components/Text'

import { theme } from '@styles/theme'
import { IconImage } from './Icons'

class UploadProgress extends PureComponent {
  render() {
    const { progress, text, containerStyle, textStyle, onCancel } = this.props

    return (
      <View style={[styles.container, containerStyle]}>
        <View style={styles.textContainer}>
          {text && (
            <Text
              text={text}
              style={[
                styles.text,
                !onCancel ? styles.textMargin : null,
                textStyle,
              ]}
            />
          )}

          {onCancel && (
            <TouchableOpacity activeOpacity={0.7} onPress={onCancel}>
              <IconImage source="closeIcon" style={styles.cancelButton} />
            </TouchableOpacity>
          )}
        </View>
        <ProgressBar
          width={null}
          progress={progress}
          height={4}
          borderRadius={2}
          borderWidth={0}
          unfilledColor={theme.border}
          color={theme.secondaryColor}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 15,
    height: 60,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButton: {
    width: 10,
    height: 10,
    tintColor: theme.fontColorLight,
    resizeMode: 'contain',
    marginVertical: 15,
    marginLeft: 15,
  },
  text: {
    flex: 1,
  },
  textMargin: {
    marginBottom: 10,
  },
})

export default UploadProgress
