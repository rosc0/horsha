import React, { PureComponent } from 'react'
import { ScrollView, StyleSheet } from 'react-native'

import Text from '@components/Text'
import { IconImage } from '@components/Icons'

class EmptyHorseAlbum extends PureComponent {
  render() {
    const { isArchived } = this.props

    return (
      <ScrollView contentContainerStyle={styles.container}>
        <IconImage source="heartCircle" style={styles.image} />

        {!isArchived && (
          <Text
            message="horses/noHorseAlbum"
            style={[styles.text, styles.noHorseAlbumText]}
          />
        )}

        <Text
          message={
            !!isArchived
              ? 'horses/noHorseAlbumInfoArchived'
              : 'horses/noHorseAlbumInfo'
          }
          style={styles.text}
        />
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
    marginVertical: 20,
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  text: {
    textAlign: 'center',
  },
  noHorseAlbumText: {
    fontSize: 17,
    color: 'black',
    marginBottom: 5,
  },
})

export default EmptyHorseAlbum
