import React, { PureComponent } from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import Icon from './Icon'
import Text from './Text'
import { IconImage } from './Icons'
import { theme } from '../styles/theme'

class MenuItem extends PureComponent {
  render() {
    const { icon, title, onPress, showArrow = true, valueText } = this.props

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.container}
        onPress={onPress}
      >
        <View style={styles.titleContainer}>
          {!!icon && <Icon name={icon} style={styles.icon} />}
          <Text
            type="title"
            weight="bold"
            style={styles.title}
            message={title}
          />
          {!!valueText && (
            <Text weight="bold" message={valueText} style={styles.valueText} />
          )}
          {showArrow && <IconImage style={styles.arrow} source="nextIcon" />}
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingTop: 10,
    backgroundColor: 'white',
    height: 45,
  },
  icon: {
    fontSize: 23,
    marginRight: 15,
    marginBottom: 2,
  },
  titleContainer: {
    flex: 2,
    flexDirection: 'row',
    textAlign: 'center',
    paddingTop: 3,
    paddingBottom: 7,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#DDDCE0',
  },
  title: {
    flex: 2,
    fontSize: 15,
    color: theme.fontColorDark,
  },
  arrow: {
    width: 11,
    height: 19,
    marginLeft: 15,
  },
  valueText: {
    color: theme.fontColorLight,
    fontSize: theme.font.sizes.default,
    textAlign: 'right',
  },
})

export default MenuItem
