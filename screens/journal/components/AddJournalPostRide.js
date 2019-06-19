import React, { PureComponent } from 'react'
import { StyleSheet, View } from 'react-native'
import moment from 'moment'

import TrailPolyline from '@components/TrailPolyline'
import Distance from '@components/Distance'
import Text from '@components/Text'
import { theme } from '@styles/theme'

class AddJounalPostRide extends PureComponent {
  render() {
    const {
      ride: { distance, duration, previewTrackUrl, boundBox },
      children,
    } = this.props

    const formattedDuration = moment()
      .startOf('day')
      .seconds(duration)
      .format('HH:mm')

    return (
      <View style={styles.container}>
        <TrailPolyline coordsFile={previewTrackUrl} boundBox={boundBox}>
          {children}
        </TrailPolyline>

        <View style={styles.statsContainer}>
          <Distance
            distance={distance}
            distanceStyle={styles.statValue}
            unitStyle={styles.statUnit}
          />

          <View style={styles.statContainer}>
            <Text
              type="title"
              weight="bold"
              style={styles.statValue}
              text={formattedDuration}
            />
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 15,
  },
  statContainer: {
    flexDirection: 'row',
    marginLeft: 25,
  },
  statValue: {
    fontSize: 18,
    color: '#848484',
  },
  statUnit: {
    fontSize: theme.font.sizes.smallest,
    color: '#848484',
    marginLeft: 5,
    alignSelf: 'center',
  },
})

export default AddJounalPostRide
