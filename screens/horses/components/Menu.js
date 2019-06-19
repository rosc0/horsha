import React, { PureComponent } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import Text from '@components/Text'
import MenuItem from '@components/MenuItem'

class Menu extends PureComponent {
  render() {
    const { horse, goToRoute } = this.props

    const journalText = 'horses/journal'
    const ridesText = 'horses/rides'
    const albumText = 'horses/album'
    const profileText = 'horses/profile'
    const horseTeamText = 'horses/horseTeam'
    const statsText = 'horses/stats'

    return (
      <ScrollView>
        <View style={styles.horseNameContainer}>
          <Text
            type="title"
            weight="bold"
            style={styles.horseName}
            text={horse.name}
          />
        </View>

        <MenuItem
          icon="journal"
          title={journalText}
          onPress={goToRoute('HorseJournal', {
            horseId: horse.id,
          })}
        />

        <MenuItem
          icon="rides"
          title={ridesText}
          onPress={goToRoute('HorseRides', {
            horseId: horse.id,
          })}
        />

        <MenuItem
          icon="add_photo"
          title={albumText}
          onPress={goToRoute('HorseAlbum', {
            horseId: horse.id,
          })}
        />

        <MenuItem
          icon="horse"
          title={profileText}
          onPress={goToRoute('Profile', {
            horseId: horse.id,
          })}
        />

        <MenuItem
          icon="horse_team"
          title={horseTeamText}
          onPress={goToRoute('HorseTeam', {
            horseId: horse.id,
          })}
        />

        <MenuItem
          icon="stats"
          title={statsText}
          onPress={goToRoute('HorseStats', {
            horseId: horse.id,
          })}
        />
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  horseNameContainer: {
    paddingBottom: 10,
    paddingTop: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#DDDCE0',
    backgroundColor: 'white',
  },
  horseName: {
    fontSize: 17,
    color: '#595959',
    marginLeft: 15,
  },
})

export default Menu
