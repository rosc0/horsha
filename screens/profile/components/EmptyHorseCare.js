import React, { PureComponent } from 'react'
import { Image, ScrollView, StyleSheet, View } from 'react-native'

import Text from '@components/Text'
import Button from '@components/Button'
import { IconImage } from '@components/Icons'

class EmptyHorseCare extends PureComponent {
  render() {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <IconImage source="horseCareInfoIcon" style={styles.image} />

        <Text
          message="horseProfile/noHorseCare"
          style={[styles.text, styles.noHorseCareText]}
        />

        {this.props.relationType === 'owner' && (
          <View>
            <Text message="horseProfile/noHorseCareInfo" style={styles.text} />
            <Button
              style={styles.button}
              onPress={this.props.showCare}
              label="horses/addInfo"
            />
          </View>
        )}
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
    width: 170,
    height: 120,
    resizeMode: 'contain',
  },
  text: {
    textAlign: 'center',
  },
  noHorseCareText: {
    fontSize: 17,
    color: 'black',
    marginBottom: 5,
  },
  button: {
    width: 120,
    marginTop: 40,
  },
})

export default EmptyHorseCare
