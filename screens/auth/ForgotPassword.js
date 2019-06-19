import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { StyleSheet, View } from 'react-native'
import { theme } from '@styles/theme'
import TimerMixin from 'react-timer-mixin'

import t from '@config/i18n'
import * as authActions from '@actions/auth'

import Button from '@components/Button'
import Text from '@components/Text'
import Loading from '@components/Loading'
import BackButton from '@components/BackButton'
import AnimatedTextInput from '@components/AnimatedTextInput'
import HeaderTitle from '@components/HeaderTitle'
class ForgotPassword extends PureComponent {
  state = {
    email: '',
  }

  static navigationOptions = ({ navigation }) => ({
    headerTitle: <HeaderTitle title={'password/resetPasswordTitle'} />,
    headerLeft: (
      <BackButton
        onPress={
          navigation.state.params && navigation.state.params.handleGoBack
        }
      />
    ),
  })

  componentDidMount() {
    this.props.navigation.setParams({
      handleGoBack: this.handleGoBack,
    })
  }

  handleResetPassword = () => {
    try {
      this.props.actions.resetPassword(this.state.email)
    } catch (err) {
      alert(t('password/resetPasswordError'))
    }
  }

  handleGoBack = () => {
    this.props.navigation.goBack(null)

    TimerMixin.setTimeout(this.props.actions.clearResetPassword, 700)
  }

  render() {
    if (this.props.auth.resetPassword.fetching) {
      return <Loading type="spinner" />
    }

    if (this.props.auth.resetPassword.fulfilled) {
      return (
        <View style={[styles.container, styles.fulfilledContainer]}>
          <Text
            weight="bold"
            message="password/resetPasswordFulfilledTitle"
            style={styles.resetPasswordFulfilledTitle}
          />

          <Text
            message="password/resetPasswordFulfilledText"
            style={styles.resetPasswordFulfilledText}
          />

          <Text
            weight="bold"
            message="password/resetPasswordFulfilledEmailText"
            values={{
              email: this.state.email,
            }}
            style={styles.resetPasswordFulfilledText}
          />

          <Button
            label="common/ok"
            onPress={this.handleGoBack}
            style={styles.submitButton}
          />
        </View>
      )
    }

    const { email } = this.state

    return (
      <View style={styles.container}>
        <Text message="password/resetMessage" style={styles.message} />

        <AnimatedTextInput
          label={t('formLabels/email')}
          value={email}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          marginTop={10}
          inputContainerStyle={styles.inputContainerStyle}
          onChangeText={email => this.setState({ email })}
          returnKeyType="go"
          onSubmitEditing={this.handleResetPassword}
        />

        <View>
          <Button
            style={styles.submitButton}
            textStyle={styles.submitButtonText}
            label="password/resetPasswordButton"
            onPress={this.handleResetPassword}
          />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingTop: 0,
    flex: 1,
  },
  fulfilledContainer: {
    flexDirection: 'column',
    paddingTop: 30,
  },
  resetPasswordFulfilledTitle: {
    textAlign: 'center',
    fontSize: 17,
    paddingBottom: 5,
  },
  resetPasswordFulfilledText: {
    textAlign: 'center',
    fontSize: theme.font.sizes.default,
    color: theme.fontColor,
    marginHorizontal: 15,
  },
  message: {
    width: '75%',
    textAlign: 'center',
    alignSelf: 'center',
    fontSize: theme.font.sizes.default,
    paddingTop: 30,
    paddingBottom: 30,
    color: theme.fontColor,
  },
  submitButton: {
    marginTop: 30,
    padding: 10,
  },
  submitButtonText: {
    fontSize: theme.font.sizes.smallVariation,
  },
  inputContainerStyle: {
    borderTopWidth: 0,
  },
})

const mapStateToProps = ({ auth }) => ({
  auth,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(authActions, dispatch),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ForgotPassword)
