import React, { PureComponent } from 'react'
import {
  Alert,
  Animated,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import TimerMixin from 'react-timer-mixin'

import * as userActions from '@actions/user'

import t from '@config/i18n'
import Text from '@components/Text'
import { theme } from '@styles/theme'

import User from '@api/user'
import { arrowIcon } from '@components/Icons'

const UserAPI = new User()

class EmailRow extends PureComponent {
  state = {
    open: false,
    slideHeight: new Animated.Value(0),
  }

  toggleRow = confirmed => {
    let toValue = this.state.open ? 0 : 70

    if (!confirmed) {
      toValue = this.state.open ? 0 : 200
    }

    const timeout = this.state.open ? 0 : 150

    TimerMixin.setTimeout(() => {
      this.setState({
        open: !this.state.open,
      })
    }, timeout)

    Animated.spring(this.state.slideHeight, {
      toValue,
      bounciness: 0,
    }).start()
  }

  deleteEmail = async email => {
    this.toggleRow()

    await UserAPI.deleteEmail(email)

    await this.props.actions.getCurrentUser()
  }

  resendConfirmation = async email => {
    const confirmation = await UserAPI.resendEmailConfirmation(email)

    if (confirmation.ok) {
      Alert.alert(
        t('unverified/confirmationResent'),
        t('unverified/checkYourEmail')
      )
    }
  }

  makePrimary = async email => {
    this.toggleRow()

    await UserAPI.setEmailPrimary(email)

    await this.props.actions.getCurrentUser()
  }

  renderConfirmedOptions = email => {
    return (
      <View style={styles.row}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => this.deleteEmail(email)}
          style={styles.button}
        >
          <Text
            type="title"
            weight="bold"
            message="emails/deleteButton"
            style={styles.buttonText}
          />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => this.makePrimary(email)}
          style={styles.button}
        >
          <Text
            type="title"
            weight="bold"
            message="emails/makePrimaryButton"
            style={styles.buttonText}
          />
        </TouchableOpacity>
      </View>
    )
  }

  renderUnconfirmedOptions = email => {
    return (
      <View style={styles.unconfirmed}>
        <Text
          weight="bold"
          message="emails/unconfirmedActionMessage"
          values={{
            email: <Text text={email} style={styles.expandMessageBold} />,
          }}
          style={styles.expandMessage}
        />
        <View style={styles.row}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => this.deleteEmail(email)}
            style={styles.button}
          >
            <Text
              type="title"
              weight="bold"
              message="emails/deleteButton"
              style={styles.buttonText}
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => this.resendConfirmation(email)}
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
      </View>
    )
  }

  render() {
    const { key, user, email } = this.props

    const isPrimary = user.primary_email === email.email
    const statusMessage = email.confirmed
      ? 'emails/confirmed'
      : 'emails/unconfirmed'

    const expandRowStyle = [
      styles.expandRow,
      {
        height: this.state.slideHeight,
      },
    ]

    return (
      <View key={`email-${key}`}>
        <TouchableOpacity
          activeOpacity={isPrimary ? 1 : 0.7}
          onPress={() => this.toggleRow(email.confirmed)}
          style={styles.emailRow}
        >
          <View style={styles.textContainer}>
            <Text weight="bold" text={email.email} />
            <View style={styles.row}>
              {isPrimary && (
                <Text
                  type="title"
                  message="emails/primary"
                  style={styles.emailDetailsText}
                />
              )}
              <Text
                type="title"
                message={statusMessage}
                style={styles.emailDetailsText}
              />
            </View>
          </View>
          {!isPrimary && <Image style={styles.downArrow} source={arrowIcon} />}
        </TouchableOpacity>
        {!isPrimary && (
          <Animated.View style={expandRowStyle}>
            {this.state.open && (
              <View>
                {email.confirmed
                  ? this.renderConfirmedOptions(email.email)
                  : this.renderUnconfirmedOptions(email.email)}
              </View>
            )}
          </Animated.View>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailRow: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailDetailsText: {
    fontSize: theme.font.sizes.smallVariation,
  },
  textContainer: {
    flex: 1,
  },
  downArrow: {
    width: 20,
    height: 15,
    resizeMode: 'contain',
  },
  expandRow: {
    backgroundColor: theme.mainColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandMessage: {
    marginBottom: 15,
    paddingHorizontal: 10,
    color: 'white',
  },
  expandMessageBold: {
    color: 'white',
  },
  button: {
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: theme.mainColor,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: theme.font.sizes.smallest,
  },
  unconfirmed: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default connect(
  state => ({
    user: state.user.user,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        ...userActions,
      },
      dispatch
    ),
  })
)(EmailRow)
