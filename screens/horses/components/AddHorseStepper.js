import React, { Component } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import Text from '@components/Text'

class AddHorseStepper extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.isNextStepValid !== nextProps.isNextStepValid
  }

  handleNextStep = () => {
    const {
      currentStep,
      stepsCount,
      onPressNextStep,
      handleCreateHorse,
    } = this.props

    if (currentStep === stepsCount - 1) {
      return handleCreateHorse()
    }

    return onPressNextStep()
  }

  render() {
    const {
      stepsCount,
      currentStep,
      onPressPrevStep,
      isNextStepValid,
    } = this.props

    const isNextButtonDisabled = !isNextStepValid

    return (
      <View style={styles.container}>
        {currentStep > 0 ? (
          <TouchableOpacity style={styles.button} onPress={onPressPrevStep}>
            <Text
              type="title"
              weight="bold"
              style={styles.buttonLabel}
              message="common/previous"
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.button} />
        )}

        <View style={styles.stepsContainer}>
          {Array.apply(null, Array(stepsCount)).map((item, i) => (
            <View
              key={`stepper-${i}`}
              style={[styles.step, currentStep === i && styles.stepActive]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, styles.rightButton]}
          disabled={isNextButtonDisabled}
          onPress={this.handleNextStep}
        >
          <Text
            type="title"
            weight="bold"
            style={[
              styles.buttonLabel,
              isNextButtonDisabled && styles.disabledButton,
            ]}
            message={
              currentStep === stepsCount - 1 ? 'horses/create' : 'common/next'
            }
          />
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    padding: 20,
  },
  rightButton: {
    alignItems: 'flex-end',
  },
  buttonLabel: {
    fontSize: 16,
    color: '#1E8583',
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  step: {
    width: 7,
    height: 7,
    backgroundColor: '#D1D1D1',
    margin: 3,
    borderRadius: 3.5,
  },
  stepActive: {
    width: 10,
    height: 10,
    backgroundColor: '#1E8583',
    borderRadius: 5,
  },
  disabledButton: {
    color: '#CCC',
  },
})

export default AddHorseStepper
