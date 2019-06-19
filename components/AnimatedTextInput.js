import React, { Component } from 'react'
import {
  View,
  TextInput,
  Animated,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Text as TextPropTypes,
  ViewPropTypes,
} from 'react-native'
import AutogrowInput from 'react-native-autogrow-input'
import PropTypes from 'prop-types'

import Text from '@components/Text'
import { IconImage } from '@components/Icons'
import { theme } from '@styles/theme'

import {
  INPUT_TEXT_SIZE,
  LABEL_TEXT_SIZE,
  INPUT_HEIGHT,
  MULTILINE_MARGIN,
} from '@constants/inputStyle'

class AnimatedTextInput extends Component {
  static propTypes = {
    label: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    marginTop: PropTypes.number,
    inputContainerStyle: ViewPropTypes.style,
    inputStyle: TextPropTypes.propTypes.style,
    errorBorderColor: PropTypes.string,
    errorTextColor: PropTypes.string,
    placeholderTextColor: PropTypes.string,
    labelTextColor: PropTypes.string,
    multiLine: PropTypes.bool,
    defaultMultiLineHeight: PropTypes.number,
    errorMessage: PropTypes.string,
    isPassword: PropTypes.bool,
  }

  static defaultProps = {
    value: '',
    marginTop: null,
    inputContainerStyle: null,
    inputStyle: null,
    errorBorderColor: theme.mainColor,
    errorTextColor: theme.mainColor,
    placeholderTextColor: theme.fontColorLight,
    labelTextColor: theme.fontColor,
    multiLine: false,
    defaultMultiLineHeight: INPUT_HEIGHT,
    errorMessage: null,
    isPassword: false,
  }

  state = {
    isFocused: false,
    errorMessage: null,
    hidePass: false,
    showLabel: false,
  }

  constructor(props) {
    super(props)

    this.hasValue = props.value.length > 0
    this.animatedIsFocused = new Animated.Value(this.hasValue ? 1 : 0)
  }

  static getDerivedStateFromProps(props, state) {
    if (props.errorMessage !== state.errorMessage) {
      return {
        errorMessage: props.errorMessage || null,
      }
    }

    return null
  }

  componentDidMount = () => {
    const { isPassword, placeholder } = this.props

    if (isPassword) {
      this.setState({ hidePass: isPassword })
    }

    if (!placeholder) {
      this.setState({ showLabel: true })
    }
  }

  componentDidUpdate() {
    const { value, placeholder } = this.props

    if (!placeholder) {
      const hasValue = value.length > 0
      Animated.timing(this.animatedIsFocused, {
        toValue: this.state.isFocused || hasValue ? 1 : 0,
        duration: 150,
      }).start()
    }
  }

  focus = () => this.inputRef.focus()

  blur = () => this.inputRef.blur()

  handleFocus = () => {
    this.setState({ isFocused: true })
    if (this.props.onFocus) {
      this.props.onFocus()
    }
  }

  handleBlur = () => {
    // set the animation to not saelected
    this.setState({ isFocused: false })
    // tell parent form its touched
    if (this.props.onTouch) {
      this.props.onTouch(this.props.name)
    }
    // other on blur
    if (this.props.onBlur) {
      this.props.onBlur()
    }
  }

  togglePassword = () => {
    this.setState(({ hidePass }) => ({
      hidePass: !hidePass,
    }))
  }

  handleChange = value => {
    if (this.props.onChange) {
      this.props.onChange(this.props.name, value)
    } else if (this.props.onChangeText) {
      this.props.onChangeText(value)
    }
  }

  render() {
    const {
      label,
      multiLine,
      defaultMultiLineHeight,
      marginTop,
      inputContainerStyle,
      errorBorderColor,
      errorTextColor,
      placeholderTextColor,
      labelTextColor,
      inputStyle,
      isPassword,
      numerical = false,
      ...props
    } = this.props

    const { errorMessage, hidePass, showLabel } = this.state

    const hasError = errorMessage && errorMessage.length > 0

    const labelStyle = showLabel
      ? {
          top: this.animatedIsFocused.interpolate({
            inputRange: [0, 1],
            outputRange: [33, -5],
          }),
          fontSize: this.animatedIsFocused.interpolate({
            inputRange: [0, 1],
            outputRange: [INPUT_TEXT_SIZE, LABEL_TEXT_SIZE],
          }),
          color: this.animatedIsFocused.interpolate({
            inputRange: [0, 1],
            outputRange: [placeholderTextColor, labelTextColor],
          }),
        }
      : null

    const errorBorder = hasError
      ? {
          borderBottomColor: errorBorderColor,
        }
      : null

    const errorText = {
      color: errorTextColor,
    }
    const multiLineHeight = defaultMultiLineHeight - MULTILINE_MARGIN * 2
    const marginTopStyle = marginTop ? { marginTop } : null

    return (
      <View style={[styles.margin, marginTopStyle]}>
        <View style={showLabel ? styles.labelPaddingTop : null}>
          {showLabel && (
            <TouchableWithoutFeedback onPress={() => this.inputRef.focus()}>
              <Animated.Text style={[styles.label, labelStyle]}>
                {label.toUpperCase()}
              </Animated.Text>
            </TouchableWithoutFeedback>
          )}

          <View
            style={[styles.inputContainer, inputContainerStyle, errorBorder]}
          >
            {isPassword && (
              <TouchableOpacity
                style={styles.togglePassword}
                onPress={() => this.togglePassword()}
              >
                <IconImage
                  source={hidePass ? 'passwordHidden' : 'password'}
                  style={styles.passwordIcon}
                />
              </TouchableOpacity>
            )}
            {multiLine ? (
              <AutogrowInput
                style={[
                  styles.textInput,
                  styles.textGrow,
                  showLabel ? styles.multiLineMargin : null,
                  inputStyle,
                ]}
                defaultHeight={defaultMultiLineHeight}
                underlineColorAndroid="transparent"
                {...props}
                keyboardType={numerical ? 'numeric' : 'default'}
                ref={ref => (this.inputRef = ref)}
                onFocus={() => this.handleFocus()}
                onBlur={() => this.handleBlur()}
                onChangeText={this.handleChange}
              />
            ) : (
              <TextInput
                style={[styles.textInput, styles.singleLine, inputStyle]}
                secureTextEntry={hidePass}
                underlineColorAndroid="transparent"
                blurOnSubmit
                {...props}
                keyboardType={numerical ? 'numeric' : 'default'}
                ref={ref => (this.inputRef = ref)}
                onFocus={() => this.handleFocus()}
                onBlur={() => this.handleBlur()}
                onChangeText={this.handleChange}
              />
            )}
          </View>

          {hasError && (
            <View style={styles.errorContainer}>
              <Text
                type="title"
                weight="bold"
                text={errorMessage}
                style={[styles.errorText, errorText]}
              />
            </View>
          )}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  margin: {
    marginTop: 10,
  },
  labelPaddingTop: {
    paddingTop: 18,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  label: {
    position: 'absolute',
    left: 0,
    zIndex: 10,
    marginLeft: 15,
    fontFamily: 'Nunito-Black',
  },
  textInput: {
    fontSize: 16,
    paddingHorizontal: theme.paddingHorizontal,
    color: theme.fontColorDark,
    textAlignVertical: 'top',
    fontFamily: 'Nunito',
  },
  singleLine: {
    height: INPUT_HEIGHT,
  },
  textGrow: {
    marginVertical: 8,
  },
  multiLineMargin: {
    marginVertical: MULTILINE_MARGIN,
  },
  errorContainer: {
    paddingHorizontal: theme.paddingHorizontal,
    paddingTop: 4,
  },
  errorText: {
    color: theme.mainColor,
    fontSize: theme.font.sizes.smallest,
  },
  togglePassword: {
    position: 'absolute',
    zIndex: 10,
    alignSelf: 'flex-end',
    padding: 15,
  },
  passwordIcon: {
    width: 25,
    height: 25,
    top: -5,
    resizeMode: 'contain',
  },
})

export default AnimatedTextInput
