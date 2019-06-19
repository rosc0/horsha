import React, { PureComponent } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import moment from 'moment'

import Text from './Text'
import Datepicker from './Datepicker'
import { IconImage } from '@components/Icons'

import { theme } from '@styles/theme'

import { INPUT_TEXT_SIZE } from '@constants/inputStyle'

class DateField extends PureComponent {
  state = {
    showDatepicker: false,
  }

  toggleDatepicker = () =>
    this.setState(({ showDatepicker }) => ({
      showDatepicker: !showDatepicker,
    }))

  render() {
    const {
      containerStyle,
      labelStyle,
      label,
      value,
      onDateChange,
    } = this.props

    const { showDatepicker } = this.state

    return (
      <View>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.container, containerStyle]}
          onPress={this.toggleDatepicker}
        >
          <Text
            type="title"
            weight="bold"
            style={[styles.label, labelStyle]}
            text={label}
          />
          <Text
            weight="bold"
            text={moment(value).format('MMM DD, YYYY')}
            style={styles.valueText}
          />
          <IconImage style={styles.rightArrow} source="nextIcon" />
        </TouchableOpacity>

        <Datepicker
          visible={showDatepicker}
          date={value}
          onDateChange={onDateChange}
          onClose={this.toggleDatepicker}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingRight: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  label: {
    color: theme.fontColor,
    fontSize: INPUT_TEXT_SIZE,
    marginLeft: 15,
  },
  valueText: {
    flex: 1,
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

export default DateField
