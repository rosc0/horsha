import React, { PureComponent } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as horsesActions from '@actions/horses'
import HorseChooseRow from './components/HorseChooseRow'
import Loading from '@components/Loading'
import HeaderTitle from '@components/HeaderTitle'
import Icon from '@components/Icon'
import Text from '@components/Text'

import Horses from '@api/horses'

const HorseAPI = new Horses()

class HorseChoose extends PureComponent {
  static navigationOptions = {
    headerTitle: <HeaderTitle title={'horses/chooseHorseTitle'} />,
    tabBarVisible: false,
    tabBarIcon: ({ tintColor }) => <Icon name="horse" tintColor={tintColor} />,
  }

  state = {
    horses: [],
    cursor: null,
    remaining: 0,
    fetching: true,
  }

  async componentDidMount() {
    const { user } = this.props.user

    const horses = await HorseAPI.getHorsesByUser(user.id, ['owner', 'sharer'])

    this.setState({
      horses: horses.collection,
      horse: horses.collection[0].horse, // if user has no horses?
      cursor: horses.cursor,
      remaining: horses.remaining,
      fetching: false,
    })
  }

  handleChooseHorse = async horseUser => {
    const nextRoute =
      this.props.navigation.state.params &&
      this.props.navigation.state.params.nextRoute

    if (horseUser.horse !== this.state.horse) {
      this.props.actions.setHorse(horseUser.horse)
      this.props.actions.setLastAccessedHorse(horseUser.id)
    }

    if (!nextRoute) {
      return this.props.navigation.goBack(null)
    }

    return this.props.navigation.navigate(nextRoute)
  }

  renderHeader = () => (
    <Text
      type="title"
      weight="semiBold"
      style={styles.title}
      message="horses/horsesTitleCount"
      values={{ count: this.state.horses.length + this.state.remaining }}
    />
  )

  renderItem = ({ item }) => (
    <HorseChooseRow
      {...item.horse}
      // relationType={item.relation_type}
      onPress={() => this.handleChooseHorse(item)}
    />
  )

  getMoreHorses = async () => {
    const { cursor, remaining } = this.state

    if (remaining !== 0) {
      const { user } = this.props.user

      this.setState({ fetching: true })

      const horses = await HorseAPI.getHorsesByUser(
        user.id,
        ['owner', 'sharer'],
        cursor
      )

      this.setState({
        horses: this.state.horses.concat(horses.collection),
        cursor: horses.cursor,
        remaining: horses.remaining,
        fetching: false,
      })
    }
  }

  render() {
    const { fetching, horses } = this.state

    if (fetching) {
      return <Loading type="spinner" />
    }

    return (
      <FlatList
        data={horses}
        ListHeaderComponent={this.renderHeader}
        ListFooterComponent={() => <View style={styles.empty} />}
        renderItem={this.renderItem}
        onEndReachedThreshold={2}
        onEndReached={this.getMoreHorses}
        extraData={this.state}
        removeClippedSubviews={false}
        keyExtractor={item => item.id}
        style={styles.container}
      />
    )
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 15,
    backgroundColor: 'white',
    flex: 1,
  },
  title: {
    fontSize: 20,
    paddingHorizontal: 10,
  },
  empty: {
    height: 30,
    width: '100%',
  },
})

const mapStateToProps = ({ horses, user }) => ({
  horses,
  user,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(horsesActions, dispatch),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HorseChoose)
