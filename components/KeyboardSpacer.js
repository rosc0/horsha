import React, { PureComponent } from 'react'
import { Platform } from 'react-native'
import KeyboardSpacerCP from 'react-native-keyboard-spacer'

export default class KeyboardSpacer extends PureComponent {
  render = () => Platform.OS === 'ios' && <KeyboardSpacerCP />
}
