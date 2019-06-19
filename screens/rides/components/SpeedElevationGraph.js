import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { StyleSheet, View, Dimensions } from 'react-native'
import {
  VictoryArea,
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryZoomContainer,
} from 'victory-native'
import {
  calculateElevation,
  calculateSpeed,
  calculateDistance,
} from '@application/utils'
import { theme } from '@styles/theme'

const { width } = Dimensions.get('window')

class SpeedElevationGraph extends PureComponent {
  state = {
    speedData: [],
    elevationData: [],
    maxItems: 9,
  }

  processRideData = () => {
    const { maxItems } = this.state
    const response = this.props.rideData.segments[0].waypoints

    const perChunk = response.length / maxItems // items per chunk
    const result = response.reduce((resultArray, item, index) => {
      const chunkIndex = Math.floor(index / perChunk)

      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = [] // start a new chunk
      }

      resultArray[chunkIndex].push(item)

      return resultArray
    }, [])

    const editedResp = result.map(r => r[0])
    const speedData = response.reduce(
      (acc, val) => acc.concat({ x: val.ds, y: val.v }),
      []
    )

    const elevationData = response.reduce(
      (acc, val) => acc.concat({ distance: val.ds, altitude: val.alt }),
      []
    )
    console.log('speedData, elevationData ', speedData, elevationData)
    this.setState({ speedData, elevationData })
  }

  async componentDidMount() {
    await this.processRideData()
  }

  render() {
    const { user, speed, elevation } = this.props
    const { speedData, elevationData } = this.state

    const unitSystem = user.account.preferences.unitSystem
    const heightSystem = user.account.preferences.heightUnit

    const distanceUnit = unitSystem === 'IMPERIAL' ? 'ml' : 'km'

    return (
      <View style={{ height: null }}>
        {elevationData.length > 0 && (
          <View style={styles.chart}>
            <VictoryChart
              width={width}
              padding={{ top: 0, right: 20, bottom: 45, left: 35 }}
              height={180}
              containerComponent={<VictoryZoomContainer zoomDimension="x" />}
            >
              {elevation && elevationData.length > 0 && (
                <VictoryArea
                  height={180}
                  interpolation="monotoneX"
                  minDomain={{ x: 0 }}
                  style={{
                    data: {
                      fill: '#EEA58F',
                      stroke: 'transparent',
                    },
                  }}
                  data={elevationData}
                  y="altitude"
                  x="distance"
                />
              )}
              {elevation && (
                <VictoryAxis
                  orientation={speed ? 'right' : 'left'}
                  tickCount={3}
                  style={{
                    axis: { stroke: 'transparent' },
                    tickLabels: {
                      fontSize: theme.font.sizes.smallest,
                      stroke: theme.fontColorLight,
                      strokeWidth: 0,
                    },
                    grid: {
                      stroke: theme.fontColorLight,
                    },
                    // ticks: { stroke: theme.fontColorLight, strokeDashArray: '5 5' },
                  }}
                  tickFormat={elevation =>
                    calculateElevation(elevation, unitSystem, 0)
                  }
                />
              )}
              {speed && (
                <VictoryAxis
                  orientation="left"
                  tickCount={3}
                  style={{
                    axis: { stroke: 'transparent' },
                    tickLabels: {
                      fontSize: theme.font.sizes.smallest,
                      stroke: theme.fontColorLight,
                      strokeWidth: 0,
                    },
                    grid: {
                      stroke: theme.fontColorLight,
                      strokeDashArray: '10 10',
                    },
                  }}
                  tickFormat={speed => calculateSpeed(speed, unitSystem, 0)}
                />
              )}
              <VictoryAxis
                tickCount={4}
                orientation="bottom"
                crossAxis
                dependentAxis
                standalone={false}
                // TODO: verify with miles
                tickFormat={distance =>
                  `${calculateDistance(
                    distance,
                    unitSystem,
                    2
                  )} ${distanceUnit}`
                }
                style={{
                  axis: { stroke: theme.fontColorLight },
                  tickLabels: {
                    fontSize: theme.font.sizes.smallest,
                    stroke: theme.fontColorLight,
                    strokeWidth: 0,
                  },
                }}
              />
              {speed && (
                <VictoryLine
                  height={180}
                  minDomain={{ x: 0 }}
                  fixLabelOverlap={true}
                  tickCount={3}
                  interpolation="monotoneX"
                  // labels={speed => `${calculateSpeed(speed.y, unitSystem, 0) / 10} ${speedUnit}`}
                  style={{
                    data: { stroke: '#59ABA6', strokeWidth: 2 },
                  }}
                  data={speedData}
                />
              )}
            </VictoryChart>
          </View>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  chart: {
    // position: 'absolute',
    // height: 100,
    // backgroundColor: 'red'
  },
})

const mapStateToProps = ({ user }) => ({
  user: user.user,
})

export default connect(mapStateToProps)(SpeedElevationGraph)
