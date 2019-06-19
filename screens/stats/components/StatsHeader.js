import React, { PureComponent } from 'react'
import { StyleSheet, View } from 'react-native'
import t from '@config/i18n'
import Text from '@components/Text'
import { theme } from '@styles/theme'
import Distance from '@components/Distance'

class StatsHeader extends PureComponent {
  static defaultProps = {
    totalDistance: '-',
    totalDuration: '-',
    totalRides: '-',
  }

  render() {
    const {
      totalDistance,
      distanceUnit,
      totalDuration,
      totalRides,
    } = this.props

    return (
      <View style={styles.header}>
        <View style={styles.headerItem}>
          <Distance
            distance={totalDistance}
            rowStyle={styles.statsDetailRow}
            distanceStyle={styles.statsText}
            unitStyle={styles.statsUnit}
          />
          <Text
            type="title"
            weight="bold"
            message="rideDetail/distance"
            style={styles.statTitle}
          />
        </View>

        <View style={styles.headerItem}>
          <View style={styles.baselineRow}>
            <Text
              weight="semiBold"
              text={
                totalDuration.length > 8
                  ? totalDuration.slice(0, totalDuration.length - 6)
                  : totalDuration
              }
              style={styles.statsText}
            />
            <Text text={'H'} weight={'normal'} style={styles.distanceUnit} />
          </View>
          <Text
            type="title"
            weight="bold"
            style={styles.statTitle}
            text={t('stats/duration').toUpperCase()}
          />
        </View>

        <View style={styles.headerItem}>
          <Text style={styles.statsText} text={totalRides} />
          <Text
            type="title"
            weight="bold"
            style={styles.statTitle}
            text={t('stats/rides').toUpperCase()}
          />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  header: {
    marginVertical: 15,
    padding: 15,
    paddingHorizontal: 30,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerItem: {
    // marginRight: 30,
  },
  headerValue: {
    color: '#848484',
    fontSize: 18,
  },
  headerLabel: {
    fontSize: theme.font.sizes.smallest,
    color: '#c7c7c7',
  },
  headerKm: {
    fontSize: theme.font.sizes.smallest,
  },
  statsDetailRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statsText: {
    ...theme.font.rideStatusNumber,
    fontSize: 21,
  },
  statsUnitText: {
    marginTop: 6,
    paddingLeft: 4,
    ...theme.font.rideStatusLabel,
  },
  statsUnit: {
    paddingLeft: 4,
    marginBottom: 2,
    ...theme.font.rideStatusLabel,
    marginTop: 6,
  },
  statTitle: {
    fontSize: theme.font.sizes.smallest,
    color: theme.fontColorLight,
  },
  distanceUnit: {
    paddingHorizontal: 4,
    ...theme.font.rideStatusLabel,
  },
  baselineRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
})

export default StatsHeader
