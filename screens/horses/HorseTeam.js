import React, { PureComponent } from 'react'
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as horsesActions from '@actions/horses'
import t from '@config/i18n'
import HorseNavigationBarTitle from './components/HorseNavigationBarTitle'
import HorseTeamRow from './components/HorseTeamRow'
import EmptyHorseTeam from './components/EmptyHorseTeam'
import Icon from '@components/Icon'
import Loading from '@components/Loading'
import AddButton from '@components/AddButton'
import Text from '@components/Text'
import ArchivedUserBar from './components/ArchivedUserBar'
import BackButton from '@components/BackButton'
import { theme } from '@styles/theme'

class HorseTeam extends PureComponent {
  state = {
    showActionBarOnId: null,
  }

  static navigationOptions = ({ navigation }) => ({
    headerTitle: (
      <HorseNavigationBarTitle
        title={t('horses/horseTeam')}
        navigation={navigation}
      />
    ),
    tabBarIcon: ({ tintColor }) => <Icon name="horse" tintColor={tintColor} />,
    headerLeft: (
      <BackButton onPress={navigation.state.params.handleBackButton} />
    ),
    headerRight: navigation.state.params &&
      navigation.state.params.isCurrentUserOwner && (
        <AddButton onPress={() => navigation.state.params.handleSave()} />
      ),
    tabBarVisible: false,
  })

  handleBackButton = () => this.props.navigation.popToTop()

  async componentDidMount() {
    await this.getHorseTeam()

    const { owners } = this.props.horses.team

    const isCurrentUserOwner =
      owners.length && owners.findIndex(key => key === this.props.userId) !== -1

    this.props.navigation.setParams({
      isCurrentUserOwner,
      handleBackButton: this.handleBackButton,
      shouldAllowBackGesture: true,
    })
  }

  getHorseTeam = () => {
    this.props.navigation.setParams({
      handleSave: this.goToAddHorseTeam,
    })

    return this.props.actions.getHorseUser(
      this.props.navigation.state.params.horseId
    )
  }

  handleShowHorseActionBar = id =>
    this.setState(prevState => ({
      showActionBarOnId: prevState.showActionBarOnId !== id && id,
    }))

  renderHeader = () => {
    const { horses } = this.props
    const isArchived =
      horses.horses &&
      horses.horses[0] &&
      horses.horses[0].relation_type === 'archived'
    return (
      <View>
        {isArchived && (
          <ArchivedUserBar
            navigation={this.props.navigation}
            horseUser={horses.horses[0]}
          />
        )}
        <Text
          type="title"
          weight="semiBold"
          style={styles.title}
          message="horses/horseTeamCount"
          values={{ count: this.props.horses.team.users.length || '' }}
        />
      </View>
    )
  }

  renderItem = ({ item }) => {
    const { showActionBarOnId } = this.state
    const { owners } = this.props.horses.team

    const isCurrentUserOwner =
      owners.length && owners.findIndex(key => key === this.props.userId) !== -1
        ? true
        : false

    return (
      <HorseTeamRow
        {...item}
        navigation={this.props.navigation}
        horseId={this.props.navigation.state.params.horseId}
        onPress={this.handleShowHorseActionBar}
        shouldShowActionBar={showActionBarOnId === item.horseUserId}
        isCurrentUser={this.props.userId === item.key}
        isCurrentUserOwner={isCurrentUserOwner}
        getHorseTeam={this.getHorseTeam}
      />
    )
  }

  goToAddHorseTeam = () =>
    this.props.navigation.navigate('AddHorseTeam', {
      horseId: this.props.navigation.state.params.horseId,
    })

  renderFooter = () => {
    const { owners } = this.props.horses.team

    const isCurrentUserOwner =
      owners.length && owners.findIndex(key => key === this.props.userId) !== -1
        ? true
        : false

    return (
      <View style={styles.buttonContainer}>
        {isCurrentUserOwner && (
          <TouchableOpacity
            onPress={this.goToAddHorseTeam}
            style={styles.button}
          >
            <Text
              type="title"
              weight="bold"
              style={styles.buttonText}
              message="horses/addFriendToTeam"
            />
          </TouchableOpacity>
        )}
      </View>
    )
  }

  render() {
    const { horses } = this.props

    if (horses.fetching || horses.team.fetching) {
      return <Loading type="spinner" />
    }

    return (
      <FlatList
        data={horses.team.users}
        ListHeaderComponent={this.renderHeader}
        renderItem={this.renderItem}
        ListFooterComponent={this.renderFooter}
        ListEmptyComponent={<EmptyHorseTeam />}
        extraData={this.state}
        removeClippedSubviews={false}
        style={styles.container}
      />
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  title: {
    fontSize: 20,
    paddingLeft: 10,
    marginTop: 15,
  },
  buttonContainer: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    marginTop: 10,
    paddingTop: 25,
    paddingBottom: 25,
    alignItems: 'center',
  },
  button: {
    borderWidth: 1,
    borderColor: '#1f8583',
    borderRadius: 5,
    padding: 10,
  },
  buttonText: {
    color: '#1f8583',
    fontSize: theme.font.sizes.smallest,
    backgroundColor: 'transparent',
    textAlign: 'center',
  },
})

const mapStateToProps = ({ horses, user }) => ({
  horses,
  userId: user.user.id,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(horsesActions, dispatch),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HorseTeam)
