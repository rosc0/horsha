import React, { PureComponent } from 'react'
import { ScrollView, StyleSheet } from 'react-native'

import Text from '@components/Text'
import { IconImage } from '@components/Icons'
import { theme } from '@styles/theme'

class EmptyRide extends PureComponent {
  render() {
    const { isArchived } = this.props
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <IconImage source="rides" style={styles.image} />

        {!isArchived && (
          <Text
            message="horseRides/noRides"
            style={[styles.text, styles.noRidesText]}
          />
        )}

        <Text
          message={
            !!isArchived
              ? 'horseRides/noRidesInfoArchieved'
              : 'horseRides/noRidesInfo'
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
    tintColor: '#BCBCBC',
    marginVertical: 20,
  },
  text: {
    textAlign: 'center',
  },
  noRidesText: {
    fontSize: 17,
    color: 'black',
    marginBottom: 5,
  },
})

export default EmptyRide
