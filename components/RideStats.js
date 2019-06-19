import React, { PureComponent } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import moment from 'moment'

import Text from './Text'
import Distance from './Distance'
import ProfileHeader from '@components/ProfileHeader'

import { theme } from '../styles/theme'

class RideStats extends PureComponent {
  render() {
    const {
      titleMessageKey,
      totalRidingDistance,
      totalRidingTime,
      nrOfRides,
      containerStyle,
      linkOnPress,
      rounded = false,
    } = this.props

    const durationHours =
      totalRidingTime !== 0 &&
      Math.floor(moment.duration(totalRidingTime).asHours())
    const durationMinutes =
      totalRidingTime !== 0 &&
      Math.floor(moment.duration(totalRidingTime).minutes())
    const rideCount = nrOfRides ? nrOfRides : '0'

    const onlyHours = durationHours > 100

    return (
      <View style={containerStyle}>
        {titleMessageKey && (
          <View style={[styles.row, styles.titleMargin]}>
            <ProfileHeader
              icon="stats"
              title={titleMessageKey}
              renderRight={
                linkOnPress && (
                  <TouchableOpacity onPress={linkOnPress}>
                    <Text
                      type="title"
                      weight="bold"
                      style={styles.seeAll}
                      message="common/seeAll"
                    />
                  </TouchableOpacity>
                )
              }
            />
          </View>
        )}

        <View style={styles.row}>
          <View style={styles.statsSection}>
            <Distance
              distance={totalRidingDistance}
              rowStyle={styles.baselineRow}
              distanceStyle={styles.statsText}
              unitStyle={styles.distanceUnit}
              statsRounded={rounded}
            />
            <Text message="rideStats/distance" style={styles.statsLabel} />
          </View>

          <View style={styles.statsSection}>
            <View style={styles.baselineRow}>
              {onlyHours ? (
                <React.Fragment>
                  <Text
                    weight="semiBold"
                    text={durationHours || '0'}
                    style={styles.statsText}
                  />
                  <Text
                    message={'common/hoursShort'}
                    weight={'normal'}
                    style={styles.distanceUnit}
                  />
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <Text
                    weight="semiBold"
                    text={durationHours || '0'}
                    style={styles.statsText}
                  />
                  <Text
                    message={'common/hoursShort'}
                    weight={'normal'}
                    style={styles.distanceUnit}
                  />
                  <Text
                    weight="semiBold"
                    text={durationMinutes || '0'}
                    style={styles.statsText}
                  />
                  <Text
                    message={'common/minutesShort'}
                    weight={'normal'}
                    style={styles.distanceUnit}
                  />
                </React.Fragment>
              )}
            </View>
            <Text message="rideStats/duration" style={styles.statsLabel} />
          </View>

          <View style={styles.statsSection}>
            <Text
              weight="semiBold"
              text={rideCount || '0'}
              style={styles.statsText}
            />
            <Text message="rideStats/rides" style={styles.statsLabel} />
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleMargin: {
    marginBottom: 15,
  },
  statsSection: {
    marginRight: 30,
  },
  baselineRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statsText: {
    ...theme.font.rideStatusNumber,
    fontSize: 23,
  },
  distanceUnit: {
    paddingHorizontal: 4,
    ...theme.font.rideStatusLabel,
  },
  statsLabel: {
    fontSize: theme.font.sizes.smallest,
    color: theme.fontColorLight,
  },
})

export default RideStats
