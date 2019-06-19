import React, { PureComponent } from 'react'
import { StyleSheet, ScrollView } from 'react-native'

import t from '@config/i18n'
import { HORSE_GENDERS } from '@reducers/horses'
import SelectField from '@components/SelectField'
import AnimatedTextInput from '@components/AnimatedTextInput'

class AddHorseName extends PureComponent {
  render() {
    const {
      name,
      gender,
      onChangeName,
      onChange,
      errorMessage,
      onChangeGender,
    } = this.props

    const genders = Object.values(HORSE_GENDERS).map(gender => ({
      label: gender.charAt(0).toUpperCase() + gender.slice(1),
      value: gender,
    }))

    return (
      <ScrollView style={styles.container}>
        <AnimatedTextInput
          label={t('formLabels/name')}
          value={name}
          onChangeText={name => onChangeName(name)}
          errorMessage={errorMessage}
        />

        <SelectField
          label={t('formLabels/gender')}
          options={genders}
          value={gender}
          containerStyle={styles.selectContainer}
          onSelect={gender => onChangeGender(gender)}
        />
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  selectContainer: {
    marginTop: 15,
  },
})

export default AddHorseName
