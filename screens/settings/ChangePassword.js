import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { StyleSheet, View } from 'react-native'
import { theme } from '@styles/theme'
import TimerMixin from 'react-timer-mixin'

import t from '@config/i18n'
import * as authActions from '@actions/auth'

import Button from '@components/Button'
import HeaderTitle from '@components/HeaderTitle'
import Text from '@components/Text'
import Loading from '@components/Loading'
import BackButton from '@components/BackButton'

class ChangePassword extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: <HeaderTitle title={'password/changePasswordTitle'} />,
    headerLeft: (
      <BackButton
        onPress={
          navigation.state.params && navigation.state.params.handleGoBack
        }
      />
    ),
    tabBarVisible: false,
  })

  componentDidMount() {
    this.props.navigation.setParams({
      handleGoBack: this.handleGoBack,
    })
  }

  handleResetPassword = () => {
    try {
      this.props.actions.resetPassword()
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
        <View style={styles.container}>
          <Text
            weight="bold"
            message="password/changePasswordFulfilledTitle"
            style={styles.title}
          />

          <Text
            message="password/changePasswordFulfilledText"
            style={styles.message}
          />

          <Text
            weight="bold"
            text={`${this.props.user.user.primary_email}.`}
            style={styles.message}
          />

          <Button
            label="common/ok"
            onPress={this.handleGoBack}
            style={styles.submitButton}
          />
        </View>
      )
    }

    return (
      <View style={styles.container}>
        <Text
          weight="bold"
          message="password/changePasswordMessageTitle"
          style={styles.title}
        />

        <Text
          message="password/changePasswordMessageText"
          style={styles.message}
        />

        <Button
          style={styles.submitButton}
          label="password/changePasswordButton"
          onPress={this.handleResetPassword}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 30,
  },
  title: {
    textAlign: 'center',
    fontSize: 17,
    paddingBottom: 5,
  },
  message: {
    textAlign: 'center',
    fontSize: theme.font.sizes.default,
    color: theme.fontColor,
    marginHorizontal: 15,
  },
  submitButton: {
    marginTop: 30,
  },
})

const mapStateToProps = ({ auth, user }) => ({
  auth,
  user,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(authActions, dispatch),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChangePassword)
