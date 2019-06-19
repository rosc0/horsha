import React, { Component } from 'react'
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  TouchableWithoutFeedback,
} from 'react-native'
import SearchBox from '@components/CustomSearchBox'
import GooglePlacesInput from '@components/GooglePlacesInput'
import t from '@config/i18n'
import { IconImage } from '@components/Icons'

class Search extends Component {
  state = {
    showClose: false,
    text: '',
    isSearched: false,
  }

  close = () => {
    this.setState({ showClose: false })
    if (this.props.isLocation === true) {
      this.places.clear()
    } else {
      if (this.state.isSearched === true) {
        this.props.clearFilters()
        return this.setState({ isSearched: false })
      }
    }
    // this.props.onClosePress()
  }

  onPress = (latitude, longitude) => {
    this.setState({ showClose: true })
    this.props.onItemPress(latitude, longitude)
  }

  onChangeText = value => this.setState({ text: value.toLowerCase() + '*' })

  search = () => {
    this.setState({ isSearched: true })
    this.props.onSearchPress({ text: this.state.text })
  }

  render() {
    const {
      style,
      autoFocus = true,
      trailListType,
      isLocation = true,
    } = this.props
    const searchTitles = t('maps/searchTitles')

    let showClose = true

    if (!autoFocus) {
      showClose = this.state.showClose
    }
    return (
      <View
        style={[
          styles.wrapper,
          style,
          // trailListType !== 'discover' ? { top: 0 } : { top: 45 },
        ]}
      >
        {isLocation === true ? (
          <TouchableWithoutFeedback
            onPress={() => this.places.input.refs.textInput.focus()}
          >
            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                alignItems: 'center',
              }}
            >
              <GooglePlacesInput
                onPress={this.onPress}
                onClose={this.close}
                autoFocus={autoFocus}
                ref={ref => (this.places = ref)}
                searchIcon={
                  <View style={{ marginTop: 12 }}>
                    <IconImage source="searchIcon" style={styles.icon} />
                  </View>
                }
                closeButtum={
                  <TouchableOpacity
                    activeOpacity={1}
                    style={styles.closeWrapper}
                    onPress={this.close}
                  >
                    <View style={styles.closeIconWrapper}>
                      <IconImage source="closeIcon" style={styles.closeIcon} />
                    </View>
                  </TouchableOpacity>
                }
              />
            </View>
          </TouchableWithoutFeedback>
        ) : (
          <View style={styles.textInputContainer}>
            <SearchBox
              ref={ref => (this.searchBar = ref)}
              onSubmit={() => this.search(this.state.text)}
              onChange={text => this.onChangeText(text)}
              showCancel={true}
              onCancel={this.close}
              placeholderText={searchTitles}
            />
          </View>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingHorizontal: 15,
  },
  icon: {
    tintColor: 'silver',
    width: 18,
    height: 18,
    // top: 12,
    left: 15,
    resizeMode: 'contain',
    zIndex: 20,
  },
  closeWrapper: {
    top: 2,
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIconWrapper: {
    backgroundColor: 'silver',
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  closeIcon: {
    width: 12,
    height: 12,
    tintColor: 'white',
    resizeMode: 'contain',
  },
  textInputContainer: {
    // flex: 1,
  },
})

export default Search
