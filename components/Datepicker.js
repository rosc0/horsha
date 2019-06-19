import React, { PureComponent } from 'react'
import { Alert, DatePickerAndroid, DatePickerIOS, Platform } from 'react-native'

import Modal from './Modal'

const renderAndroid = async ({ date }, { onClose, onDateChange }) => {
  try {
    const { action, year, month, day } = await DatePickerAndroid.open({
      date,
      maxDate: new Date(),
    })
    if (action !== DatePickerAndroid.dismissedAction) {
      onClose()
      onDateChange(new Date(year, month, day))
    }
  } catch ({ code, message }) {
    Alert.alert('Errr', 'There was an error while trying to set date.')
  }
}

class Datepicker extends PureComponent {
  render() {
    const {
      visible,
      onClose,
      onDateChange,
      mode = 'date',
      ...props
    } = this.props

    if (Platform.OS === 'android' && visible) {
      renderAndroid(props, { onClose, onDateChange })
      return null
    }

    return (
      <Modal visible={visible} onClose={onClose} onRequestClose={() => {}}>
        {Platform.OS === 'ios' ? (
          <DatePickerIOS
            maximumDate={new Date()}
            mode={mode}
            onDateChange={onDateChange}
            {...props}
          />
        ) : null}
      </Modal>
    )
  }
}

export default Datepicker
