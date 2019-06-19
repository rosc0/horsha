import React, { PureComponent } from 'react'
import {
  StyleSheet,
  NativeModules,
  LayoutAnimation,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
} from 'react-native'
import { theme } from '../../../styles/theme'
import Search from './Search'
import { isIphoneX } from '@utils'
import Text from '@components/Text'

const plusSize = Platform.OS === 'android' ? 5 : isIphoneX() ? 45 : 25

const { UIManager } = NativeModules
const { width, height } = Dimensions.get('screen')
UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true)

export const CustomLayoutLinear = {
  duration: 150,
  create: {
    type: LayoutAnimation.Types.linear,
    property: LayoutAnimation.Properties.opacity,
  },
  update: {
    type: LayoutAnimation.Types.linear,
    property: LayoutAnimation.Properties.opacity,
  },
  delete: {
    type: LayoutAnimation.Types.linear,
    property: LayoutAnimation.Properties.opacity,
  },
}

export default class Drawer extends PureComponent {
  state = {
    h: 0,
    visible: false,
    location: true,
  }

  open = () => {
    LayoutAnimation.configureNext(CustomLayoutLinear)

    this.setState({
      h: height,
      visible: true,
    })
    this.props.showBar()
  }

  close = () => {
    LayoutAnimation.configureNext(CustomLayoutLinear)
    this.setState({
      h: 0,
      visible: false,
    })
    this.props.onClosePress()
    this.props.hideBar()
  }

  render() {
    const { h, location, visible } = this.state
    const {
      onItemPress,
      trailListType,
      onSearchPress,
      clearFilters,
    } = this.props

    return (
      <View style={[styles.wrapper, { height: h }]}>
        {visible === true && (
          <TouchableOpacity
            style={[
              styles.wrapper,
              {
                height: h,
                backgroundColor: location
                  ? 'rgba(0, 0, 0, 0.3)'
                  : 'transparent',
              },
            ]}
            onPress={() => this.close()}
          >
            <View style={styles.wrapper}>
              <View style={styles.container}>
                <View style={{ flexDirection: 'row', zIndex: 4 }}>
                  <TouchableOpacity
                    onPress={() => {
                      this.setState({ location: true }, () =>
                        this.props.showMap()
                      )
                    }}
                    style={[
                      styles.button,
                      styles.buttonFirst,
                      { backgroundColor: location ? 'white' : theme.mainColor },
                    ]}
                  >
                    <Text
                      weight="semiBold"
                      style={[
                        styles.buttonText,
                        { color: !location ? 'white' : theme.mainColor },
                      ]}
                      message={'maps/location'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      this.setState({ location: false }, () =>
                        this.props.showListView()
                      )
                    }}
                    style={[
                      styles.button,
                      styles.buttonSecond,
                      {
                        backgroundColor: !location ? 'white' : theme.mainColor,
                      },
                    ]}
                  >
                    <Text
                      weight="semiBold"
                      style={[
                        styles.buttonText,
                        { color: location ? 'white' : theme.mainColor },
                      ]}
                      message={'maps/trailName'}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <Search
                autoFocus={false}
                style={styles.search}
                onClosePress={() => this.close()}
                onItemPress={onItemPress}
                trailListType={trailListType}
                onSearchPress={onSearchPress}
                clearFilters={clearFilters}
                isLocation={location}
              />
            </View>
          </TouchableOpacity>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    flex: 1,
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    zIndex: 100,
  },
  container: {
    backgroundColor: theme.mainColor,
    paddingTop: 45 + plusSize,
    height: 95 + plusSize,
    alignItems: 'center',
    justifyContent: 'center',
    width,
    zIndex: 116,
    top: 0,
    position: 'absolute',
  },
  search: {
    position: 'absolute',
    zIndex: 117,
    left: 0,
    right: 0,
    // elevation: 5,
    // marginTop: 0 + plusSize,
    top: 0 + plusSize,
    // height: 240,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 35,
    backgroundColor: 'white',
    width: width / 2 - 15,
    borderWidth: 1,
    borderColor: 'white',
    marginBottom: 5,
  },
  buttonText: {
    color: theme.mainColor,
    fontWeight: 'bold',
  },
  buttonFirst: {
    borderBottomLeftRadius: 5,
    borderTopLeftRadius: 5,
  },
  buttonSecond: {
    borderBottomRightRadius: 5,
    borderTopRightRadius: 5,
  },
  item: {
    width: 50,
    height: 50,
    backgroundColor: 'gray',
    borderRadius: 25,
    margin: 20,
    marginHorizontal: 30,
  },
})
