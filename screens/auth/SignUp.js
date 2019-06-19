import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import DeviceInfo from 'react-native-device-info'
import CountryPicker, {
  getAllCountries,
} from 'react-native-country-picker-modal'

import { isPasswordValid } from '@utils'
import t from '@config/i18n'
import { theme } from '@styles/theme'
import Button from '@components/Button'
import Text from '@components/Text'
import HeaderTitle from '@components/HeaderTitle'
import AnimatedTextInput from '@components/AnimatedTextInput'
import { IconImage } from '@components/Icons'
import FacebookLoginButton from './components/FacebookLoginButton'

import * as userActions from '@actions/user'
import * as authActions from '@actions/auth'

class SignUp extends PureComponent {
  static navigationOptions = () => ({
    headerTitle: <HeaderTitle title={'signup/signupTitle'} />,
  })

  currentCountryInfo = getAllCountries()
    .filter(country => country.cca2 === DeviceInfo.getDeviceCountry())
    .pop()

  state = {
    name: '',
    nameError: false,
    email: '',
    emailError: false,
    countryError: false,
    password: '',
    passwordRepeat: '',
    noMatchError: false,
    rulesError: false,
    countryCode: this.currentCountryInfo.name.common,
    cca2: this.currentCountryInfo.cca2,
    checking: false,
  }

  navigateToTerms = () => {
    this.props.navigation.navigate('TermsAndConditions')
  }

  navigateToPrivacy = () => {
    this.props.navigation.navigate('PrivacyPolicy')
  }

  signUp = async () => {
    this.setState({
      nameError: false,
      emailError: false,
      countryError: false,
      noMatchError: false,
      rulesError: false,
    })

    let error = false

    const { name, email, password, passwordRepeat } = this.state

    this.setState({
      checking: true,
    })

    setTimeout(() => {
      this.setState({
        checking: false,
      })
    }, 1000)

    if (!name) {
      error = true
      this.setState({
        nameError: true,
      })
    }

    if (!email) {
      error = true
      this.setState({
        emailError: true,
      })
    }

    if (!isPasswordValid(password)) {
      error = true
      this.setState({
        rulesError: true,
      })
    }

    if (password !== passwordRepeat) {
      error = true
      this.setState({
        noMatchError: true,
      })
    }

    if (!this.state.cca2) {
      error = true
      this.setState({
        countryError: true,
      })
    }

    if (!error) {
      const userData = {
        name,
        password,
        email,
        country_code: this.state.cca2,
      }

      const user = await this.props.actions.createUser(userData)

      if (user.value && user.value.id) {
        this.props.actions.authenticateByPassword(email, password)
      } else {
        let errorMessage = t('signup/serverError')

        if (user.value.status === 422) {
          errorMessage = t('signup/invalidContentError', {
            response: user.value._bodyText,
          })
        }

        if (user.value.status === 409) {
          errorMessage = t('signup/emailConflictError')
        }

        Alert.alert(t('common/error'), errorMessage)
      }
    }
  }

  toggleCountry = () => this.picker && this.picker.openModal()

  onChangeCountry = country =>
    this.setState({
      cca2: country.cca2,
      countryCode: country.name,
    })

  componentDidMount() {
    this.props.navigation.setParams({
      title: t('signup/signupTitle'),
    })
  }

  render() {
    const {
      nameError,
      emailError,
      rulesError,
      noMatchError,
      countryError,
      name,
      email,
      password,
      passwordRepeat,
      checking,
    } = this.state

    return (
      <KeyboardAwareScrollView style={styles.wrapper}>
        <ScrollView style={styles.wrapper}>
          <AnimatedTextInput
            label={t('formLabels/name')}
            value={name}
            autoCapitalize="none"
            autoCorrect={false}
            marginTop={10}
            inputContainerStyle={styles.inputContainerStyle}
            onChangeText={name => this.setState({ name })}
            errorMessage={nameError ? t('signup/nameError') : null}
          />

          <AnimatedTextInput
            label={t('formLabels/email')}
            value={email}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            marginTop={10}
            inputContainerStyle={styles.inputContainerStyle}
            onChangeText={email => this.setState({ email })}
            errorMessage={emailError ? t('signup/emailError') : null}
          />

          <AnimatedTextInput
            label={t('formLabels/password')}
            value={password}
            autoCapitalize="none"
            autoCorrect={false}
            isPassword={true}
            marginTop={10}
            inputContainerStyle={styles.inputContainerStyle}
            onChangeText={password => this.setState({ password })}
            errorMessage={rulesError ? t('password/rulesError') : null}
          />

          <AnimatedTextInput
            label={t('formLabels/passwordRepeat')}
            value={passwordRepeat}
            autoCapitalize="none"
            autoCorrect={false}
            isPassword={true}
            marginTop={10}
            inputContainerStyle={styles.inputContainerStyle}
            onChangeText={passwordRepeat => this.setState({ passwordRepeat })}
            errorMessage={noMatchError ? t('password/noMatchError') : null}
          />

          <TouchableOpacity onPress={this.toggleCountry} activeOpacity={0.7}>
            <View style={styles.optionContainer}>
              <Text
                type="title"
                weight="bold"
                message="editProfile/livingIn"
                style={styles.optionsLabel}
              />
              <Text
                weight="bold"
                type="title"
                text={this.state.countryCode}
                style={styles.selectedOption}
              />

              <View style={{ marginTop: -5 }}>
                <CountryPicker
                  flagType="emoji"
                  ref={ref => (this.picker = ref)}
                  closeable
                  filterable
                  onChange={this.onChangeCountry}
                  cca2={this.state.cca2}
                  translation="eng"
                  filterPlaceholderTextColor="#444"
                  styles={{
                    header: {
                      backgroundColor: '#bbb',
                      marginTop: 0,
                      paddingTop: 20,
                    },
                    letter: {
                      padding: 4,
                      marginBottom: 10,
                      marginRight: 0,
                      width: 30,
                      alignItems: 'flex-start',
                    },
                    letterText: {
                      fontSize: 18,
                      color: theme.mainColor,
                      fontFamily: 'Nunito',
                    },
                    itemCountry: {
                      alignItems: 'center',
                    },
                    itemCountryName: {
                      borderBottomWidth: 0,
                    },
                    countryName: {
                      fontFamily: 'Nunito-Bold',
                      fontSize: 16,
                      color: 'gray',
                    },
                  }}
                />
              </View>
              <IconImage source="nextIcon" style={styles.rightArrow} />
            </View>
          </TouchableOpacity>
          {countryError && (
            <View style={styles.errorContainer}>
              <Text
                weight="bold"
                message="signup/countryError"
                style={styles.errorText}
              />
            </View>
          )}

          <View>
            <Button
              style={styles.signUpButton}
              textStyle={styles.signUpButtonText}
              label={checking ? null : 'signup/signupButton'}
              onPress={this.signUp}
            >
              {checking && (
                <ActivityIndicator
                  animating={true}
                  size="small"
                  style={styles.checking}
                />
              )}
            </Button>
          </View>

          <View style={styles.facebookWrapper}>
            <Text
              type="title"
              weight="bold"
              style={styles.or}
              message="signup/or"
            />
            <FacebookLoginButton label="signup/facebookSignUpButton" />
          </View>

          <View>
            <Text
              message="signup/disclaimer"
              values={{
                termsLink: (
                  <Text
                    type="title"
                    weight="bold"
                    style={styles.disclaimerLink}
                    onPress={this.navigateToTerms}
                    message="signup/termsLink"
                  />
                ),
                privacyLink: (
                  <Text
                    type="title"
                    weight="bold"
                    style={styles.disclaimerLink}
                    onPress={this.navigateToPrivacy}
                    message="signup/privacyLink"
                  />
                ),
              }}
              type="title"
              style={styles.disclaimer}
            />
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
  },
  optionsLabel: {
    color: theme.fontColorLight,
    fontSize: theme.font.sizes.defaultPlus,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  signUpButton: {
    marginTop: 30,
    padding: 10,
  },
  signUpButtonText: {
    fontSize: theme.font.sizes.smallVariation,
  },
  checking: {
    height: 12,
    marginVertical: 3,
  },
  facebookWrapper: {
    marginTop: 15,
  },
  or: {
    alignSelf: 'center',
    color: theme.fontColor,
    marginBottom: 15,
    fontSize: theme.font.sizes.small,
  },
  disclaimer: {
    width: '70%',
    fontSize: theme.font.sizes.small,
    alignSelf: 'center',
    textAlign: 'center',
    color: theme.fontColor,
    marginTop: 15,
  },
  disclaimerLink: {
    color: theme.fontColor,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 38,
    paddingLeft: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  selectedOption: {
    flex: 1,
    textAlign: 'right',
    marginRight: 10,
    color: '#ceced4',
  },
  rightArrow: {
    width: 13,
    height: 13,
    marginRight: 10,
    marginLeft: 15,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  errorContainer: {
    marginTop: -1,
    borderTopWidth: 1,
    borderTopColor: theme.mainColor,
    paddingHorizontal: theme.paddingHorizontal,
    paddingTop: 5,
    paddingBottom: 10,
  },
  errorText: {
    fontSize: theme.font.sizes.smallest,
    color: theme.mainColor,
  },
  inputContainerStyle: {
    borderTopWidth: 0,
  },
})

export default connect(
  state => ({ auth: state.auth }),
  dispatch => ({
    actions: bindActionCreators({ ...userActions, ...authActions }, dispatch),
  })
)(SignUp)
