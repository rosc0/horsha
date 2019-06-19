import React from 'react'
import { StyleSheet, View } from 'react-native'
import moment from 'moment'
import Text from '@components/Text'

const getYearByWeek = item => {
  let year = false
  const start = moment(item.end) // yeah confusing, sorry
  const end = moment(item.begin)

  if (start.format('DD-MM') === '01-01') {
    year = moment(item.end).format('YYYY')
  }

  if (start.format('MM') === '12' && end.format('MM') === '01') {
    year = moment(item.end).format('YYYY')
  }

  return year
}

const getYearByMonth = item => {
  if (item.monthNumber === 1) {
    return item.year
  }

  return false
}

const StatsYear = ({ item, type, force = false }) => {
  if (force === true) {
    return (
      <View style={styles.wrapper}>
        <Text type="title" weight="bold" style={styles.text} text={item} />
      </View>
    )
  }
  let year = false

  if (type === 'weeks') year = getYearByWeek(item)
  if (type === 'months') year = getYearByMonth(item)

  if (!year) return null

  return (
    <View key={item.title} style={styles.wrapper}>
      <Text type="title" weight="bold" style={styles.text} text={year} />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'white',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 20,
    color: '#848484',
  },
})

export default StatsYear
