import React, { PureComponent } from 'react'
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

import t from '@config/i18n'
import AnimatedTextInput from '@components/AnimatedTextInput'
import Text from '@components/Text'
import { theme } from '@styles/theme'

const HORSE_IMAGE_SIZE = 80

class AddHorseDescription extends PureComponent {
  handleNotNow = () => this.props.jumpToNextStep()

  render() {
    const { name, description, onChange } = this.props

    const image = this.props.image
      ? { uri: this.props.image.uri }
      : require('@images/horse_placeholder.png')

    return (
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.horseImageContainer}>
            <Image source={image} style={styles.horseImage} />
          </View>

          <Text
            weight="semiBold"
            style={styles.text}
            message="horses/horseDescription"
            values={{ horseName: name }}
          />

          <AnimatedTextInput
            label={t('formLabels/horseDescription')}
            value={description}
            multiLine={true}
            containerStyle={styles.descriptionContainer}
            onChangeText={onChange('description')}
          />

          <TouchableOpacity
            style={styles.notNowButton}
            onPress={this.handleNotNow}
          >
            <Text
              type="title"
              weight="semiBold"
              style={styles.notNow}
              message="common/notNow"
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
  },
  horseImageContainer: {
    alignItems: 'center',
  },
  horseImage: {
    width: HORSE_IMAGE_SIZE,
    height: HORSE_IMAGE_SIZE,
    resizeMode: 'contain',
  },
  text: {
    textAlign: 'center',
    color: '#7E7E7E',
    fontSize: 16,
    marginTop: 15,
  },
  descriptionContainer: {
    marginTop: 30,
  },
  notNowButton: {
    backgroundColor: 'white',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    marginTop: 15,
    marginBottom: 20,
  },
  notNow: {
    fontSize: theme.font.sizes.defaultPlus,
    textAlign: 'center',
    color: '#7E7E7E',
  },
})

export default AddHorseDescription
