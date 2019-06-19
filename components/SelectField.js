import React, { PureComponent } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { theme } from '@styles/theme'

import Text from '@components/Text'
import { IconImage } from './Icons'

import {
  INPUT_TEXT_SIZE,
  LABEL_TEXT_SIZE,
  INPUT_HEIGHT,
} from '@constants/inputStyle'

class SelectField extends PureComponent {
  handleSelect = option => this.props.onSelect(option)

  render() {
    const { label, options, value, containerStyle } = this.props

    return (
      <View style={[styles.container, containerStyle]}>
        <Text
          type="title"
          weight="bold"
          style={styles.selectLabel}
          text={label}
        />

        <View style={styles.innerContainer}>
          {options.map((option, key) => (
            <TouchableOpacity
              key={`select-${key}`}
              activeOpacity={0.7}
              style={styles.option}
              onPress={() => this.handleSelect(option.value)}
            >
              <View style={styles.optionLabelContainer}>
                <Text
                  style={styles.optionLabel}
                  weight="bold"
                  type="title"
                  text={option.label}
                />
              </View>

              {value === option.value && (
                <IconImage
                  style={styles.icon}
                  source="checkIcon"
                  svg
                  fill={theme.secondaryColor}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  selectLabel: {
    color: theme.fontColor,
    fontSize: LABEL_TEXT_SIZE,
    marginLeft: 15,
    marginBottom: 4,
  },
  innerContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: theme.border,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  option: {
    flexDirection: 'row',
    height: INPUT_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  icon: {
    width: 15,
    height: 15,
    marginRight: 15,
    marginTop: 12,
  },
  optionLabelContainer: {
    flex: 1,
    paddingLeft: 15,
  },
  optionLabel: {
    marginTop: 13,
    color: theme.fontColor,
    fontSize: INPUT_TEXT_SIZE,
  },
})

export default SelectField
