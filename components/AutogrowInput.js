import React, { Component } from 'react'
import AutogrowInput from 'react-native-autogrow-input'

class AutogrowTextInput extends Component {
  static defaultProps = {
    defaultHeight: 80,
  }

  focus = () => this.input.focus()
  blur = () => this.input.blur()

  render() {
    return (
      <AutogrowInput
        ref={ref => (this.input = ref)}
        defaultHeight={35}
        underlineColorAndroid="transparent"
        {...this.props}
      />
    )
  }
}

export default AutogrowTextInput
