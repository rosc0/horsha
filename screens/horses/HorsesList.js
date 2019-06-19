import React, { PureComponent } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import Horse from './components/Horse'
import Menu from './components/Menu'
import EmptyHorseList from './components/EmptyHorseList'
import AddButton from '@components/AddButton'
import HeaderTitle from '@components/HeaderTitle'
import NotificationsHeader from '@components/NotificationsHeader'
import { theme } from '@styles/theme'

import * as horsesActions from '@actions/horses'

class HorsesList extends PureComponent {
  state = {
    selectedHorse: null,
  }

  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: <HeaderTitle title={'horses/horses'} />,
      headerRight: (
        <View style={styles.header}>
          <AddButton
            imageStyle={styles.addButton}
            onPress={() => navigation.navigate('AddHorse')}
          />
          <NotificationsHeader fromRoute="Horses" navigation={navigation} />
        </View>
      ),
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.horses.horse && !state.selectedHorse) {
      return {
        selectedHorse: props.horses.horse,
      }
    }

    // Return null to indicate no change to state.
    return null
  }

  componentDidMount() {
    this.props.actions.getHorses()
  }

  getMoreHorses = () => {
    const { cursor, horsesRemaining } = this.props.horses

    if (horsesRemaining !== 0) {
      this.props.actions.getMoreHorses(cursor)
    }
  }

  handleGoToRoute = (route, params) => () =>
    this.props.navigation.navigate(route, params)

  handleSelectHorse = async horseUser => {
    if (horseUser.horse === this.state.selectedHorse) return

    if (this.props.horses.horses.length) {
      this.horseListRef.scrollToOffset({ x: 0, animated: true })
    }

    this.props.actions.setLastAccessedHorse(horseUser.id)

    this.setState({ selectedHorse: horseUser.horse })
  }

  render() {
    const { selectedHorse } = this.state
    const { horses } = this.props.horses

    return (
      <View style={styles.container}>
        {this.props.horses.horses.length === 0 ? (
          <EmptyHorseList />
        ) : (
          <React.Fragment>
            <View>
              <FlatList
                ref={ref => (this.horseListRef = ref)}
                style={styles.horsesContainer}
                data={horses}
                horizontal={true}
                keyExtractor={horse => horse.id}
                onEndReachedThreshold={2}
                onEndReached={this.getMoreHorses}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item, index }) => (
                  <Horse
                    horse={item.horse}
                    archived={item.relation_type === 'archived'}
                    selectedHorse={index === 0}
                    onSelectHorse={() => this.handleSelectHorse(item)}
                  />
                )}
              />
            </View>

            {selectedHorse && (
              <View style={styles.selectedHorseContainer}>
                <Menu
                  horse={this.props.horses.horse}
                  goToRoute={this.handleGoToRoute}
                />
              </View>
            )}
          </React.Fragment>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.backgroundColor,
    flex: 1,
  },
  horsesContainer: {
    paddingTop: 5,
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  selectedHorseContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  addButton: {
    marginRight: 10,
  },
})

export default connect(
  ({ horses }) => ({
    horses,
  }),
  dispatch => ({
    actions: bindActionCreators(horsesActions, dispatch),
  })
)(HorsesList)
