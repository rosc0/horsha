import React, { PureComponent } from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'

import t from '@config/i18n'
import DateField from '@components/DateField'
import Text from '@components/Text'
import AnimatedTextInput from '@components/AnimatedTextInput'
import {
  calculateHorseHeight,
  calculateHorseWeight,
  convertForSaveHorseHeight,
  convertForSaveHorseWeight,
} from '@application/utils'
import { theme } from '@styles/theme'

class AddHorseInfo extends PureComponent {
  state = {
    invalidHeight: false,
    invalidWeight: false,
  }

  handleNotNow = () => this.props.jumpToNextStep(true)

  userHeightUnit = () => {
    let unit = 'cm'

    if (this.props.user.account.preferences.heightUnit === 'inches') {
      unit = '"'
    } else if (this.props.user.account.preferences.heightUnit === 'hands') {
      unit = 'hh'
    }

    return unit
  }

  userWeightUnit = () => {
    let unit = 'kg'

    if (this.props.user.account.preferences.unitSystem === 'IMPERIAL') {
      unit = 'lb'
    }

    return unit
  }

  checkHeight = height => {
    const { minHeight, maxHeight } = this.props
    const convertedHeight = convertForSaveHorseHeight(
      height,
      this.props.user.account.preferences.heightUnit
    )

    this.setState({ invalidHeight: false })

    if (
      height &&
      (convertedHeight < minHeight || convertedHeight > maxHeight)
    ) {
      this.setState({ invalidHeight: true })
    }

    this.props.handleChangeMetrics('height', height)
  }

  checkWeight = weight => {
    const { minWeight, maxWeight } = this.props
    const convertedWeight = convertForSaveHorseWeight(
      weight,
      this.props.user.account.preferences.unitSystem
    )

    this.setState({ invalidWeight: false })

    if (
      weight &&
      (convertedWeight < minWeight || convertedWeight > maxWeight)
    ) {
      this.setState({ invalidWeight: true })
    }

    this.props.handleChangeMetrics('weight', weight)
  }

  render() {
    const {
      color,
      birthday,
      today,
      breed,
      height,
      weight,
      onChange,
      minHeight,
      maxHeight,
      minWeight,
      maxWeight,
    } = this.props

    const { invalidHeight, invalidWeight } = this.state

    const heightUnit = this.props.user.account.preferences.heightUnit
    const unitSystem = this.props.user.account.preferences.unitSystem

    return (
      <ScrollView>
        <DateField
          label={t('formLabels/birthday')}
          value={birthday}
          today={today}
          onDateChange={onChange('birthday')}
          containerStyle={styles.datepickerContainer}
        />
        <AnimatedTextInput
          label={t('formLabels/color')}
          value={color}
          onChangeText={onChange('color')}
        />
        <AnimatedTextInput
          label={t('formLabels/breed')}
          value={breed}
          onChangeText={onChange('breed')}
        />
        <AnimatedTextInput
          label={t('formLabels/height', { unit: this.userHeightUnit() })}
          value={height}
          onChangeText={this.checkHeight}
          errorMessage={
            invalidHeight
              ? t('horses/invalidError', {
                  lowLimit: calculateHorseHeight(minHeight, heightUnit, true),
                  highLimit: calculateHorseHeight(maxHeight, heightUnit, true),
                })
              : null
          }
        />
        <AnimatedTextInput
          label={t('formLabels/weight', { unit: this.userWeightUnit() })}
          value={weight}
          onChangeText={this.checkWeight}
          errorMessage={
            invalidWeight
              ? t('horses/invalidError', {
                  lowLimit: calculateHorseWeight(minWeight, unitSystem, true),
                  highLimit: calculateHorseWeight(maxWeight, unitSystem, true),
                })
              : null
          }
        />
        <TouchableOpacity
          activeOpacity={0.7}
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
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  notNowButton: {
    backgroundColor: 'white',
    padding: 12,
    marginTop: 30,
    marginBottom: 20,
  },
  notNow: {
    fontSize: theme.font.sizes.defaultPlus,
    textAlign: 'center',
    color: '#7E7E7E',
  },
  datepickerContainer: {
    marginTop: 25,
  },
})

const mapStateToProps = ({ user }) => ({
  user: user.user,
})

export default connect(mapStateToProps)(AddHorseInfo)
