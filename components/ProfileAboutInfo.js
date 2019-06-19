import React, { Component } from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'

import t from '@config/i18n'
import Text from '@components/Text'
import { theme } from '@styles/theme'

class ProfileAboutInfo extends Component {
  render() {
    const {
      label,
      value = false,
      style,
      ownProfile = false,
      edit = () => {},
      extraValue = false,
      string = 'common/addA',
    } = this.props

    if (ownProfile === true) {
      if (!value || value === null || value === undefined) {
        return (
          <View style={styles.container}>
            <Text
              weight="bold"
              type="title"
              style={[styles.label, style]}
              text={`${label.toUpperCase()}:`}
            />
            <TouchableOpacity style={styles.container} onPress={edit}>
              <Text
                weight="black"
                style={styles.add}
                text={`${t(string)} ${label.toLowerCase()}`}
              />
            </TouchableOpacity>
          </View>
        )
      }
    }

    if (
      !value ||
      value === null ||
      (value === undefined && ownProfile === false)
    ) {
      return <View />
    }

    return (
      <View style={styles.container}>
        <Text
          weight="bold"
          type="title"
          style={[styles.label, style]}
          text={`${label.toUpperCase()}:`}
        />
        <Text weight="black" style={styles.value} text={value} />
        {extraValue && extraValue}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
    height: 25,
  },
  label: {
    color: '#CCC',
    fontSize: theme.font.sizes.small,
    width: 90,
  },
  value: {
    color: '#838383',
    fontSize: theme.font.sizes.small,
  },
  add: {
    color: theme.secondaryColor,
    fontSize: theme.font.sizes.small,
  },
})

export default ProfileAboutInfo
