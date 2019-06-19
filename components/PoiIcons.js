import React, { PureComponent } from 'react'
import { StyleSheet, View } from 'react-native'
import t from '@config/i18n'
import Text from '@components/Text'
import Icon from '@components/svg/Icon'
import { theme } from '@styles/theme'

export const icons = {
  camping: require('@images/icons/poi/camping.png'),
  water_crossing: require('@images/icons/poi/tap-water.png'),
  eatery: require('@images/icons/poi/eatery.png'),
  equestrian_facility: require('@images/icons/poi/equestrian-facility.png'),
  lodging: require('@images/icons/poi/lodging.png'),
  parking: require('@images/icons/poi/parking.png'),
  picnic_place: require('@images/icons/poi/picnic-place.png'),
  viewpoint: require('@images/icons/poi/viewpoint.png'),
  information_point: require('@images/icons/poi/visitor-centre.png'),
  warning: require('@images/icons/poi/warning.png'),
  watering_point: require('@images/icons/poi/watering-point.png'),
}

// TODO: if this is hooked up set strings in config/locales/content
export const poiLabels = {
  camping: t('poi/camping'),
  water_crossing: t('poi/water_crossing'),
  eatery: t('poi/eatery'),
  equestrian_facility: t('poi/equestrian_facility'),
  lodging: t('poi/lodging'),
  parking: t('poi/parking'),
  picnic_place: t('poi/picnic_place'),
  viewpoint: t('poi/viewpoint'),
  information_point: t('poi/information_point'),
  warning: t('poi/warning'),
  watering_point: t('poi/watering_point'),
}

class POIList extends PureComponent {
  static defaultProps = {
    style: {},
    poiTypes: null,
    items: 3,
    poiStyle: {},
  }

  render() {
    const { style, poiTypes, items, poiStyle, poiOccurrences } = this.props
    let pois = poiTypes
    let rest = 0

    if (poiTypes.length > items) {
      rest = pois.length - items
      pois = pois.slice(0, items)
    }

    if (poiOccurrences) {
      return (
        <View style={[styles.wrapper, style]}>
          {poiOccurrences.map(({ kind, count }, i) => (
            <View
              key={`poi-${i}`}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <Icon
                key={`poi-${i}`}
                name={kind.toLowerCase()}
                height={18}
                width={18}
                strokeWidth="3"
                style={[styles.icon, poiStyle]}
              />
              <Text style={styles.text} text={count} />
            </View>
          ))}
          {rest > 0 && <Text style={styles.text} text={`+${rest}`} />}
        </View>
      )
    }

    return (
      <View style={[styles.wrapper, style]}>
        {pois.map((poi, i) => (
          <Icon
            key={`poi-${i}`}
            name={poi.toLowerCase()}
            height={18}
            width={18}
            strokeWidth="3"
            style={[styles.icon, poiStyle]}
          />
        ))}
        {rest > 0 && <Text style={styles.text} text={`+${rest}`} />}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  icon: {
    margin: 3,
  },
  text: {
    marginLeft: 4,
    fontSize: theme.font.sizes.small,
  },
})

export default POIList
