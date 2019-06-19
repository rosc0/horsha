import React, { PureComponent } from 'react'
import { ActivityIndicator, SectionList, StyleSheet, View } from 'react-native'
import moment from 'moment'
import { connect } from 'react-redux'
import ActionSheet from 'rn-action-sheet'
import {
  calculateDistance,
  calculateDuration,
  formatDurationWithoutSeconds,
} from '@application/utils'

import RideAPI from '@api/rides'
import { theme } from '@styles/theme'
import t from '@config/i18n'

import Loading from '@components/Loading'
import HeaderTitle from '@components/HeaderTitle'
import RideStats from '@components/RideStats'
import StatsItem from './components/StatsItem'
import StatsHeader from './components/StatsHeader'
import StatsFilter from './components/StatsFilter'
import StatsYear from './components/StatsYear'
import ArchivedUserBar from '../horses/components/ArchivedUserBar'

const RidesAPI = new RideAPI()

const count = (collection, prop, formatter) => {
  const hasItems = collection.length > 0

  let data = hasItems
    ? collection.reduce((acc, item) => acc + item.totals[prop], 0)
    : '-'

  if (hasItems && formatter) {
    data = formatter(data)
  }

  return data
}

const showOptions = [
  t('stats/weeks'),
  t('stats/months'),
  // t('stats/years'),
]

const sortOptions = [t('stats/rides'), t('stats/distance'), t('stats/duration')]

class UserStats extends PureComponent {
  static navigationOptions = {
    headerTitle: <HeaderTitle title={'stats/userStats'} />,
  }

  state = {
    horseId: null,
    horse: null,
    onlyMine: false,
    show: 0,
    sort: 0,
    page: 1,
    data: [],
    monthData: [],
    stats: [],
    since: null,
    until: null,
    endReached: false,
    loading: false,
  }

  componentDidMount() {
    this.loadItems()
  }

  loadItems = async (rangeType = 'weeks') => {
    this.setState({
      loading: true,
    })

    const { userId } = this.props.navigation.state.params

    const since = +moment().subtract(12, rangeType)
    const until = +moment()

    const rangeTypeValue =
      rangeType === 'months' || rangeType === 'years' ? 'month' : 'day'

    const stats = await RidesAPI.getTotalRides(
      {
        horseId: false,
        since,
        until,
        userId,
      },
      rangeTypeValue
    )

    this.setState({
      horseId: false,
      // horse,
      since,
      until,
      stats,
    })

    if (rangeTypeValue === 'day') {
      this.formatWeekData(rangeType, stats, 1)
    }

    if (rangeTypeValue === 'month') {
      const actualRides = await RidesAPI.getTotalRides({
        horseId: false,
        since,
        until,
        userId,
      })

      this.formatMonthData(rangeType, stats, 1, actualRides)
    }

    this.setState({
      loading: false,
    })
  }

  formatWeekData = (type, stats, page) => {
    const { user } = this.props
    const unitSystem = user.account.preferences.unitSystem
    const total = moment().diff(user.date_created, type)
    let last = moment().startOf(type)

    const data = [...new Array(10 * page)].map((_, index) => {
      const begin = last
      let end = moment().subtract(1 + index, type)
      last = end

      const rides = stats.filter(item =>
        moment(item.date).isBetween(end, begin)
      )

      const kmAmount = count(rides, 'distance', n =>
        calculateDistance(n, unitSystem, 1)
      )
      const ridesAmount = count(rides, 'count')
      const durationAmount = count(rides, 'duration', n => Number(n))

      const title = end.format('DD') + '-' + begin.format('DD')

      return {
        begin,
        end,
        title,
        rides,
        km: kmAmount,
        ridesAmount,
        durationAmount,
        week: total - index,
        month: t('stats/monthsSmall').split('|')[begin.format('M')],
        fullMonth: t('stats/monthsFull')
          .split('|')
          [begin.format('M')].toUpperCase(),
        year: begin.format('YYYY'),
      }
    })

    this.setState({ data, total })
  }

  formatMonthData = (type, stats, page, actualRides) => {
    const { user } = this.props
    const unitSystem = user.account.preferences.unitSystem
    const newMonthData = this.state.monthData.concat(actualRides)

    const total = moment().diff(user.date_created, type)
    const rides = stats
      .sort((a, b) => b.month - a.month)
      .sort((a, b) => b.year - a.year)

    let lastMonth = parseInt(moment().format('M'))
    let lastYear = parseInt(moment().format('YYYY'))

    const data = [...new Array(12 * page)].map((_, index) => {
      const item = rides.filter(
        item => item.month === lastMonth && item.year === lastYear
      )[0]

      const formattedDate = `${lastMonth}/${lastYear}`
      const end = moment(formattedDate, 'MM/YYYY').startOf('month')
      const begin = moment(formattedDate, 'MM/YYYY').endOf('month')

      const rideData = newMonthData.filter(item =>
        moment(item.date).isBetween(end, begin)
      )

      let content = {
        km: '-',
        rides: [],
        ridesAmount: '-',
        durationAmount: '-',
        month: t('stats/monthsSmall').split('|')[lastMonth],
        fullMonth: t('stats/monthsFull')
          .split('|')
          [lastMonth].toUpperCase(),
        monthNumber: lastMonth,
        year: lastYear,
      }

      if (item) {
        content = {
          rides: rideData,
          km: calculateDistance(item.totals.distance, unitSystem, 1),
          ridesAmount: item.totals.count,
          durationAmount: item.totals.duration
            ? formatDurationWithoutSeconds(item.totals.duration)
            : '-',
          month: t('stats/monthsSmall').split('|')[item.month],
          fullMonth: t('stats/monthsFull')
            .split('|')
            [item.month].toUpperCase(),
          year: item.year,
          monthNumber: lastMonth,
        }
      }

      lastYear = lastMonth === 1 ? lastYear - 1 : lastYear
      lastMonth = lastMonth === 1 ? 12 : lastMonth - 1

      return content
    })

    this.setState({ data, total, monthData: newMonthData })
  }

  getMoreData = async ({ distanceFromEnd }) => {
    const { since, page, show, stats } = this.state
    const { user } = this.props
    const { userId } = this.props.navigation.state.params

    const type = showOptions[show].toLowerCase()

    const newSince = moment(since).subtract(10, type)
    const newUntil = since
    const newPage = page + 1

    if (moment(since) < moment(user.date_created)) {
      return this.setState({ endReached: true })
    }

    const rangeTypeValue =
      type === 'months' || type === 'years' ? 'month' : 'day'

    const apiStats = await RidesAPI.getTotalRides(
      {
        horseId: false,
        since: +newSince,
        until: +newUntil,
        userId,
      },
      rangeTypeValue
    )

    const newStats = stats.concat(apiStats)

    this.setState({
      stats: newStats,
      since: newSince,
      until: newUntil,
      page: newPage,
    })

    if (type === 'weeks') {
      this.formatWeekData(type, newStats, newPage)
    }

    if (type === 'months' || type === 'years') {
      const actualRides = await RidesAPI.getTotalRides({
        horseId: false,
        since: +newSince,
        until: +newUntil,
        userId,
      })

      this.formatMonthData(type, newStats, newPage, actualRides)
    }
  }

  handleShow = () => {
    const cancelButtonIndex = 2

    ActionSheet.show(
      {
        title: t('common/chooseYourOption'),
        options: [...showOptions, t('common/cancel')],
        cancelButtonIndex,
        tintColor: theme.secondaryColor,
      },
      index => {
        if (index !== cancelButtonIndex) {
          this.setState({ show: index })
          this.loadItems(showOptions[index].toLowerCase())
        }
      }
    )
  }

  handleSort = () => {
    const cancelButtonIndex = 3

    ActionSheet.show(
      {
        title: t('common/chooseYourOption'),
        options: [...sortOptions, t('common/cancel')],
        cancelButtonIndex,
        tintColor: theme.secondaryColor,
      },
      index => index !== cancelButtonIndex && this.setState({ sort: index })
    )
  }

  handleIndividual = onlyMine => {
    this.setState({ onlyMine })

    const { show } = this.state

    this.loadItems(showOptions[show].toLowerCase())
  }

  render() {
    const { horses, user } = this.props
    const { data, show, sort, page, endReached, loading } = this.state

    const cutStats = data.slice(0, 10 * page)

    if (loading || cutStats === []) {
      return <Loading type="spinner" />
    }

    const { distance, duration, count } = user.riding_totals
    const unitSystem = user.account.preferences.unitSystem
    const distanceUnit = unitSystem === 'IMPERIAL' ? 'Mi' : 'KM'
    const totalDistance = distance
    const totalDuration = duration !== 0 ? calculateDuration(duration) : '0'

    const totalRides = count || '0'

    const isArchived =
      horses && horses[0] && horses[0].relation_type === 'archived'

    const group = Object.values(
      cutStats.reduce((acc, cur) => {
        const { year } = cur
        if (!acc[year]) acc[year] = []
        acc[year].push(cur)

        return acc
      }, {})
    )

    const newObj =
      group === []
        ? group
        : group.reverse().map(g => ({
            title: g[0].year,
            data: g,
          }))

    return (
      <View style={styles.wrapper}>
        {[
          isArchived ? (
            <ArchivedUserBar
              key="archived"
              navigation={this.props.navigation}
              horseUser={horses[0]}
            />
          ) : null,
          <RideStats
            key="header"
            totalRidingDistance={totalDistance}
            totalRidingTime={totalDuration}
            nrOfRides={totalRides}
            containerStyle={styles.header}
          />,
          <StatsFilter
            key="filter"
            onlyMineValue={false}
            showValue={showOptions[show]}
            sortValue={sortOptions[sort]}
            onIndividualRidesChange={this.handleIndividual}
            onShowPress={this.handleShow}
            onSortPress={this.handleSort}
          />,
        ]}
        <SectionList
          sections={newObj}
          keyExtractor={(_, index) => `item-${index}`}
          onEndReachedThreshold={1}
          onEndReached={this.getMoreData}
          bounces={false}
          renderItem={({ item, section }) => (
            <View>
              <StatsItem
                item={item}
                type={showOptions[show].toLowerCase()}
                sort={sortOptions[sort].toLowerCase()}
                unitSystem={unitSystem}
              />
            </View>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <StatsYear item={title} force={true} />
          )}
          ListFooterComponent={() =>
            !endReached && (
              <ActivityIndicator
                animating={true}
                style={styles.loading}
                size="small"
              />
            )
          }
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: theme.backgroundColor,
  },
  flex: {
    flex: 1,
  },
  loading: {
    paddingTop: 20,
    marginBottom: 20,
    alignSelf: 'center',
  },
  header: {
    marginVertical: 15,
    padding: 15,
    backgroundColor: 'white',
  },
})

const mapStateToProps = ({ user, horses }) => ({
  user: user.user,
  horses: horses.horses,
})

export default connect(mapStateToProps)(UserStats)
