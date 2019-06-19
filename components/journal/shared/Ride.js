import React, { PureComponent } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import moment from 'moment'

import TrailPolyline from '@components/TrailPolyline'
import Distance from '@components/Distance'
import Text from '@components/Text'
import { theme } from '@styles/theme'

/**
 * <Ride content={content} />
 */

class Ride extends PureComponent {
  navigateToRide = rideId => {
    this.props.navigate('RideDetail', { rideId })
  }

  render() {
    const { nr_of_rides = false, rides } = this.props.content

    if (!rides.length || !nr_of_rides || nr_of_rides === 0) {
      return null
    }

    return rides.map(ride => {
      if (!ride || !ride.duration) return null

      const rideDuration = moment.duration(ride.duration)
      const duration = {
        hours: rideDuration.hours(),
        minutes: rideDuration.minutes(),
        seconds: rideDuration.seconds(),
      }

      return (
        <View style={styles.wrapper} key={`${ride.id}${Math.random()}`}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => this.navigateToRide(ride.id)}
          >
            <TrailPolyline
              coordsFile={ride.preview_track_url}
              boundBox={ride.bounding_box}
            />

            <View style={styles.info}>
              <View style={styles.duration}>
                <View style={styles.distance}>
                  <Distance
                    distance={ride.distance}
                    distanceStyle={styles.content}
                    unitStyle={styles.label}
                    rowStyle={styles.hours}
                  />
                </View>

                {duration.hours > 0 && (
                  <View style={styles.hours}>
                    <Text
                      type="title"
                      weight="bold"
                      style={styles.content}
                      text={duration.hours}
                    />
                    <Text
                      type="title"
                      weight="bold"
                      style={styles.label}
                      text={`HOUR${duration.hours > 1 ? 'S' : ''}`}
                    />
                  </View>
                )}

                {duration.minutes > 0 && (
                  <View style={styles.hours}>
                    <Text
                      type="title"
                      weight="bold"
                      style={styles.content}
                      text={duration.minutes}
                    />
                    <Text
                      type="title"
                      weight="bold"
                      style={styles.label}
                      text="MIN"
                    />
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )
    })
  }
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 20,
  },
  info: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    padding: theme.paddingHorizontal,
  },
  distance: {
    flexDirection: 'row',
  },
  content: {
    marginVertical: 0,
    padding: 0,
    ...theme.font.rideStatusNumber,
  },
  label: {
    paddingLeft: 4,
    marginBottom: 2,
    ...theme.font.rideStatusLabel,
  },
  duration: {
    flexDirection: 'row',
  },
  hours: {
    marginHorizontal: 6,
    alignItems: 'flex-end',
    flexDirection: 'row',
  },
})

export default Ride
