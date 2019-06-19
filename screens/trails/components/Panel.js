import React, { Component } from 'react'
import { TouchableOpacity, View } from 'react-native'
import filterStyles from '@styles/screens/trails/filter-modal'
import Text from '@components/Text'
import { IconImage } from '@components/Icons'

export default class Panel extends Component {
  state = { openned: false }

  renderCurrentTitle = title => {
    const name = title => {
      if (title === 'all') return 'trails/showAll'
      if (title === 'ONE_WAY') return 'trails/oneWay'
      if (title === 'ROUND_TRIP') return 'trails/roundTrip'
    }
    return (
      <View style={filterStyles.center}>
        <Text
          style={[filterStyles.poiText, { marginRight: 10 }]}
          message={name(title)}
        />
        <IconImage
          source="arrowIcon"
          style={{ width: 15, height: 10, tintColor: 'gray' }}
        />
      </View>
    )
  }

  render() {
    const { active, children } = this.props
    const { openned } = this.state
    return (
      <View style={[filterStyles.row, { marginTop: 20, marginBottom: 15 }]}>
        <View style={[filterStyles.rowItem, { paddingVertical: 0 }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[filterStyles.poiItem, { paddingVertical: 15 }]}
            onPress={() => this.setState({ openned: !this.state.openned })}
          >
            <Text
              weight="semiBold"
              style={filterStyles.poiText}
              message="trails/oneWayOrRound"
            />
            {openned ? (
              <IconImage
                source="arrowIconTop"
                style={{ width: 15, height: 10, tintColor: 'gray' }}
              />
            ) : (
              this.renderCurrentTitle(active)
            )}
          </TouchableOpacity>
        </View>
        {openned && children}
      </View>
    )
  }
}
