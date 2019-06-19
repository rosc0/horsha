import React, { PureComponent } from 'react'
import { StyleSheet, View } from 'react-native'
import Search from './ForkedSearchBox'
import { theme } from '@styles/theme'

class SearchBox extends PureComponent {
  state = {
    cancelButton: false,
  }

  showCancelButton() {
    if (this.props.showCancel) {
      this.setState({ cancelButton: true })
    }
  }

  hideCancelButton() {
    if (this.props.showCancel) {
      this.setState({ cancelButton: false })
    }
  }

  unFocus = () => this.searchBar.unFocus()

  render() {
    const {
      placeholderText,
      onChange,
      onSubmit,
      onCancel,
      autoCapitalize = 'sentences',
    } = this.props

    return (
      <View style={styles.searchBoxWrapper}>
        <Search
          ref={ref => (this.searchBar = ref)}
          placeholder={placeholderText}
          showsCancelButton={this.state.cancelButton}
          tintColorSearch={theme.fontColor}
          titleCancelColor={theme.secondaryColor}
          backgroundColor={theme.mainColor}
          inputStyle={{
            backgroundColor: 'white',
            fontSize: 14,
            color: '#666',
            fontFamily: 'OpenSans',
          }}
          placeholderCollapsedMargin={60}
          searchIconCollapsedMargin={70}
          placeholderExpandedMargin={25}
          searchBarStyle="minimal"
          onFocus={() => this.showCancelButton()}
          onBlur={() => this.hideCancelButton()}
          onChangeText={text => (onChange ? onChange(text) : null)}
          onSearch={searchTerm => onSubmit(searchTerm)}
          onCancel={() => onCancel()}
          autoCapitalize={autoCapitalize}
          cancelButtonTextStyle={{
            fontFamily: 'Nunito-Bold',
            fontSize: theme.font.sizes.default,
            color: 'white',
          }}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  searchBoxWrapper: {
    // borderBottomWidth: 0,
    // height: 45,
    // width: 250,
  },
})

export default SearchBox
