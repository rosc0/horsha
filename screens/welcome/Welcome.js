import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Dimensions, Image, StyleSheet, View } from 'react-native'
import Swiper from 'react-native-swiper'

import { theme } from '@styles/theme'
import Button from '@components/Button'
import Text from '@components/Text'
import * as settingsActions from '@actions/settings'
// import Video from 'react-native-video'

// import VideoTest from '../../../assets/animationtest2.mp4'

const { width } = Dimensions.get('window')
const isSmallPhone = width < 450

class Welcome extends Component {
  navigateToLogin = () => this.props.navigation.navigate('Login')

  navigateToSignUp = () => this.props.navigation.navigate('SignUp')

  render() {
    const swiperConfig = {
      autoplay: false,
      autoplayTimeout: 5,
      showsButtons: false,
      height: isSmallPhone ? 420 : 450,
      dot: <View style={styles.dot} />,
      activeDot: <View style={[styles.dot, styles.activeDot]} />,
    }

    return (
      <View style={styles.wrapper}>
        <View style={styles.logoWrapper}>
          <Image
            source={require('@images/logos/Horsha.png')}
            style={styles.logo}
          />
        </View>
        {/* <Video
          // repeat
          // source={VideoTest}
          // resizeMode="cover"
          source={require('../../../assets/animationtest2.mp4')}
        /> */}

        {/* <Video source={VideoTest}   // Can be a URL or a local file.
          ref={(ref) => {
            this.player = ref
          }}                                      // Store reference
        // onBuffer={this.onBuffer}                // Callback when remote video is buffering
        // onError={this.videoError}               // Callback when video cannot be loaded
        // style={styles.backgroundVideo}
        /> */}

        <Swiper style={styles.swiperWrapper} {...swiperConfig}>
          <View style={[styles.slide, styles.slide1]}>
            <View
              style={{
                position: 'absolute',
                zIndex: 100,
                width: '100%',
                bottom: 85,
                alignItems: 'center',
                backgroundColor: 'transparent',
              }}
            >
              <Text
                type="title"
                weight="bold"
                style={styles.title}
                message="welcome/slide1Title"
              />
              <Text style={styles.text} message="welcome/slide1Content" />
            </View>
          </View>

          <View style={[styles.slide, styles.slide1]}>
            <View
              style={{
                position: 'absolute',
                zIndex: 100,
                width: '100%',
                bottom: 85,
                alignItems: 'center',
                backgroundColor: 'transparent',
              }}
            >
              <Text
                type="title"
                weight="bold"
                style={styles.title}
                message="welcome/slide1Title"
              />
              <Text style={styles.text} message="welcome/slide1Content" />
            </View>
          </View>

          <View style={[styles.slide, styles.slide1]}>
            <View
              style={{
                position: 'absolute',
                zIndex: 100,
                width: '100%',
                bottom: 85,
                alignItems: 'center',
                backgroundColor: 'transparent',
              }}
            >
              <Text
                type="title"
                weight="bold"
                style={styles.title}
                message="welcome/slide1Title"
              />
              <Text style={styles.text} message="welcome/slide1Content" />
            </View>
          </View>
        </Swiper>

        <View style={{ flex: 0.6 }}>
          <Button
            style={styles.signupButton}
            textStyle={styles.buttonText}
            label="welcome/signup"
            onPress={() => this.navigateToSignUp()}
          />

          <Button
            style={styles.loginButton}
            textStyle={styles.buttonText}
            label="welcome/login"
            type="secondary"
            onPress={() => this.navigateToLogin()}
          />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: theme.mainColor,
  },
  swiperWrapper: {
    height: 200,
  },
  logoWrapper: {
    position: 'absolute',
    zIndex: 100,
    top: 40,
    left: 0,
    right: 0,
    bottom: 0,
    height: 150,
  },
  logo: {
    width: 160,
    height: 150,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  slide1: {
    backgroundColor: theme.mainColor,
  },
  dot: {
    backgroundColor: '#7c2d1b',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
  activeDot: {
    backgroundColor: 'white',
  },
  title: {
    color: '#fff',
    fontSize: 24,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    width: '75%',
    textAlign: 'center',
    top: 5,
  },
  signupButton: {
    padding: 10,
  },
  loginButton: {
    padding: 8,
  },
  buttonText: {
    fontSize: theme.font.sizes.smallVariation,
  },
})

export default connect(
  state => ({ settings: state.settings }),
  dispatch => ({ actions: bindActionCreators(settingsActions, dispatch) })
)(Welcome)
