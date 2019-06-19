// ios
import React, { Fragment, PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  Dimensions,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import Tooltip from '@components/tootip'
import { theme } from '@styles/theme'
import Text from './Text'
import HeaderTitle from '@components/HeaderTitle'

import * as trailActions from '@actions/trails'
import { IconImage } from './Icons'

const DROPDOWN_SIZE = Dimensions.get('window').width * 0.7

class Header extends PureComponent {
  state = {
    open: false,
    region: {},
    trailListType: 'discover',
  }

  static getDerivedStateFromProps(props, state) {
    if (props.trails.trailListType !== state.trailListType) {
      return {
        trailListType: props.trails.trailListType,
      }
    }

    // Return null to indicate no change to state.
    return null
  }

  toggle = () => this.setState({ open: !this.state.open })

  handleType = type => {
    const {
      showPois,
      showMap,
      showListView,
    } = this.props.navigation.state.params
    const { id } = this.props.user.user
    const { boundBox } = this.props.map
    this.setState({ open: false })

    if (this.props.navigation.state.params.onNavigation) {
      this.props.navigation.state.params.onNavigation()
    }

    if (type === 'discover') {
      this.props.actions.setTrailListType('discover')
      // this.props.actions.getTrails({ ...boundBox })
      return showMap()
    }

    if (type === 'created') {
      this.props.actions.setTrailListType('created')
      this.props.actions.getUserTrails(id)
      return showListView()
    }

    if (type === 'favorites') {
      this.props.actions.setTrailListType('favorites')
      this.props.actions.getUserFavoriteTrails(id)
      return showListView()
    }

    if (type === 'points') {
      this.props.actions.setTrailListType('points')
      return showPois()
    }
  }

  changeType = type => {
    const { clearFilters } = this.props.navigation.state.params
    if (Platform.OS !== 'ios') {
      this.tool.toggleTooltip()
    }
    clearFilters()
    this.handleType(type)
  }

  renderPopover = () => {
    const { trailListType } = this.state
    const isDiscover = trailListType === 'discover'
    const isByMe = trailListType === 'created'
    const isFavorites = trailListType === 'favorites'
    const isPoints = trailListType === 'points'

    const links = [
      { condition: isDiscover, type: 'discover' },
      { condition: isByMe, type: 'created' },
      { condition: isFavorites, type: 'favorites' },
      { condition: isPoints, type: 'points' },
    ]

    return (
      <View style={styles.dropdownContainer}>
        {ArrowIcon}
        <View style={[styles.dropdown, { width: DROPDOWN_SIZE }]} elevation={5}>
          {links
            .filter(f => f)
            .map(({ type, condition }, index) => (
              <Fragment key={index}>
                <TouchableOpacity
                  style={[styles.item, { width: DROPDOWN_SIZE }]}
                  onPress={() => this.changeType(type)}
                >
                  <Text style={styles.itemText} message={`trails/${type}`} />
                  {condition && CheckIcon}
                </TouchableOpacity>
                {index !== links.length - 1 && <View style={styles.border} />}
              </Fragment>
            ))}
        </View>
      </View>
    )
  }

  render() {
    const { trailListType } = this.props.trails
    const { superAction } = this.props

    if (superAction) {
      return (
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.title}
          onPress={superAction}
        >
          <HeaderTitle title={'trails/' + trailListType} />
          <IconImage style={styles.arrow} source="simpleArrow" />
        </TouchableOpacity>
      )
    }

    return (
      <View style={styles.wrapper}>
        {Platform.OS === 'ios' ? (
          <Fragment>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.title}
              onPress={this.toggle}
            >
              <HeaderTitle title={'trails/' + trailListType} />
              <IconImage style={styles.arrow} source="simpleArrow" />
            </TouchableOpacity>

            {this.state.open && this.renderPopover()}
          </Fragment>
        ) : (
          <Tooltip
            ref={el => (this.tool = el)}
            withPointer={false}
            withOverlay={false}
            height={530}
            width={DROPDOWN_SIZE}
            backgroundColor="transparent"
            popover={this.renderPopover()}
          >
            <View style={styles.title}>
              <HeaderTitle title={'trails/' + trailListType} />
              <IconImage style={styles.arrow} source="simpleArrow" />
            </View>
          </Tooltip>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 5,
    shadowOpacity: 0.2,
    elevation: 5,
  },
  title: {
    flexDirection: 'row',
  },
  arrow: {
    height: 8,
    width: 8,
    marginLeft: 5,
    top: 10,
    resizeMode: 'contain',
  },
  check: {
    width: 12,
    height: 12,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  arrowTop: {
    position: 'absolute',
    width: 50,
    height: 20,
    top: -15,
    resizeMode: 'contain',
    zIndex: 10,
    ...Platform.select({
      android: {
        left: 25,
      },
    }),
  },
  dropdownContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        top: 40,
      },
      android: {
        top: 15,
      },
    }),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 5,
    shadowOpacity: 0.2,
  },
  dropdown: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 3,
  },
  item: {
    padding: 12,
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
  border: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  itemText: {
    color: '#1e8583',
    fontSize: 16,
  },
})

const CheckIcon = (
  <IconImage
    style={styles.check}
    source="checkIcon"
    svg
    fill={theme.secondaryColor}
  />
)
const ArrowIcon = <IconImage style={styles.arrowTop} source="arrowTopNormal" />

export default connect(
  state => ({
    user: state.user,
    auth: state.auth,
    map: state.map,
    trails: state.trails,
  }),
  dispatch => ({ actions: bindActionCreators(trailActions, dispatch) })
)(Header)
