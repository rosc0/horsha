import React, { PureComponent } from 'react'
import { View, StyleSheet } from 'react-native'

import Text from '@components/Text'
import { IconImage } from '@components/Icons'

class EmptyHorseList extends PureComponent {
  render() {
    return (
      <View style={styles.container}>
        <IconImage source="horseCircle" style={styles.image} />

        <Text
          message="horses/noHorse"
          style={[styles.text, styles.noHorseText]}
        />

        <Text message="horses/noHorseInfo" style={styles.text} />
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
  },
  image: {
    tintColor: '#BCBCBC',
    marginVertical: 20,
  },
  text: {
    textAlign: 'center',
  },
  noHorseText: {
    fontSize: 17,
    color: 'black',
    marginBottom: 5,
  },
})

export default EmptyHorseList
