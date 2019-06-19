import React, { PureComponent } from 'react'
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import AnimatedTextInput from '@components/AnimatedTextInput'
import * as userActions from '@actions/user'

import t from '@config/i18n'
import Text from '@components/Text'
import HeaderTitle from '@components/HeaderTitle'
import Modal from '@components/Modal'
import { theme } from '@styles/theme'
import Button from '@components/Button'

import { isValidEmail } from '@utils'
import EmailRow from './components/EmailRow'

import User from '@api/user'

const UserAPI = new User()

class ManageEmails extends PureComponent {
  state = {
    addEmailVisible: false,
    email: '',
    isValidEmail: true,
    emailCount: 0,
    emails: [],
  }

  static navigationOptions = ({ navigation }) => ({
    headerTitle: <HeaderTitle title={'settings/manageEmailsTitle'} />,
    tabBarVisible: false,
  })

  static getDerivedStateFromProps(props, state) {
    const emailList = props.user.account.registeredEmails

    const emails = emailList
      .filter(email => email.email === props.user.account.primaryEmail)
      .concat(
        emailList.filter(
          email => email.email !== props.user.account.primaryEmail
        )
      )
    const emailCount = emails.length

    if (emails !== state.emails) {
      return {
        emails,
        emailCount,
      }
    }

    return null
  }

  toggleAddEmail = () => {
    if (this.state.emailCount > 4) {
      return Alert.alert(null, t('emails/maxEmailCount'))
    } else {
      return this.setState({ addEmailVisible: !this.state.addEmailVisible })
    }
  }

  addEmail = async email => {
    this.setState({ loading: true })
    try {
      await this.validate(email)

      if (this.state.isValidEmail) {
        await UserAPI.addEmail(email)
        await this.setState({ addEmailVisible: false, email: '' })
        await this.props.actions.getCurrentUser()
      }
    } catch (error) {
      console.warn('error', error)
    }
    this.setState({ loading: false })
  }

  validate = email => this.setState({ isValidEmail: isValidEmail(email) })

  render() {
    const { emailCount, emails, loading } = this.state
    return (
      <ScrollView style={styles.wrapper} keyboardShouldPersistTaps="true">
        <Text message="emails/emailMessage" style={styles.message} />

        <View style={styles.emailList}>
          <View style={styles.emailRow}>
            <Text
              type="title"
              message="emails/manageEmailTitle"
              values={{
                count: emailCount,
              }}
              style={styles.emailListTitle}
            />
          </View>

          {emails.map((email, key) => (
            <EmailRow email={email} key={key} />
          ))}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => this.toggleAddEmail(emailCount)}
            style={styles.button}
          >
            <Text
              type="title"
              weight="bold"
              message="emails/addAnotherEmailButton"
              style={styles.buttonText}
            />
          </TouchableOpacity>

          <Modal
            visible={this.state.addEmailVisible}
            onClose={() => this.toggleAddEmail(0)}
            onRequestClose={() => this.toggleAddEmail(0)}
          >
            <View style={styles.inputWrapper}>
              <AnimatedTextInput
                label={t('formLabels/email')}
                autoCapitalize="none"
                autoCorrect={false}
                inputContainerStyle={{
                  borderTopWidth: 0,
                  borderBottomWidth: 1,
                }}
                value={this.state.email}
                onChangeText={email => this.setState({ email })}
                errorMessage={
                  // this.state.email.length > 3 &&
                  !this.state.isValidEmail ? t('signup/validEmail') : null
                }
                onSubmitEditing={() => this.addEmail(this.state.email)}
              />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  paddingTop: 10,
                  height: 40,
                }}
              >
                {loading ? (
                  <ActivityIndicator />
                ) : (
                  <React.Fragment>
                    <Button
                      label="newsfeed/cancel"
                      style={[styles.actionButton, styles.cancelButton]}
                      textStyle={styles.cancelButtonText}
                      onPress={() => this.toggleAddEmail(0)}
                    />

                    <Button
                      label="common/save"
                      style={styles.actionButton}
                      textStyle={styles.saveButtonText}
                      onPress={() => this.addEmail(this.state.email)}
                    />
                  </React.Fragment>
                )}
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 20,
    paddingBottom: 40,
  },
  message: {
    alignSelf: 'center',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  emailList: {
    marginTop: 20,
  },
  emailListTitle: {
    fontSize: 18,
  },
  emailRow: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    marginTop: 20,
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: theme.secondaryColor,
    borderRadius: 5,
    padding: 10,
    marginBottom: 40,
  },
  buttonText: {
    color: theme.secondaryColor,
    fontSize: theme.font.sizes.smallest,
  },
  inputWrapper: {
    padding: 15,
  },
  actionButton: {
    marginTop: 20,
    width: null,
    height: 30,
    marginTop: 0,
    borderWidth: 1.1,
    borderColor: theme.secondaryColor,
    marginHorizontal: 8,
    padding: 2,
    paddingHorizontal: 14,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  saveButtonText: {
    fontSize: theme.font.sizes.smallest,
  },
  cancelButton: {
    padding: 2,
    borderColor: '#b9b9bc',
    borderWidth: 1,
    alignSelf: 'flex-end',
    backgroundColor: 'white',
    marginRight: 5,
  },
  cancelButtonText: {
    fontSize: theme.font.sizes.smallest,
    color: theme.borderDark,
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
)(ManageEmails)
