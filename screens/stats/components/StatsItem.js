import React, { PureComponent } from 'react'
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native'
import moment from 'moment'
import t from '@config/i18n'
import StatsGraph from './StatsGraph'
import Text from '@components/Text'
import { theme } from '@styles/theme'
import { formatDurationWithoutSeconds } from '@application/utils'

class StatsItem extends PureComponent {
  static defaultProps = {
    type: 'week',
    sort: 'distance',
    item: null,
    onPress: () => {},
  }

  state = {
    isOpened: false,
  }

  slideDown = new Animated.Value(0)
  opacity = new Animated.Value(0)

  toggle = () => {
    const { rides } = this.props.item

    const min = 0
    const max = rides.length ? 245 : 65

    const isOpened = !this.state.isOpened
    const toHeightValue = isOpened ? max : min
    const toOpacityValue = isOpened ? 1 : 0

    this.setState({ isOpened })

    Animated.timing(this.opacity, {
      toValue: toOpacityValue,
    }).start()

    Animated.spring(this.slideDown, {
      toValue: toHeightValue,
      bounciness: 0,
    }).start()
  }

  render() {
    const { item, type, sort, unitSystem } = this.props

    let total = item.ridesAmount
    let totalLabel = t('stats/rides')

    if (sort === 'duration') {
      total =
        item.durationAmount !== '-'
          ? formatDurationWithoutSeconds(item.durationAmount)
          : item.durationAmount
      totalLabel = t('stats/duration')
    }

    const distanceUnit = unitSystem === 'IMPERIAL' ? 'Mi' : 'KM'

    return (
      <View style={styles.item}>
        <View style={styles.overvieWrapper}>
          <TouchableOpacity
            style={styles.overview}
            onPress={this.toggle}
            activeOpacity={0.7}
          >
            <View
              style={[styles.when, sort === 'duration' ? { width: '45%' } : {}]}
            >
              {type === 'weeks' && (
                <View>
                  <Text
                    type="title"
                    weight="bold"
                    style={styles.whenText}
                    text={t('stats/week') + moment(item.end).format('w')}
                  />
                  <Text
                    style={styles.whenRange}
                    text={`${item.title} ${item.month.toUpperCase()}`}
                  />
                </View>
              )}

              {type === 'months' && (
                <Text
                  type="title"
                  weight="bold"
                  style={styles.whenText}
                  text={item.fullMonth}
                />
              )}
            </View>

            <View
              style={[
                styles.stat,
                sort === 'distance'
                  ? { flexDirection: 'row-reverse' }
                  : { flexDirection: 'row' },
              ]}
            >
              <View style={styles.statWrapper}>
                <Text weight="bold" style={styles.statValue} text={total} />
                <Text
                  style={styles.statLabel}
                  text={totalLabel.toUpperCase()}
                />
              </View>

              <View style={styles.statWrapper}>
                <Text
                  weight="bold"
                  style={styles.statValue}
                  text={item.km ? item.km : 0}
                />
                <Text style={styles.statLabel} text={distanceUnit} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[
            styles.graph,
            { height: this.slideDown, opacity: this.opacity },
          ]}
        >
          <StatsGraph rides={item.rides} sort={sort} type={type} />
        </Animated.View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  item: {
    paddingBottom: 20,
    paddingHorizontal: theme.paddingHorizontal,
    backgroundColor: 'white',
  },
  when: {
    flex: 1,
  },
  overvieWrapper: {
    zIndex: 14,
  },
  overview: {
    backgroundColor: '#5eb1a2',
    padding: 10,
    borderRadius: 6,
    flexDirection: 'row',
  },
  stat: {
    flex: 3,
    justifyContent: 'space-between',
  },
  statValue: {
    fontSize: 24,
    color: 'white',
  },
  statLabel: {
    color: '#caefe8',
    fontSize: theme.font.sizes.smallest,
  },
  statWrapper: {
    alignItems: 'flex-end',
    flex: 2,
  },
  whenText: {
    color: 'white',
    fontSize: theme.font.sizes.smallest,
  },
  whenRange: {
    color: '#98ccc3',
    fontSize: theme.font.sizes.smaller,
  },
  graph: {
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: '#f0f0f0',
    marginTop: -15,
    borderRadius: 6,
    zIndex: 4,
    overflow: 'hidden',
    opacity: 0,
  },
})

export default StatsItem
