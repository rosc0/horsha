import React, { PureComponent } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import Text from './Text'
import { theme } from '@styles/theme'

class Radio extends PureComponent {
  state = {
    currentValue: null,
  }

  componentDidMount() {
    const { values, defaultValue } = this.props
    const pickedItem = values.filter(i => i.value === defaultValue)

    if (pickedItem.length) {
      this.setState({ currentValue: pickedItem[0].label })
    }
  }

  isChecked = item =>
    item.label === this.state.currentValue ? styles.radioFilled : {}

  select = item => {
    this.setState({ currentValue: item.label })
    this.props.onSelect(item.value)
  }

  render() {
    return (
      <View style={styles.radioWrapper}>
        {this.props.values.map((item, i) => (
          <TouchableOpacity
            key={`r${i}`}
            style={styles.button}
            onPress={() => this.select(item)}
            activeOpacity={0.7}
          >
            <View style={styles.radio}>
              <View style={[styles.radioContent, this.isChecked(item)]} />
            </View>

            <View>
              <Text style={styles.label} text={item.label} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  radioWrapper: {
    marginTop: 10,
  },
  button: {
    width: '100%',
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: {
    height: 20,
    width: 20,
    borderWidth: 2,
    borderColor: '#777777',
    borderRadius: 10,
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: '#777777',
    fontSize: theme.font.sizes.defaultPlus,
  },
  radioContent: {
    borderRadius: 6,
    width: 12,
    height: 12,
  },
  radioFilled: {
    backgroundColor: '#777777',
    borderRadius: 6,
    width: 12,
    height: 12,
  },
})

export default Radio
