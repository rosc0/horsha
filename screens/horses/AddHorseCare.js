import React, { PureComponent } from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'

import t from '@config/i18n'
import AnimatedTextInput from '@components/AnimatedTextInput'
import Text from '@components/Text'
import { renderName } from '@utils'
import { theme } from '@styles/theme'

class AddHorseCare extends PureComponent {
  handleNotNow = () => this.props.jumpToNextStep()

  render() {
    const { name, horseCare, onChange, onSave } = this.props

    return (
      <ScrollView>
        <View style={styles.container}>
          <Text
            style={styles.question}
            type="title"
            weight="semiBold"
            message="horses/horseCareQuestion"
            values={{ horseName: renderName(name) }}
          />

          <Text
            weight="semiBold"
            type="title"
            style={styles.example}
            message="horses/horseCareExample"
          />

          <AnimatedTextInput
            label={t('formLabels/horseCare')}
            value={horseCare}
            multiLine={true}
            containerStyle={styles.horseCareContainer}
            onChangeText={onChange('horseCare')}
          />

          <Text
            message="horses/horseCareNotice"
            type="title"
            weight="semiBold"
            style={styles.notice}
          />
          {!!onSave ? (
            <TouchableOpacity style={styles.notNowButton} onPress={onSave}>
              <Text
                type="title"
                weight="semiBold"
                style={styles.notNow}
                message="common/notNow"
              />
            </TouchableOpacity>
          ) : (
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
          )}
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
  },
  question: {
    textAlign: 'center',
    color: '#7E7E7E',
    fontSize: 16,
    marginTop: 15,
  },
  example: {
    textAlign: 'center',
    color: '#7E7E7E',
    fontSize: theme.font.sizes.smallVariation,
    paddingHorizontal: theme.paddingHorizontal,
  },
  notice: {
    color: '#B6B6B7',
    fontSize: theme.font.sizes.smallVariation,
    paddingHorizontal: 10,
    marginTop: 3,
  },
  horseCareContainer: {
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

export default AddHorseCare
