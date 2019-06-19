import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import * as userActions from '@actions/user'
import Text from '@components/Text'
import HeaderTitle from '@components/HeaderTitle'
import Icon from '@components/Icon'
import { theme } from '@styles/theme'

class UnitSettings extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: <HeaderTitle title={'settings/unitSettingsTitle'} />,
    tabBarVisible: false,
  })

  state = {
    unit: null,
  }

  selectUnit = unit => {
    this.setState({ unit })

    const preferences = {
      ...this.props.user.user.account.preferences,
      unit_system: unit,
      height_unit: unit === 'imperial' ? 'hands' : 'centimeters',
    }

    this.props.actions.updateUserPreferences(preferences)
  }

  componentDidMount() {
    this.setState({
      unit: this.props.user.user.account.preferences.unitSystem,
    })
  }

  render() {
    return (
      <View style={styles.wrapper}>
        <View style={styles.settingsList}>
          <View style={styles.rowBorder}>
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={() => this.selectUnit('metric')}
            >
              <Text
                type="title"
                weight="semiBold"
                message="settings/metric"
                style={styles.rowText}
              />
              {this.state.unit === 'metric' && (
                <Icon name="settings_tick" style={styles.tick} />
              )}
            </TouchableOpacity>
          </View>

          <View>
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={() => this.selectUnit('imperial')}
            >
              <Text
                type="title"
                weight="semiBold"
                message="settings/imperial"
                style={styles.rowText}
              />
              {this.state.unit === 'imperial' && (
                <Icon name="settings_tick" style={styles.tick} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: theme.backgroundColor,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  rowText: {
    flex: 1,
    fontSize: theme.font.sizes.defaultPlus,
    color: '#757575',
  },
  settingsList: {
    backgroundColor: 'white',
    marginTop: 15,
    marginHorizontal: 15,
    borderRadius: 10,
  },
  tick: {
    fontSize: 20,
    color: theme.secondaryColor,
  },
})

export default connect(
  state => ({
    user: state.user,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        ...userActions,
      },
      dispatch
    ),
  })
)(UnitSettings)
