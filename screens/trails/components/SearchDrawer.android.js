import React, { PureComponent } from 'react'
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
  Modal,
} from 'react-native'
import { theme } from '../../../styles/theme'
import Search from './Search'
import { isIphoneX } from '@utils'
import Text from '@components/Text'

const plusSize = Platform.OS === 'android' ? 5 : isIphoneX() ? 45 : 25

const { width } = Dimensions.get('screen')

export default class Drawer extends PureComponent {
  state = {
    visible: false,
    location: true,
  }

  open = () => {
    this.setState({
      visible: true,
    })
    this.props.showBar()
  }

  close = () => {
    this.setState({
      visible: false,
    })
    this.props.onClosePress()
    this.props.hideBar()
  }

  render() {
    const { location, visible } = this.state
    const {
      onItemPress,
      trailListType,
      onSearchPress,
      clearFilters,
    } = this.props

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => {
          this.close()
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: location ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
            flex: 1,
            position: 'absolute',
            bottom: 0,
            top: 0,
          }}
          onPress={() => this.close()}
        >
          <View style={styles.container} elevation={5}>
            <View
              style={{
                flexDirection: 'row',
                zIndex: 4,
                paddingTop: 50 + plusSize,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  this.setState({ location: true }, () => this.props.showMap())
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
                  { backgroundColor: !location ? 'white' : theme.mainColor },
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
        </TouchableOpacity>
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
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
  },
  container: {
    backgroundColor: theme.mainColor,
    height: 95 + plusSize,
    alignItems: 'center',
    justifyContent: 'center',
    width,
    zIndex: 2,
    position: 'relative',
    top: 0,
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
  search: {
    marginTop: 7,
  },
})
