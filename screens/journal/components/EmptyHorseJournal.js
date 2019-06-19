import React, { PureComponent } from 'react'
import { View, StyleSheet } from 'react-native'

import Text from '@components/Text'
import Avatar from '@components/Avatar'
import { theme } from '@styles/theme'

const AVATAR_SIZE = 140

class EmptyHorseJournal extends PureComponent {
  render() {
    const { horse, isArchived } = this.props
    return (
      <View style={styles.container}>
        <Avatar profile={horse} style={styles.image} />
        {!isArchived && (
          <Text
            message="journal/noHorseJournal"
            style={[styles.text, styles.title]}
            values={{
              horse: horse.name,
            }}
          />
        )}

        <Text
          message={
            !!isArchived
              ? 'journal/noHorseJournalArchieved'
              : 'journal/noHorseJournalInfo'
          }
          style={styles.text}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 50,
    backgroundColor: theme.backgroundColor,
  },
  image: {
    marginVertical: 20,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  text: {
    textAlign: 'center',
  },
  title: {
    fontSize: 17,
    color: 'black',
    marginBottom: 5,
  },
})

export default EmptyHorseJournal
