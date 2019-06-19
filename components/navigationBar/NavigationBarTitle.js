import React, { Component } from 'react'
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

import Text from '@components/Text'
import Tooltip from '@components/tootip'
import HeaderTitle from '@components/HeaderTitle'

import { IconImage } from '../Icons'
import { theme } from '@styles/theme'

const DROPDOWN_SIZE = Dimensions.get('window').width * 0.7

class NavigationBarTitle extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isDropdownOpened: false,
      titleArrowPosition: 0,
      fadeInAnimation: new Animated.Value(0),
    }
  }

  handleOnLayout = ({ nativeEvent }) =>
    this.setState({
      titleArrowPosition: nativeEvent.layout.x,
    })

  toggleDropdown = () =>
    this.setState(prevState => ({
      isDropdownOpened: !prevState.isDropdownOpened,
    }))

  startDropdownAnimation = () => {
    const isDropdownOpened = !this.state.isDropdownOpened
    const toValue = isDropdownOpened ? 1 : 0

    Animated.timing(this.state.fadeInAnimation, {
      toValue,
      duration: 200,
    }).start(() => {
      if (!isDropdownOpened) {
        return this.toggleDropdown()
      }
    })

    if (isDropdownOpened) {
      return this.toggleDropdown()
    }
  }

  handleDropdownNavigate = (route, params) => () => {
    if (Platform.OS === 'ios') {
      this.toggleDropdown()
    } else this.tool.toggleTooltip()

    this.props.navigation.navigate(route, {
      ...this.props.navigation.state.params,
      ...params,
    })
  }

  renderLinks = () => {
    const { dropdownOptions = [], condition } = this.props
    return (
      <React.Fragment>
        <IconImage source="arrowTopNormal" style={[styles.arrowTop]} />

        <View style={styles.dropdown}>
          {dropdownOptions.map((option, key) => (
            <TouchableOpacity
              key={`navigationBar-dropdown-${key}`}
              onPress={this.handleDropdownNavigate(option.route, option.params)}
              style={[
                styles.itemContainer,
                key === dropdownOptions.length - 1 && styles.lastItem,
              ]}
            >
              <Text style={styles.itemText} text={option.title} />
              {condition === option.route && CheckIcon}
            </TouchableOpacity>
          ))}
        </View>
      </React.Fragment>
    )
  }

  renderDropdown = () => {
    const { dropdownOptions = [] } = this.props
    const { fadeInAnimation, isDropdownOpened } = this.state

    if (dropdownOptions.length === 0) {
      return null
    }

    return (
      <Animated.View
        style={[
          styles.dropdownContainer,
          {
            opacity: fadeInAnimation,
            display: isDropdownOpened ? null : 'none',
          },
        ]}
      >
        {this.renderLinks()}
      </Animated.View>
    )
  }

  render() {
    const { title } = this.props

    return Platform.OS === 'ios' ? (
      <View style={styles.wrapper}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.titleContainer}
          onPress={this.startDropdownAnimation}
        >
          <HeaderTitle title={title} />
          <IconImage
            style={styles.arrow}
            source="simpleArrow"
            onLayout={this.handleOnLayout}
          />
        </TouchableOpacity>
        {this.renderDropdown()}
      </View>
    ) : (
      <Tooltip
        ref={el => (this.tool = el)}
        withPointer={false}
        withOverlay={true}
        height={530}
        width={DROPDOWN_SIZE}
        backgroundColor="transparent"
        popover={
          <View style={[styles.dropdownContainer]} elevation={5}>
            {this.renderLinks()}
          </View>
        }
      >
        <View style={styles.titleContainer}>
          <HeaderTitle title={title} />
          <IconImage
            style={styles.arrow}
            source="simpleArrow"
            onLayout={this.handleOnLayout}
          />
        </View>
      </Tooltip>
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
  },
  titleContainer: {
    flexDirection: 'row',
  },
  title: {
    color: 'white',
    fontSize: 17,
  },
  arrow: {
    height: 8,
    width: 8,
    marginLeft: 5,
    top: 10,
    resizeMode: 'contain',
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
  dropdown: {
    backgroundColor: 'white',
    borderRadius: 15,
    paddingVertical: 3,
    width: DROPDOWN_SIZE,
    paddingVertical: 3,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 5,
    shadowOpacity: 0.2,
  },
  itemContainer: {
    padding: 12,
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.12)',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  itemText: {
    color: '#1e8583',
    fontSize: 16,
  },
  check: {
    width: 12,
    height: 12,
    alignSelf: 'center',
    justifyContent: 'center',
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

export default NavigationBarTitle
