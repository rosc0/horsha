import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Alert, Keyboard, Linking, StyleSheet, View } from 'react-native'
import config from 'react-native-config'
import { Formik } from 'formik'
import * as Yup from 'yup'

import validationTypes from '@constants/validationTypes'
import t from '@config/i18n'
import { theme } from '@styles/theme'
import FacebookLoginButton from './components/FacebookLoginButton'
import Button from '@components/Button'
import Text from '@components/Text'
import AnimatedTextInput from '@components/AnimatedTextInput'
import HeaderTitle from '@components/HeaderTitle'

import * as authActions from '@actions/auth'

class Login extends PureComponent {
  static navigationOptions = {
    headerTitle: <HeaderTitle title={'login/loginTitle'} />,
  }

  state = {
    loginError: false,
    loginErrorMessage: null,
  }

  navigateToForgotPassword = () => {
    this.props.navigation.navigate('ForgotPassword')
  }

  login = async values => {
    this.setState({
      loginError: false,
      loginErrorMessage: null,
    })

    if (!this.props.app.isDeviceConnected) {
      return Alert.alert(
        t('offline/noInternetTitle'),
        t('offline/noInternetContent')
      )
    }

    Keyboard.dismiss()

    const auth = await this.props.actions.authenticateByPassword(
      values.email,
      values.password
    )

    if (!auth.value.accessToken) {
      const response = await auth.value.json()

      let loginErrorMessage = null

      if (response.status === 422) {
        switch (response.id) {
          case 'invalid_password':
            {
              loginErrorMessage = 'login/credentailsError'
            }
            break
          case 'invalid_format':
            {
              loginErrorMessage = 'login/emailFormatError'
            }
            break
          case 'account_not_found':
            {
              loginErrorMessage = 'login/accountNotFoundError'
            }
            break
          case 'missing_password':
            {
              loginErrorMessage = 'login/noPasswordEnteredError'
            }
            break
          case 'missing_username':
            {
              loginErrorMessage = 'login/noEmailEnteredError'
            }
            break
          case 'account_disabled':
            {
              loginErrorMessage = 'login/suspendedError'

              Alert.alert(
                t('login/suspendedError'),
                t('login/suspendedMessage'),
                [
                  {
                    text: t('login/learnMore'),
                    onPress: () => this.openHelpLink(),
                  },
                  {
                    text: t('common/cancel'),
                    onPress: () => {},
                  },
                ]
              )
            }
            break
        }
      } else {
        loginErrorMessage = 'login/serverError'
      }

      this.setState({
        loginError: true,
        loginErrorMessage,
      })
    }
  }

  openHelpLink = () => {
    Linking.openURL(config.ZENDESK_BASE_URL)
  }

  render() {
    const { loginError, loginErrorMessage } = this.state

    const validationSchema = Yup.object().shape({
      email: validationTypes.email,
      password: validationTypes.loginPassword,
    })

    return (
      <View style={styles.wrapper}>
        <Formik
          initialValues={{
            email: '',
            password: '',
          }}
          onSubmit={this.login}
          validationSchema={validationSchema}
          render={({
            values,
            handleSubmit,
            setFieldValue,
            errors,
            touched,
            setFieldTouched,
            isValid,
          }) => (
            <React.Fragment>
              <AnimatedTextInput
                label={t('formLabels/email')}
                value={values.email}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                marginTop={10}
                inputContainerStyle={styles.inputContainerStyle}
                onChange={setFieldValue}
                onTouch={setFieldTouched}
                name="email"
                errorMessage={touched.email && errors.email}
              />

              <AnimatedTextInput
                label={t('formLabels/password')}
                value={values.password}
                autoCapitalize="none"
                autoCorrect={false}
                isPassword={true}
                returnKeyType="go"
                marginTop={10}
                inputContainerStyle={styles.inputContainerStyle}
                onChange={setFieldValue}
                onTouch={setFieldTouched}
                name="password"
                errorMessage={touched.password && errors.password}
              />

              {loginError && (
                <View style={styles.errorContainer}>
                  <Text
                    message={loginErrorMessage}
                    weight="bold"
                    style={styles.errorText}
                  />
                </View>
              )}

              <Button
                style={styles.loginButton}
                textStyle={styles.loginButtonText}
                label="welcome/login"
                onPress={handleSubmit}
                disabled={!isValid}
              />
            </React.Fragment>
          )}
        />

        <Button
          style={styles.forgotPasswordButton}
          textStyle={styles.forgotPasswordText}
          label="login/forgotPassword"
          onPress={this.navigateToForgotPassword}
        />

        <Text type="title" weight="bold" style={styles.or} message="login/or" />

        <FacebookLoginButton label={'login/facebook'} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
  },
  loginButton: {
    marginTop: 20,
    padding: 10,
  },
  loginButtonText: {
    fontSize: theme.font.sizes.smallVariation,
  },
  forgotPasswordButton: {
    backgroundColor: 'transparent',
  },
  forgotPasswordText: {
    fontSize: theme.font.sizes.small,
    color: theme.fontColor,
  },
  or: {
    alignSelf: 'center',
    color: theme.fontColor,
    marginBottom: 8,
    fontSize: theme.font.sizes.small,
  },
  errorContainer: {
    paddingLeft: 15,
    paddingTop: 20,
  },
  errorText: {
    fontSize: theme.font.sizes.smallest,
    color: theme.mainColor,
  },
  inputContainerStyle: {
    borderTopWidth: 0,
  },
})

const mapStateToProps = ({ auth, app }) => ({
  auth,
  app,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(authActions, dispatch),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login)
