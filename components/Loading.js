import React, { PureComponent } from 'react'
import { StyleSheet, View } from 'react-native'
import { theme } from '@styles/theme'
import { IconImage } from './Icons'

class Loading extends PureComponent {
  render() {
    const {
      type = 'default',
      fullScreen = true,
      containerStyle,
      ...props
    } = this.props

    if (type === 'spinner') {
      if (fullScreen) {
        return (
          <View
            style={[
              styles.container,
              { backgroundColor: 'transparent' },
              containerStyle,
            ]}
          >
            <View
              style={[
                styles.backgroundColor,
                { backgroundColor: 'transparent' },
              ]}
            />
            <IconImage style={styles.image} source="loadingGray" />
          </View>
        )
      }

      return (
        <View
          style={[
            styles.container,
            { backgroundColor: 'transparent' },
            containerStyle,
          ]}
        >
          <View
            style={[styles.backgroundColor, { backgroundColor: 'transparent' }]}
          />
          <IconImage style={styles.image} source="loadingGray" />
        </View>
      )
    }

    return (
      <View style={[styles.container, containerStyle]}>
        <View style={styles.backgroundColor} />
        <IconImage style={styles.image} source="loading" />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    zIndex: 10,
    elevation: 150,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  backgroundColor: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    backgroundColor: theme.mainColor,
  },
  image: {
    resizeMode: 'contain',
    width: 100,
    height: 100,
  },
})

export default Loading
