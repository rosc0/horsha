import React, { PureComponent } from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import includes from 'lodash/includes'
import xor from 'lodash/xor'

import Text from './Text'
import { theme } from '@styles/theme'
import { IconImage } from '@components/Icons'

class Checkbox extends PureComponent {
  state = {
    checkedValues: [],
  }

  componentDidMount() {
    const { defaultValue } = this.props
    defaultValue && this.setState({ checkedValues: defaultValue })
  }

  isChecked = item => includes(this.props.defaultValue, item.value)

  select = item => {
    const checkedValues = xor(this.state.checkedValues, [item.value])

    this.setState({ checkedValues })
    this.props.onSelect(checkedValues)
  }

  render() {
    const isFirst = i => (i === 0 ? styles.borderTop : {})
    const { labelStyle } = this.props

    return (
      <View style={styles.checkboxWrapper}>
        {this.props.values.map((item, i) => (
          <TouchableOpacity
            key={`r${i}`}
            style={[styles.checkbox, isFirst(i)]}
            onPress={() => this.select(item)}
            activeOpacity={0.7}
          >
            <View style={styles.checkboxContent}>
              <Text
                type="title"
                weight="bold"
                style={[styles.label, labelStyle]}
                text={item.label}
              />
              {this.isChecked(item) && (
                <IconImage
                  style={styles.checkIcon}
                  source="checkIcon"
                  svg
                  fill={theme.secondaryColor}
                />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  checkboxWrapper: {
    width: '100%',
    marginTop: 7,
    backgroundColor: 'white',
  },
  checkbox: {
    height: 45,
    paddingHorizontal: theme.paddingHorizontal,
    borderBottomColor: theme.border,
    borderBottomWidth: 1,
  },
  checkboxContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 45,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  label: {
    fontSize: theme.font.sizes.defaultPlus,
    color: '#777777',
  },
  activeLabel: {
    color: theme.secondaryColor,
  },
  checkIcon: {
    width: 18,
    height: 14,
    right: 10,
  },
})

export default Checkbox
