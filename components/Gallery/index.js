import React, { PureComponent } from 'react'
import {
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ImageBackground,
  View,
  StyleSheet,
} from 'react-native'
import { brokenIcon, checkIcon, closeIcon } from '../Icons'
import { theme } from '@styles/theme'

const { width } = Dimensions.get('window')

export default class DisplayGallery extends PureComponent {
  state = {
    shouldDeletePhotos: false,
    shouldSelectPhotos: false,
    selectedImages: [],
  }

  static getDerivedStateFromProps(props, state) {
    if (props.shouldDeletePhotos !== state.shouldDeletePhotos) {
      return {
        shouldDeletePhotos: props.shouldDeletePhotos,
      }
    }

    if (props.shouldSelectPhotos !== state.shouldSelectPhotos) {
      return {
        shouldSelectPhotos: props.shouldSelectPhotos,
      }
    }

    if (props.selectedImages !== state.selectedImages) {
      return {
        selectedImages: props.selectedImages,
      }
    }
    // Return null to indicate no change to state.
    return null
  }

  getGalleryType = () => {
    const { shouldSelectPhotos, shouldDeletePhotos } = this.state

    if (shouldSelectPhotos) {
      return 'select'
    }

    if (shouldDeletePhotos) {
      return 'delete'
    }

    return 'list'
  }

  // getGalleryType = () => {
  //   const { shouldSelectPhotos, shouldDeletePhotos } = this.state

  //   if (shouldDeletePhotos) {
  //     return 'delete'
  //   }

  //   if (shouldSelectPhotos) {
  //     return 'select'
  //   }

  //   return 'list'
  // }

  onError = error => {
    this.props.onError(error)
    this.setState({ isImageBroken: true })
  }

  handlePressImage = item => this.props.handlePressImage(item)

  renderGalleryItem = (item, index, number = 4) => {
    const type = this.getGalleryType()
    const { isImageBroken } = this.state
    const selected = this.state.selectedImages.includes(item.id)
    const image = isImageBroken ? brokenIcon : item.source
    if (type === 'select') {
      return (
        <TouchableOpacity onPress={() => this.handlePressImage(item)}>
          <ImageBackground
            style={[
              styles.image,
              {
                width: width / number - 2,
                height: width / number - 2,
              },
            ]}
            source={image}
            resizeMode="cover"
            onError={this.onError}
          >
            <Image
              source={checkIcon}
              style={[styles.checkIcon, !selected && styles.unselectedCheck]}
            />
          </ImageBackground>
        </TouchableOpacity>
      )
    }
    if (type === 'delete') {
      return (
        <TouchableOpacity onPress={() => this.handlePressImage(item)}>
          <ImageBackground
            style={[
              styles.image,
              {
                width: width / number - 2,
                height: width / number - 2,
              },
            ]}
            source={image}
            resizeMode="cover"
            onError={this.onError}
          >
            <Image source={closeIcon} style={styles.checkIcon} />
          </ImageBackground>
        </TouchableOpacity>
      )
    }
    return (
      <TouchableOpacity onPress={() => this.props.setIndex(index)}>
        <Image style={styles.image} source={item.source} resizeMode="cover" />
      </TouchableOpacity>
    )
  }

  render() {
    const {
      contentContainerStyle,
      data,
      ListEmptyComponent,
      backgroundColor = theme.backgroundColor,
    } = this.props

    return (
      <View style={[styles.default, { backgroundColor }]}>
        <FlatList
          contentContainerStyle={contentContainerStyle}
          data={data}
          scrollEventThrottle={1}
          numColumns={this.props.numColumns || 4}
          keyExtractor={(item, index) => `${item.id}${index}`}
          renderItem={({ item, index }) =>
            this.renderGalleryItem(item, index, this.props.numColumns || 4)
          }
          ListEmptyComponent={ListEmptyComponent}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  default: {
    backgroundColor: theme.backgroundColor,
    flex: 1,
  },
  unselectedCheck: {
    opacity: 0.3,
  },
  checkIcon: {
    width: 18,
    height: 14,
    right: 5,
    top: 5,
    alignSelf: 'flex-end',
    tintColor: 'white',
  },
  image: {
    width: width / 4 - 2,
    height: width / 4 - 2,
    margin: 1,
    backgroundColor: 'rgba(0,0,0,0.075)',
  },
})
