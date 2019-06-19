import React, { PureComponent } from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'

import Icon from '@components/Icon'
import Text from '@components/Text'
import { theme } from '@styles/theme'

class AddJournalHorseName extends PureComponent {
  render() {
    const { name, onPress, disabled = false, showLabel = true } = this.props

    const image = this.props.image
      ? { uri: this.props.image }
      : require('@images/horse_placeholder.png')

    return (
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        disabled={disabled}
      >
        <View style={styles.infoContainer}>
          <Image source={image} style={styles.image} resizeMode="cover" />

          <View style={styles.infoInnerContainer}>
            {name && (
              <Text
                type="title"
                weight="bold"
                style={[styles.horseName, disabled ? styles.disabled : {}]}
                text={name}
              />
            )}

            {!!showLabel && (
              <Text
                type="title"
                weight="bold"
                style={styles.selectHorseLabel}
                message="journal/selectHorse"
              />
            )}
          </View>
        </View>

        {!disabled ? <Icon name="arrow_right" style={styles.icon} /> : null}
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    backgroundColor: 'white',
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },
  infoInnerContainer: {
    flexDirection: 'column',
  },
  horseName: {
    marginLeft: 15,
    fontSize: theme.font.sizes.defaultPlus,
    color: '#1E8583',
  },
  selectHorseLabel: {
    marginLeft: 15,
    fontSize: 12,
    color: '#CCC',
  },
  icon: {
    fontSize: 18,
  },
  disabled: {
    color: 'gray',
  },
})

export default AddJournalHorseName
