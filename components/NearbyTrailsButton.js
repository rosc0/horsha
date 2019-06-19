import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import TimerMixin from 'react-timer-mixin'

import Text from '@components/Text'
import { LATITUDE_DELTA, LONGITUDE_DELTA } from '@components/map/Map'

import { mapActions, trailActions } from '@actions/index'

import { theme } from '@styles/theme'
import TrailAPI from '@api/trails'

const API = new TrailAPI()

class NearbyTrailsButton extends Component {
  state = {
    loading: true,
    trails: 0,
  }

  getBoundBox = coordinates => ({
    northeast: {
      latitude: coordinates.latitude + LATITUDE_DELTA / 2,
      longitude: coordinates.longitude + LONGITUDE_DELTA / 2,
    },
    southwest: {
      latitude: coordinates.latitude - LATITUDE_DELTA / 2,
      longitude: coordinates.longitude - LONGITUDE_DELTA / 2,
    },
  })

  async componentDidMount() {
    const { northeast, southwest } = this.getBoundBox(this.props.coords)

    try {
      const trailList = await API.getTrails(null, {
        bb_top_right_latitude: northeast.latitude,
        bb_top_right_longitude: northeast.longitude,
        bb_bottom_left_latitude: southwest.latitude,
        bb_bottom_left_longitude: southwest.longitude,
      })

      let trails = 0
      if (trailList.collection) trails = trailList.collection.length

      this.setState({ trails, loaded: true })
    } catch (e) {
      this.setState({ trails: 0, loaded: true })
    }
  }

  openTrails = () => {
    const { coords } = this.props

    this.props.actions.setTrailListType('discover')
    this.props.methods.showMap()

    TimerMixin.setTimeout(() => {
      this.props.actions.setLatitudeLongitude(
        {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LATITUDE_DELTA,
        },
        'poi'
      )
    }, 12000)
  }

  render() {
    const { trails, loaded } = this.state

    return (
      <View style={styles.wrapper}>
        {!loaded ? (
          <View style={styles.inline}>
            <ActivityIndicator size="small" />
            <Text
              type="title"
              message="poi/loadingTrails"
              style={styles.loading}
            />
          </View>
        ) : null}

        {loaded && trails > 0 ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={this.openTrails}
            style={styles.button}
          >
            <Text
              type="title"
              weight="bold"
              style={styles.buttonText}
              message={trails === 1 ? 'poi/nearbyTrail' : 'poi/nearbyTrails'}
              values={{ amount: trails }}
            />
          </TouchableOpacity>
        ) : null}

        {loaded && trails === 0 ? (
          <Text type="title" message="poi/empty" style={styles.empty} />
        ) : null}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loading: {
    fontSize: theme.font.sizes.small,
    color: 'silver',
    marginLeft: 5,
  },
  button: {
    borderColor: theme.secondaryColor,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: theme.font.sizes.small,
    color: theme.secondaryColor,
  },
  empty: {
    fontSize: theme.font.sizes.small,
    color: 'gray',
  },
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...trailActions,
      ...mapActions,
    },
    dispatch
  ),
})

export default connect(
  null,
  mapDispatchToProps
)(NearbyTrailsButton)
