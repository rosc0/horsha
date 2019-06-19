import React, { PureComponent } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import Text from '@components/Text'
import Icon from '@components/Icon'
import { IconImage } from '@components/Icons'
import { theme } from '@styles/theme'

class LinkRow extends PureComponent {
  static defaultProps = {
    onPress: null,
    icon: null,
    containerStyle: null,
    iconStyle: null,
    valueText: null,
    shortBorder: false,
    showArrow: true,
  }

  render() {
    const {
      onPress,
      message,
      icon,
      containerStyle,
      iconStyle,
      valueText,
      shortBorder,
      showArrow,
    } = this.props

    return (
      <TouchableOpacity
        onPress={onPress ? onPress : () => {}}
        activeOpacity={onPress ? 0.7 : 1}
        style={[
          styles.container,
          !shortBorder ? styles.borderBottom : null,
          containerStyle,
        ]}
      >
        {icon && <Icon name={icon} style={[styles.icon, iconStyle]} />}
        <View
          style={[
            styles.contentContainer,
            shortBorder ? styles.borderBottom : null,
          ]}
        >
          <Text
            message={message}
            type="title"
            weight="bold"
            style={styles.linkText}
          />
          {valueText && (
            <Text weight="bold" message={valueText} style={styles.valueText} />
          )}
          {showArrow && (
            <IconImage style={styles.rightArrow} source="nextIcon" />
          )}
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  borderBottom: {
    borderBottomColor: theme.border,
    borderBottomWidth: 1,
  },
  icon: {
    marginRight: 15,
  },
  linkText: {
    flex: 1,
    fontSize: theme.font.sizes.defaultPlus,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 12,
  },
  valueText: {
    color: theme.fontColorLight,
    fontSize: theme.font.sizes.default,
    textAlign: 'right',
  },
  rightArrow: {
    width: 15,
    height: 15,
    resizeMode: 'contain',
    marginLeft: 15,
  },
})

export default LinkRow
