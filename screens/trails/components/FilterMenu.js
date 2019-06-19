import React, { PureComponent } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Icon from '@components/Icon'
import Text from '@components/Text'
import { IconImage } from '@components/Icons'
import { theme } from '@styles/theme'

class FilterMenu extends PureComponent {
  render() {
    const {
      filterActive,
      onSearchPress,
      onFilterPress,
      viewType,
      onViewTypePress,
    } = this.props

    const isMap = viewType === 'map'

    return (
      <View style={styles.wrapper}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onSearchPress}
          style={[styles.menuItem, styles.menuItemFirst]}
        >
          <IconImage source="searchIcon" style={styles.searchIcon} />

          <Text weight="bold" style={styles.menuText} message="trails/search" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.menuItem, styles.menuItemLast]}
          onPress={onFilterPress}
        >
          <Icon
            name={filterActive ? 'filter_on' : 'filter_off'}
            tintColor={filterActive ? '#84ebd4' : 'white'}
            style={styles.icon}
          />

          <Text weight="bold" style={styles.menuText} message="trails/filter" />

          <Text
            weight="bold"
            style={styles.filter}
            message={filterActive ? 'trails/on' : 'trails/off'}
          />
        </TouchableOpacity>

        {/* <TouchableOpacity
					activeOpacity={0.8}
					style={[styles.menuItem, styles.menuItemLast]}
					onPress={onViewTypePress}
				>
					<Icon name={isMap ? 'list' : 'map'} tintColor="white" style={styles.icon} />

					<Text style={styles.menuText} weight="bold" message={isMap ? 'trails/list' : 'trails/map'} />
				</TouchableOpacity> */}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchIcon: {
    width: 18,
    height: 18,
    marginRight: 10,
  },
  menuItemFirst: {
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    borderRightWidth: 1,
    borderRightColor: '#7DBDB1',
    borderLeftWidth: 0,
  },
  menuItemLast: {
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    borderRightWidth: 0,
    borderLeftWidth: 0,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: '#5fb1a2',
    paddingVertical: 10,
    paddingHorizontal: theme.paddingHorizontal,
    borderRightWidth: 1.5,
    borderRightColor: '#7DBDB1',
  },
  menuText: {
    color: 'white',
    fontSize: theme.font.sizes.default,
  },
  filter: {
    color: 'white',
  },
})

export default FilterMenu
