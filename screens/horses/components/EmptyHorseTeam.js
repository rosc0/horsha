import React, { PureComponent } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { IconImage } from '@components/Icons'

import Text from '@components/Text'

class EmptyHorseTeam extends PureComponent {
  render() {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <IconImage source="horseTeam" style={styles.image} />

        <Text
          message="horses/noHorseTeam"
          style={[styles.text, styles.noHorseTeamText]}
        />

        <Text message="horses/noHorseTeamInfo" style={styles.text} />
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 50,
  },
  image: {
    tintColor: '#BCBCBC',
    marginVertical: 20,
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  text: {
    textAlign: 'center',
  },
  noHorseTeamText: {
    fontSize: 17,
    color: 'black',
    marginBottom: 5,
  },
})

export default EmptyHorseTeam
