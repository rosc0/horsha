import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'

import { theme } from '@styles/theme'
import Text from '@components/Text'
import t from '@config/i18n'

import User from '@api/user'

const UserAPI = new User()

class UnverifiedEmail extends Component {
  state = {
    context: null,
  }

  componentDidMount() {
    if (
      this.props.navigation.state.params &&
      this.props.navigation.state.params.context
    ) {
      this.setState({ context: this.props.navigation.state.params.context })
    }
  }

  resendEmailConfirmation = async email => {
    const confirmation = await UserAPI.resendEmailConfirmation(email)

    if (confirmation.ok) {
      Alert.alert(
        t('unverified/confirmationResent'),
        t('unverified/checkYourEmail')
      )
    }
  }

  render = () => {
    const { user } = this.props
    const { context } = this.state

    const primaryEmail = user.user.primary_email

    return (
      <View style={styles.wrapper}>
        <View style={styles.textContainer}>
          {context === 'addFriend' && (
            <Text
              message="unverified/addFriendMessage"
              weight="bold"
              style={styles.contextMessage}
            />
          )}
          <Text
            message="unverified/message"
            values={{
              email: (
                <Text
                  text={primaryEmail}
                  weight="bold"
                  style={styles.emailText}
                />
              ),
            }}
            style={styles.message}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => this.resendEmailConfirmation(primaryEmail)}
          style={styles.button}
        >
          <Text
            type="title"
            weight="bold"
            message="unverified/resendEmailConfirmation"
            style={styles.buttonText}
          />
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
  },
  textContainer: {
    marginTop: 40,
    marginHorizontal: 30,
  },
  contextMessage: {
    fontSize: 20,
    paddingBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
  },
  emailText: {
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: theme.lightGreen,
    borderRadius: 5,
    padding: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: theme.font.sizes.smallest,
  },
})

export default connect(state => ({ user: state.user }))(UnverifiedEmail)
