import React, { PureComponent } from 'react'
import { FlatList, StyleSheet, View, SafeAreaView } from 'react-native'
import idx from 'idx'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import debounce from 'lodash/debounce'
import { theme } from '@styles/theme'

import t from '@config/i18n'

import EmptyHorseJournal from './components/EmptyHorseJournal'
import Icon from '@components/Icon'
import Loading from '@components/Loading'
import JournalEntry from '@components/journal/JournalEntry'
import HorseNavigationBarTitle from '../horses/components/HorseNavigationBarTitle'
import AddButton from '@components/AddButton'
import ArchivedUserBar from '@screens/horses/components/ArchivedUserBar'
import BackButton from '@components/BackButton'
import * as horseActions from '@actions/horses'

class HorseJournal extends PureComponent {
  state = {
    horseId: null,
    refreshing: false,
    currentHorse: null,
    relationType: null,
    loading: true,
  }

  static navigationOptions = ({ navigation }) => ({
    headerTitle: (
      <HorseNavigationBarTitle
        title={t('journal/horseJournalTitle')}
        navigation={navigation}
      />
    ),
    tabBarIcon: ({ tintColor }) => <Icon name="horse" tintColor={tintColor} />,
    headerRight: idx(navigation, _ => _.state.params.showAddButton) !==
      undefined && (
      <AddButton onPress={navigation.state.params.handleAddJournalPost} />
    ),
    headerLeft: (
      <BackButton onPress={navigation.state.params.handleBackButton} />
    ),
  })

  static getDerivedStateFromProps(props, state) {
    const { horseId } = props.navigation.state.params

    if (
      horseId !== state.horseId &&
      props.horses.horse !== state.currentHorse
    ) {
      return {
        horseId,
        currentHorse: props.horses.horse,
        loading: false,
      }
    }

    // Return null to indicate no change to state.
    return null
  }

  componentDidMount() {
    const { props } = this
    const { horseId } = props.navigation.state.params
    const relationType = idx(this.props, _ => _.horses.horseUser.relation_type)

    this.props.navigation.setParams({
      handleBackButton: this.handleBackButton,
      showAddButton:
        relationType === 'owner' || relationType === 'sharer' ? true : false,
      // showAddButton: true,
      handleAddJournalPost: this.handleAddJournalPost,
    })

    if (!props.horses.horseUser) {
      props.actions.getHorseUser(horseId, props.user.user.id)
    }

    if (!props.horses.journal[horseId]) {
      props.actions.getHorseJournal(horseId)
    }
  }

  handleBackButton = () => this.props.navigation.popToTop()

  onRefresh = async () => {
    const { horseId } = this.props.navigation.state.params

    try {
      this.setState({ refreshing: true })
      await this.props.actions.getHorseJournal(horseId)
      this.setState({ refreshing: false })
    } catch (e) {
      // console.log(e)
    }
  }

  handleAddJournalPost = () => {
    const { navigation, horses, actions } = this.props
    const { horseId } = navigation.state.params
    const { horse } = horses.horses.filter(item => horseId === item.horse.id)[0]

    actions.setHorse(horse)
    navigation.navigate('AddJournalPostModal')
  }

  openDetails = (journalId, viaComment = false) => {
    const { horseId } = this.props.navigation.state.params

    this.props.navigation.navigate('JournalDetail', {
      journalId,
      horseId,
      viaComment,
      via: 'horse',
    })
  }

  render() {
    const { user } = this.props.user
    const { journal, horses } = this.props.horses
    const { horseId, refreshing, loading } = this.state
    const { fetching } = journal
    const journalItem = journal[horseId]
    const isArchived =
      horses && horses[0] && horses[0].relation_type === 'archived'

    if (!refreshing && (!!loading || !!fetching)) {
      return <Loading fullScreen type="spinner" />
    }

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          {isArchived && (
            <ArchivedUserBar
              navigation={this.props.navigation}
              horseUser={horses[0]}
            />
          )}
          {(!loading && !fetching && !journalItem) || !journalItem.length ? (
            <EmptyHorseJournal
              horse={horses[0].horse}
              isArchived={isArchived}
            />
          ) : (
            <FlatList
              style={styles.container}
              refreshing={refreshing}
              onRefresh={this.onRefresh}
              data={journalItem}
              keyExtractor={({ subject }) => subject.journal_entry.id}
              renderItem={({ item }) => (
                <JournalEntry
                  navigate={this.props.navigation.navigate}
                  entry={item}
                  isHorseJournal
                  horseId={horseId}
                  horse={horses[0].horse}
                  userId={user.id}
                  onPress={debounce(
                    () => this.openDetails(item.subject.journal_entry.id),
                    2000,
                    {
                      leading: true,
                    }
                  )}
                  onCommentPress={() =>
                    this.openDetails(item.subject.journal_entry.id, true)
                  }
                />
              )}
            />
          )}
        </View>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.backgroundColor,
  },
})

export default connect(
  state => ({
    auth: state.auth,
    user: state.user,
    horses: state.horses,
  }),
  dispatch => ({ actions: bindActionCreators({ ...horseActions }, dispatch) })
)(HorseJournal)
