import React, { PureComponent } from 'react'
import { Image, TouchableOpacity, View } from 'react-native'
import filterStyles from '@styles/screens/trails/filter-modal'
import Text from '@components/Text'
import { arrowIcon, arrowIconTop } from '@components/Icons'

export default class Panel extends PureComponent {
  state = { openned: false }

  render() {
    const { children } = this.props
    const { openned } = this.state
    return (
      <View style={[filterStyles.row, filterStyles.rowSurface]}>
        <View style={[filterStyles.rowItem, { paddingVertical: 0 }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[filterStyles.poiItem, { paddingVertical: 15 }]}
            onPress={() => this.setState({ openned: !this.state.openned })}
          >
            <Text
              weight="semiBold"
              style={filterStyles.poiText}
              message={!openned ? 'trails/showAll' : 'common/showLess'}
            />
            {openned ? (
              <Image
                source={arrowIconTop}
                style={{ width: 15, height: 10, tintColor: 'gray' }}
              />
            ) : (
              <Image
                source={arrowIcon}
                style={{ width: 15, height: 10, tintColor: 'gray' }}
              />
            )}
          </TouchableOpacity>
        </View>
        {openned && children}
      </View>
    )
  }
}
