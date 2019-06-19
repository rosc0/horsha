import React, { PureComponent } from 'react'
import { Keyboard } from 'react-native'
import { createBottomTabNavigator } from 'react-navigation-tabs'

class CustomTabBarComponent extends PureComponent {
  state = {
    isVisible: true,
  }

  componentDidMount() {
    this.keyboardWillShowSub = Keyboard.addListener(
      'keyboardDidShow',
      this.keyboardWillShow
    )
    this.keyboardWillHideSub = Keyboard.addListener(
      'keyboardDidHide',
      this.keyboardWillHide
    )
  }

  componentWillUnmount() {
    this.keyboardWillShowSub.remove()
    this.keyboardWillHideSub.remove()
  }

  keyboardWillShow = () => this.setState({ isVisible: false })
  keyboardWillHide = () => this.setState({ isVisible: true })

  render() {
    return this.state.isVisible && <createBottomTabNavigator {...this.props} />
  }
}

export default CustomTabBarComponent
