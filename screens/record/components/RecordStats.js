import React, { PureComponent } from 'react'
import { StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'
import moment from 'moment'
import { calculateDistance, calculateSpeed } from '@utils'

import t from '@config/i18n'
import RecordStat from './RecordStat'

class RecordStats extends PureComponent {
  state = {
    update: 0,
  }

  updateInterval = null

  componentDidMount() {
    this.updateInterval = setInterval(
      () =>
        this.setState(({ update }) => ({
          update: update + 1,
        })),
      1000
    )
  }

  componentWillUnmount() {
    clearInterval(this.updateInterval)
  }

  render() {
    const {
      startedAt,
      pausedAt,
      totalDistance,
      averageSpeed,
      pauseDuration,
    } = this.props.record

    const { user } = this.props.user

    const now = pausedAt || new Date()
    const duration = moment.duration(moment(now).diff(moment(startedAt)))
    const durationWithPausing = pauseDuration
      ? duration.subtract(pauseDuration, 'milliseconds')
      : duration

    const unitSystem = user.account.preferences.unitSystem

    const convertedSpeed = calculateSpeed(averageSpeed, unitSystem)
    const convertedDistance = calculateDistance(totalDistance, unitSystem)

    const speedUnit = unitSystem === 'IMPERIAL' ? 'MPH' : 'KM/H'
    const distanceUnit = unitSystem === 'IMPERIAL' ? 'Mi' : 'KM'

    const durationText = t('record/durationWithUnit')
    const speedText = t('record/speedWithUnit', { unit: speedUnit })
    const distanceText = t('record/distanceWithUnit', { unit: distanceUnit })

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statsInnerContainer}>
          <RecordStat
            value={durationWithPausing.format('hh:mm:ss', { trim: false })}
            label={durationText}
          />

          <RecordStat value={convertedSpeed} label={speedText} />
        </View>

        <View style={styles.distanceStatContainer}>
          <View style={styles.blankStat} />

          <RecordStat
            value={convertedDistance}
            label={distanceText}
            valueStyle={styles.distanceStatText}
          />

          <View style={styles.blankStat} />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  statsContainer: {},
  statsInnerContainer: {
    flexDirection: 'row',
    position: 'relative',
    padding: 0,
  },
  distanceStatContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  distanceStatText: {
    fontSize: 25,
  },
  blankStat: {
    flex: 1,
  },
})

const mapStateToProps = ({ record, user }) => ({
  record,
  user,
})

export default connect(mapStateToProps)(RecordStats)
