import React, { PureComponent } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { poiLabels } from '@components/PoiIcons'
import Text from '@components/Text'
import { IconImage } from '../Icons'
import { theme } from '@styles/theme'

class MapPoi extends PureComponent {
  render() {
    const { reset, action, poi } = this.props

    return (
      <View style={styles.container}>
        <View style={styles.box}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <View>
              <Text
                weight="bold"
                style={styles.title}
                text={poiLabels[poi.kind]}
              />
            </View>
            <TouchableOpacity activeOpacity={0.8} onPress={reset}>
              <IconImage style={styles.closeIcon} source="plusIcon" />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
            <IconImage source={poi.kind} style={styles.poiIcon} svg />
            <View>
              <Text
                ellipsizeMode="tail"
                numberOfLines={3}
                style={{ width: 120 }}
                text={poi.description}
              />
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <TouchableOpacity activeOpacity={0.8} onPress={action}>
              <Text style={styles.buttonText} message={'poi/seeDetails'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    left: 0,
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    paddingVertical: 10,
    paddingHorizontal: theme.paddingHorizontal,
    width: 210,
    backgroundColor: 'white',
    marginBottom: 50,
    shadowColor: '#CCC',
    shadowOpacity: 0.7,
  },
  buttonText: {
    color: '#1E8583',
    fontSize: theme.font.sizes.smallest,
    marginTop: 10,
  },
  title: {
    color: '#1E8583',
  },
  poiIcon: {
    width: 45,
    height: 45,
    marginRight: 10,
    marginVertical: 5,
  },
  closeIcon: {
    width: 20,
    height: 20,
    transform: [{ rotate: '45deg' }],
  },
})

export default MapPoi
