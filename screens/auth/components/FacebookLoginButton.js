import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Alert, StyleSheet, TouchableOpacity } from 'react-native'
import { AccessToken, LoginManager } from 'react-native-fbsdk'

import * as userActions from '@actions/user'
import * as authActions from '@actions/auth'

import t from '@config/i18n'
import Text from '@components/Text'
import { IconImage } from '@components/Icons'
import { theme } from '@styles/theme'

class FacebookLoginButton extends PureComponent {
  handleLoginWithFacebook = async () => {
    const facebookData = await AccessToken.getCurrentAccessToken()

    // check permissions
    if (
      facebookData &&
      facebookData.permissions.indexOf('public_profile') > -1 &&
      facebookData.permissions.indexOf('email') > -1 &&
      facebookData.permissions.indexOf('user_friends') > -1
    ) {
      await this.props.actions.authenticateByFacebook(facebookData.accessToken)
    } else {
      const login = await LoginManager.logInWithReadPermissions([
        'public_profile',
        'email',
        'user_friends',
      ])

      if (!login.isCancelled) {
        const facebookData = await AccessToken.getCurrentAccessToken()
        await this.props.actions.authenticateByFacebook(
          facebookData.accessToken
        )
      } else {
        Alert.alert(null, t('signup/facebookPermissionsMessage'))
      }
    }
  }

  render() {
    const { label } = this.props

    return (
      <TouchableOpacity
        style={styles.button}
        onPress={() => this.handleLoginWithFacebook()}
        activeOpacity={0.7}
      >
        <IconImage style={styles.fbIcon} source="facebook" />
        <Text message={label} type="title" weight="bold" style={styles.text} />
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  button: {
    width: '85%',
    alignItems: 'center',
    flexDirection: 'row',
    alignSelf: 'center',
    padding: 10,
    backgroundColor: '#3b5998',
    borderRadius: 5,
    justifyContent: 'center',
  },
  fbIcon: {
    alignSelf: 'center',
    width: 18,
    height: 18,
    resizeMode: 'contain',
    marginRight: 10,
  },
  text: {
    alignSelf: 'center',
    color: 'white',
    marginLeft: 10,
    fontSize: theme.font.sizes.smallVariation,
  },
})

export default connect(
  null,
  dispatch => ({
    actions: bindActionCreators({ ...userActions, ...authActions }, dispatch),
  })
)(FacebookLoginButton)
