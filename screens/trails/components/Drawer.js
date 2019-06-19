import React, { PureComponent } from 'react'
import {
  StyleSheet,
  NativeModules,
  Image,
  LayoutAnimation,
  Text as RNText,
  TouchableOpacity,
  View,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as trailActions from '@actions/trails'
import { theme } from '@styles/theme'
import { IconImage, userIcon } from '@components/Icons'
import { isIphoneX } from 'react-native-iphone-x-helper'

const { UIManager } = NativeModules
const { height } = Dimensions.get('window')

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true)

const CustomLayoutLinear = {
  duration: 10,
  create: {
    type: LayoutAnimation.Types.linear,
    property: LayoutAnimation.Properties.opacity,
  },
  update: {
    type: LayoutAnimation.Types.linear,
  },
  delete: {
    duration: 50,
    type: LayoutAnimation.Types.linear,
    property: LayoutAnimation.Properties.opacity,
  },
}

const MENUS = [
  {
    value: 'discover',
    displayName: 'Discover',
    icon: 'discover',
    aditionalStyle: { backgroundColor: '#75B1A2' },
  },
  {
    value: 'favorites',
    displayName: 'Favorite',
    icon: 'heart',
    aditionalStyle: { backgroundColor: theme.likeActive },
  },
  {
    value: 'created',
    displayName: 'My trails',
    aditionalStyle: { backgroundColor: '#eaeaea' },
  },
  {
    value: 'points',
    displayName: 'My points',
    icon: 'mypoints',
    aditionalStyle: { backgroundColor: theme.blue },
  },
]

const newHeight = isIphoneX ? 130 : 120
class Drawer extends PureComponent {
  state = {
    h: height,
    h2: newHeight,
    o: 1,
    modalVisible: true,
  }

  _onPress = () => {
    LayoutAnimation.configureNext(CustomLayoutLinear)

    this.setState(prevState => ({
      // modalVisible: !prevState.modalVisible,
      h: prevState.h === 0 ? height : 0,
      o: prevState.o === 0 ? 1 : 0,
      h2: prevState.h2 === 0 ? newHeight : 0,
    }))
  }

  defineAction = type => {
    const { showPois, showMap, showListView, user, map } = this.props

    const { id } = user.user
    const { boundBox } = map

    switch (type) {
      case 'discover':
        this.props.actions.setTrailListType(type)
        // this.props.actions.getTrails({ ...boundBox })
        this.props.callBackAction()
        return showMap()
      case 'favorites':
        this.props.actions.setTrailListType(type)
        this.props.actions.getUserFavoriteTrails(id)
        this.props.callBackAction()
        return showListView()
      case 'created':
        this.props.actions.setTrailListType(type)
        this.props.actions.getUserTrails(id)
        this.props.callBackAction()
        return showListView()
      case 'points':
        this.props.actions.setTrailListType(type)
        // this.props.actions.getTrails({ ...boundBox })
        this.props.callBackAction()
        return showPois()
      default:
        break
    }
  }

  render() {
    const { h, h2, o } = this.state

    const profilePicture =
      (!!this.props.user.user.profile_picture &&
        this.props.user.user.profile_picture.url && {
          uri: this.props.user.user.profile_picture.url,
        }) ||
      userIcon

    return (
      <View style={[styles.container, { height: 100 }]}>
        {h2 > 0 && (
          <React.Fragment>
            <View style={styles.drawerContainer}>
              {MENUS.map(({ value, aditionalStyle, displayName, icon }) => (
                <TouchableOpacity
                  key={value}
                  onPress={() => {
                    this.defineAction(value)
                  }}
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <View style={[styles.item, aditionalStyle]}>
                    {value === 'created' ? (
                      <Image
                        source={profilePicture}
                        resizeMode="cover"
                        style={styles.avatarIcon}
                      />
                    ) : (
                      <IconImage
                        source={icon}
                        resizeMode="contain"
                        style={styles.heartIcon}
                        fill="white"
                        svg
                      />
                    )}
                  </View>
                  <RNText style={styles.buttonText}>{displayName}</RNText>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ height: isIphoneX ? 30 : 0 }} />
          </React.Fragment>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    zIndex: 15,
    bottom: 0,
    right: 0,
    width: '100%',
    justifyContent: 'flex-end',
  },
  container: {
    height: newHeight,
    position: 'relative',
    bottom: 0,
    backgroundColor: '#FFFFFFF2',
  },
  button: {
    backgroundColor: 'white',
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  buttonText: {
    color: 'gray',
    fontWeight: 'bold',
  },
  item: {
    width: 50,
    height: 50,
    backgroundColor: 'gray',
    borderRadius: 25,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  avatarIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  heartIcon: {
    width: 25,
    height: 25,
  },
})

export default connect(
  state => ({
    user: state.user,
    auth: state.auth,
    map: state.map,
    trails: state.trails,
  }),
  dispatch => ({ actions: bindActionCreators(trailActions, dispatch) }),
  null,
  { forwardRef: true }
)(Drawer)
