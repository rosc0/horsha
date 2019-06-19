import React, { PureComponent } from 'react'
import { StyleSheet, Switch, TouchableOpacity, View } from 'react-native'
import Text from '@components/Text'
import { IconImage } from '@components/Icons'
import { theme } from '@styles/theme'

class StatsFilter extends PureComponent {
  static defaultProps = {
    onlyMineValue: false,
    showValue: '',
    sortValue: '',
    onIndividualRidesChange: () => {},
    onShowPress: () => {},
    onSortPress: () => {},
  }

  render() {
    const {
      onlyMineValue,
      optionsMine = true,
      showValue,
      sortValue,
      onIndividualRidesChange,
      onShowPress,
      onSortPress,
    } = this.props

    return (
      <View style={styles.options}>
        {!optionsMine && (
          <View style={styles.optionsMine}>
            <Text
              type="title"
              weight="bold"
              style={styles.optionsLabel}
              message="stats/onlyMyRides"
            />

            <Switch
              value={onlyMineValue}
              onValueChange={onIndividualRidesChange}
              trackColor={{ true: theme.secondaryColor }}
            />
          </View>
        )}

        <View style={styles.optionsFilter}>
          <TouchableOpacity
            onPress={onShowPress}
            style={styles.optionsMonths}
            activeOpacity={0.7}
          >
            <Text
              type="title"
              weight="bold"
              style={styles.optionsLabel}
              text={showValue}
            />

            <IconImage source="simpleArrow" style={styles.arrow} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onSortPress}
            style={styles.optionsDistance}
            activeOpacity={0.7}
          >
            <Text
              type="title"
              weight="bold"
              style={styles.optionsLabel}
              text={sortValue}
            />

            <IconImage source="simpleArrow" style={styles.arrow} />
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  options: {
    backgroundColor: 'white',
    // paddingBottom: 20,
  },
  optionsMine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.paddingHorizontal,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#efefef',
  },
  optionsLabel: {
    fontSize: theme.font.sizes.default,
    color: '#7d7d7d',
  },
  arrow: {
    width: 10,
    resizeMode: 'contain',
    tintColor: '#bababb',
  },
  optionsFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#efefef',
  },
  optionsMonths: {
    borderRightWidth: 1,
    borderColor: '#efefef',
    paddingHorizontal: theme.paddingHorizontal,
    paddingVertical: 8,
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionsDistance: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.paddingHorizontal,
    width: '50%',
  },
})

export default StatsFilter
