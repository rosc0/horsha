import React, { PureComponent } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { NavigationActions } from 'react-navigation'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import t from '@config/i18n'
import HeaderTitle from '@components/HeaderTitle'
import Text from '@components/Text'
import Button from '@components/Button'

import * as horseActions from '@actions/horses'

import Horses from '@api/horses'

const HorsesAPI = new Horses()

class ArchivedUser extends PureComponent {
  static navigationOptions = {
    headerTitle: <HeaderTitle title={'horses/archived'} />,
    tabBarVisible: false,
  }

  removeFromMyHorses = id => {
    Alert.alert(
      t('horses/removeFromMyHorsesTitle'),
      t('horses/removeFromMyHorsesMessage'),
      [
        {
          text: t('common/cancel'),
        },
        {
          text: t('common/ok'),
          onPress: async () => {
            await HorsesAPI.deleteHorseUser(id)
            await this.props.actions.getHorses()

            return this.props.navigation.dispatch(
              NavigationActions.navigate({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: 'Horses' })],
              })
            )
          },
        },
      ],
      {
        cancelable: true,
      }
    )
  }

  render() {
    const { navigation } = this.props
    const horseUser = navigation.getParam('horseUser', 'NO-ID')

    return (
      <View style={styles.wrapper}>
        <Text
          message={'horses/archivedMessage'}
          values={{
            horseName: horseUser.horse.name,
          }}
          style={styles.text}
        />
        <Button
          label="horses/removeFromMyHorses"
          onPress={() => this.removeFromMyHorses(horseUser.id)}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
  },
  text: {
    margin: 30,
  },
})

export default connect(
  null,
  dispatch => ({
    actions: bindActionCreators(
      {
        ...horseActions,
      },
      dispatch
    ),
  })
)(ArchivedUser)
