import React, { PureComponent } from 'react'
import { StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'

import moment from 'moment'
import Text from '@components/Text'

import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryTheme,
} from 'victory-native'

import t from '@config/i18n'
import {
  calculateDistance,
  formatDurationWithoutSeconds,
  formatChartDuration,
} from '@application/utils'
import { theme } from '@styles/theme'

const millisToMinutesAndSeconds = millis => Math.floor(millis / 60000)

class StatsGraph extends PureComponent {
  static defaultProps = {
    rides: null,
  }

  state = {
    data: null,
    isEmpty: false,
  }

  getStyle = () => {
    const theme = VictoryTheme.material

    const labelStyle = {
      fontFamily: 'Nunito-Bold',
      fontSize: 11,
      fill: '#cbcbcb',
    }

    theme.axis.style.grid.stroke = '#f0f0f0'
    theme.axis.style.grid.strokeDasharray = '1, 2'

    theme.axis.style.axisLabel = {
      ...theme.axis.style.axisLabel,
      ...labelStyle,
    }

    theme.axis.style.tickLabels = {
      ...theme.axis.style.tickLabels,
      ...labelStyle,
    }

    return theme
  }

  tickFormat = n => {
    const { sort, user, rides } = this.props
    const unitSystem = user.account.preferences.unitSystem
    const distanceUnit = unitSystem === 'IMPERIAL' ? 'Mi' : 'Km'

    if (sort === 'distance') return `${Math.round(n)}${distanceUnit}`
    if (sort === 'duration') {
      const mn = millisToMinutesAndSeconds(n)
      return mn > 60 ? `${Math.round(mn / 60)}h` : `${Math.round(mn)}m`
    }
    return n
  }

  getData = () => {
    const { rides, sort, user, type } = this.props

    let stats = {}
    const unitSystem = user.account.preferences.unitSystem
    const daysInMonth = rides.length
      ? moment(rides[0].date, 'YYYY-MM').daysInMonth()
      : 30

    if (rides.length) {
      rides.map(({ date, totals: { distance, duration, count: rides } }) => {
        const weekName =
          type === 'weeks'
            ? moment(date)
                .format('ddd')
                .toUpperCase()
            : moment(date).format('d')

        stats[weekName] = {
          distance: stats[weekName]
            ? stats[weekName].distance + distance
            : distance,
          duration: stats[weekName]
            ? stats[weekName].duration + duration
            : duration,
          rides,
        }
      })
    }

    fillArrayWithNumbers = n =>
      Array.apply(null, Array(n)).map((x, i) => `${i + 1}`)

    const mData = fillArrayWithNumbers(daysInMonth).map((item, index) => {
      let x = item
      let y = 0

      if (stats[item]) {
        y = Math.round(stats[item][sort])

        if (sort === 'distance') {
          y = Number(calculateDistance(y, unitSystem))
        }

        if (sort === 'duration') {
          y = y
        }
      }

      return { x, y }
    })

    const data = t('stats/weekDaysSmall')
      .split('|')
      .map(item => {
        let x = item
        let y = 0

        if (stats[item]) {
          y = Math.round(stats[item][sort])

          if (sort === 'distance') {
            y = calculateDistance(y, unitSystem)
          }

          if (sort === 'duration') {
            y = y
          }
        }

        return { x, y }
      })

    const verify = type === 'weeks' ? data : mData
    const isEmpty = verify.reduce((acc, item) => acc + item.y, 0) === 0

    return {
      data,
      mData,
      isEmpty,
    }
  }

  render() {
    const { data, mData, isEmpty } = this.getData()
    const { type } = this.props

    const theme = this.getStyle()

    const newData = type === 'weeks' ? data : mData

    if (isEmpty) {
      return (
        <View style={styles.empty}>
          <Text
            type="title"
            weight="bold"
            style={styles.emptyText}
            message="stats/noRides"
          />
        </View>
      )
    }

    if (this.props.rides.length === 0) {
      return (
        <View style={styles.empty}>
          <Text
            type="title"
            weight="bold"
            style={styles.emptyText}
            message="stats/noRides"
          />
        </View>
      )
    }

    return (
      <View style={styles.wrapper}>
        <VictoryChart theme={theme} height={230}>
          <VictoryAxis dependentAxis tickFormat={this.tickFormat} />
          <VictoryAxis tickCount={6} />
          <VictoryBar
            data={newData}
            style={{ data: { fill: '#5fb1a2' } }}
            alignment="start"
          />
        </VictoryChart>

        {/* <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.7}
            onPress={this.navigateToRides}
          >
            <Text
              type="title"
              weight="bold"
              style={styles.buttonText}
              message="stats/seeRides"
            />
          </TouchableOpacity>
        </View> */}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    marginLeft: -5,
  },
  empty: {
    padding: 15,
  },
  emptyText: {
    marginTop: 15,
    fontSize: theme.font.sizes.default,
    color: '#cbcbcb',
  },
  buttonWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginRight: 15,
  },
  button: {
    borderWidth: 1,
    borderColor: '#5fb1a2',
    paddingHorizontal: theme.paddingHorizontal,
    paddingVertical: 5,
    width: 'auto',
    borderRadius: 4,
    marginTop: 5,
  },
  buttonText: {
    color: '#5fb1a2',
    fontSize: theme.font.sizes.smallest,
  },
})

const mapStateToProps = ({ user }) => ({
  user: user.user,
})

export default connect(mapStateToProps)(StatsGraph)
