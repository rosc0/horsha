import React, { Component } from 'react'
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import debounce from 'lodash/debounce'

import Map, { Marker, Polyline } from '@components/map/Map'
import RangeSlider from '@components/RangeSlider'
import Text from '@components/Text'
import { theme } from '@styles/theme'
import {
  locationRed,
  locationGreen,
  prevIcon,
  nextIcon,
} from '@components/Icons'

// <TrailEditor />

const np = () => {}
const NextPrevButton = ({
  onPress,
  onLongPress = np,
  onPressOut = np,
  disabled,
  type,
}) => {
  const isDisabled = disabled ? { tintColor: '#eee' } : {}
  const onPressFinal = disabled ? np : onPress
  const source = type === 'next' ? nextIcon : prevIcon

  return (
    <TouchableOpacity
      onLongPress={onLongPress}
      onPressOut={onPressOut}
      onPress={onPressFinal}
      activeOpacity={0.7}
      style={styles.icon}
    >
      <Image source={source} style={[styles.iconImage, isDisabled]} />
    </TouchableOpacity>
  )
}

const distance = (start, end) => {
  const { latitude: lat1, longitude: lon1 } = start
  const { latitude: lat2, longitude: lon2 } = end

  const p = 0.017453292519943295 // Math.PI / 180
  const c = Math.cos
  const a =
    0.5 -
    c((lat2 - lat1) * p) / 2 +
    (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2

  return 12742 * Math.asin(Math.sqrt(a)) // 2 * R; R = 6371 km
}

const getDistanceTrail = trail => {
  const reducer = (acc, val, index) => {
    acc += distance(val, trail[index])
    return acc
  }

  return trail.reduce(reducer, 0)
}

class TrailEditor extends Component {
  timer = null

  state = {
    loaded: false,
    polyline: [],
    polylineOriginal: [],
    min: 0,
    max: 0,
  }

  componentDidMount() {
    const { coordsJSON, coordsXML, by } = this.props
    if (coordsJSON || coordsXML) {
      this.loadTrail(coordsJSON || coordsXML, coordsJSON ? 'json' : 'xml')
    }
  }

  fastCall = (fn, t = 40) =>
    (this.timer = setInterval(() => fn.bind(this).call(), t))

  endFastCall = () => clearInterval(this.timer)

  handleSegments = segments => {
    return segments
      .reduce(
        (accumulator, segment) => [...accumulator, ...segment.waypoints],
        []
      )
      .reduce(
        (accumulator, waypoint) => [
          ...accumulator,
          { latitude: waypoint.lat, longitude: waypoint.lng },
        ],
        []
      )
  }

  loadTrailJSON = url => {
    fetch(url)
      .then(req => req.json())
      .then(data => {
        const { segments } = data

        if (!segments) return

        const polylineOriginal = this.handleSegments(segments)

        if (polylineOriginal) {
          this.setState({
            segments,
            polylineOriginal,
            max: polylineOriginal.length,
            loaded: true,
          })

          this.props.onLoad(polylineOriginal, data)
        }
      })
      .catch(() => {})
  }

  loadTrailXML = data => {
    if (data) {
      if (!data.segments) return

      const { segments } = data

      const polylineOriginal = this.handleSegments(segments)

      if (polylineOriginal) {
        this.setState({
          segments,
          polylineOriginal,
          max: polylineOriginal.length,
          loaded: true,
        })

        this.props.onLoad(polylineOriginal, data)
      }
    }
  }

  loadTrail = (url, type) => {
    if (type === 'json') {
      this.loadTrailJSON(url)
    }

    if (type === 'xml') {
      this.loadTrailXML(url)
    }
  }

  onMapReady = () => {
    this.map.fitBounds(this.state.polylineOriginal, {
      shouldCalculateBounds: true,
    })
  }

  cutTrail = ({ max, min }) => {
    max = Math.round(max)
    min = Math.round(min)

    if (max === min) return

    this.setState({ max, min })
    this.props.onChange(max, min)
    this.fitToScreen()
  }

  fitToScreen = () => {
    const { polylineOriginal, max, min } = this.state

    const coordinates = polylineOriginal.slice(min, max)

    this.map.fitBounds(coordinates, {
      shouldCalculateBounds: true,
      animationDuration: 400,
    })
  }

  managePoint = (position, type) => {
    const { polylineOriginal, min, max } = this.state
    let state = { min, max }

    if (position === 'start' && type === 'prev' && min !== 0) {
      state.min = min - 1
    }

    if (
      position === 'start' &&
      type === 'next' &&
      min !== polylineOriginal.length - 1
    ) {
      state.min = min + 1
    }

    if (position === 'end' && type === 'prev' && max >= 1) {
      state.max = max - 1
    }

    if (
      position === 'end' &&
      type === 'next' &&
      max !== polylineOriginal.length
    ) {
      state.max = max + 1
    }

    this.setState({ min: state.min, max: state.max })
    this.props.onChange(state.max, state.min)
  }

  render() {
    const { loaded, coordinates, polylineOriginal, max, min } = this.state

    let polyline = polylineOriginal.slice(min, max)

    const startPrevEnabled = min === 0
    const startNextEnabled = min === polylineOriginal.length - 1

    const endPrevEnabled = max <= 1
    const endNextEnabled = max === polylineOriginal.length

    // const kmDistance = getDistanceTrail(polyline)

    return (
      <View style={styles.wrapper}>
        {!loaded && (
          <ActivityIndicator
            animating={true}
            style={styles.loading}
            size="large"
          />
        )}

        {loaded && (
          <View>
            <TouchableOpacity
              style={styles.fitButton}
              activeOpacity={0.7}
              onPress={this.fitToScreen}
            >
              <Text
                type="title"
                weight="bold"
                style={styles.fitButtonText}
                message="common/fitToScreen"
              />
            </TouchableOpacity>

            <View style={styles.mapWrapper}>
              <Map
                ref={el => {
                  if (!!el) {
                    this.map = el
                  }
                }}
                onMapReady={this.onMapReady}
              >
                {polyline.length && (
                  <View>
                    <Marker coordinate={polyline[0]} image={locationGreen} />

                    <Polyline coordinates={polyline} strokeColor={'#188280'} />

                    <Marker
                      coordinate={polyline[polyline.length - 1]}
                      image={locationRed}
                    />
                  </View>
                )}
              </Map>
            </View>

            <View style={styles.rangeSliderWrapper}>
              <RangeSlider
                min={0}
                max={polylineOriginal.length}
                step={1}
                minValue={min}
                maxValue={max}
                trackSize={3}
                upperTrackColor={'#ddd'}
                lowerTrackColor={'#009688'}
                thumbRadius={8}
                onChange={debounce(this.cutTrail, 100)}
              />

              <View style={styles.move}>
                <View>
                  <Text
                    type="title"
                    style={styles.moveTitle}
                    message="trails/moveStartPoint"
                  />

                  <View style={styles.inline}>
                    <NextPrevButton
                      type="prev"
                      disabled={startPrevEnabled}
                      onLongPress={() =>
                        this.fastCall(() => this.managePoint('start', 'prev'))
                      }
                      onPressOut={this.endFastCall}
                      onPress={() => this.managePoint('start', 'prev')}
                    />

                    <NextPrevButton
                      type="next"
                      disabled={startNextEnabled}
                      onLongPress={() =>
                        this.fastCall(() => this.managePoint('start', 'next'))
                      }
                      onPressOut={this.endFastCall}
                      onPress={() => this.managePoint('start', 'next')}
                    />
                  </View>
                </View>

                <View>
                  <Text
                    style={styles.moveTitle}
                    message="trails/moveEndPoint"
                  />

                  <View style={styles.inline}>
                    <NextPrevButton
                      type="prev"
                      disabled={endPrevEnabled}
                      onLongPress={() =>
                        this.fastCall(() => this.managePoint('end', 'prev'))
                      }
                      onPressOut={this.endFastCall}
                      onPress={() => this.managePoint('end', 'prev')}
                    />

                    <NextPrevButton
                      type="next"
                      disabled={endNextEnabled}
                      onLongPress={() =>
                        this.fastCall(() => this.managePoint('end', 'next'))
                      }
                      onPressOut={this.endFastCall}
                      onPress={() => this.managePoint('end', 'next')}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    marginTop: -15,
  },
  mapWrapper: {
    height: '70%',
  },
  loading: {
    height: 150,
  },
  fitButton: {
    position: 'absolute',
    zIndex: 10,
    backgroundColor: 'white',
    right: 8,
    top: 8,
    borderRadius: 2,
    padding: 5,
    paddingHorizontal: 10,
  },
  fitButtonText: {
    fontSize: theme.font.sizes.smallest,
    color: theme.secondaryColor,
  },
  rangeSliderWrapper: {
    width: '80%',
    height: '25%',
    marginTop: 5,
    alignSelf: 'center',
    marginLeft: -5,
  },
  move: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  moveTitle: {
    fontSize: 12,
    color: '#777',
  },
  icon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    marginTop: 10,
  },
  iconImage: {
    width: 14,
    height: 25,
    resizeMode: 'contain',
  },
  inline: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
})

export default TrailEditor
