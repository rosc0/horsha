import React, { PureComponent } from 'react'
import { Dimensions } from 'react-native'
import config from 'react-native-config'
import t from '@config/i18n'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { theme } from '@styles/theme'

class GooglePlacesInput extends PureComponent {
  clear = () => {
    this.input.setAddressText('')
  }

  render() {
    const {
      style,
      onPress,
      autoFocus = true,
      closeButtum,
      searchIcon,
    } = this.props

    const searchLocations = t('maps/searchLocations')

    return (
      <GooglePlacesAutocomplete
        ref={ref => (this.input = ref)}
        textInputProps={{
          autoCorrect: false,
          clearButtonMode: 'never',
        }}
        placeholder={searchLocations}
        minLength={3}
        autoFocus={autoFocus}
        listViewDisplayed="auto"
        fetchDetails
        renderDescription={row => row.description}
        onPress={(data, geocoding) => {
          if (geocoding) {
            const { lat, lng } = geocoding.geometry.location
            onPress(lat, lng)
          }
        }}
        getDefaultValue={() => ''}
        GoogleReverseGeocodingQuery={{ address: 'address' }}
        query={{ key: config.GOOGLE_PLACES_API_KEY }}
        styles={styles}
        currentLocation={false}
        debounce={450}
        renderLeftButton={() => searchIcon}
        renderRightButton={() => closeButtum}
      />
    )
  }
}

// No need for StyleSheets here because it will be passed to
// google-places-autocomplete component and it's already using it
const styles = {
  textInputContainer: {
    borderRadius: 3,
    borderWidth: 0,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    backgroundColor: '#fff',
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  textInput: {
    paddingLeft: 5,
    marginLeft: 20,
    fontFamily: 'OpenSans',
    backgroundColor: '#fff',
  },
  description: {
    fontSize: theme.font.sizes.small,
    color: '#666',
    fontFamily: 'OpenSans',
  },
  powered: {
    alignSelf: 'flex-end',
  },
  row: {
    backgroundColor: '#fff',
    width: Dimensions.get('window').width,
  },
}

export default GooglePlacesInput
