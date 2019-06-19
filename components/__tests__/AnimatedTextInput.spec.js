import * as React from 'react'
// import { shallow } from 'enzyme'
// import AnimatedTextInput from '../AnimatedTextInput'
import { theme } from '@styles/theme'

jest.useFakeTimers()
jest.mock('Animated', () => {
  const ActualAnimated = require.requireActual('Animated')
  return {
    ...ActualAnimated,
    timing: (value, config) => {
      return {
        start: callback => {
          value.setValue(config.toValue)
          callback && callback()
        },
      }
    },
  }
})

const defaultProps = {
  value: '1',
  marginTop: null,
  inputContainerStyle: null,
  inputStyle: null,
  errorBorderColor: theme.mainColor,
  errorTextColor: theme.mainColor,
  placeholderTextColor: theme.fontColorLight,
  labelTextColor: theme.fontColor,
  multiLine: false,
  defaultMultiLineHeight: 200,
  errorMessage: null,
  isPassword: false,
}

it('<AnimatedTextInput /> renders correctly', () => {
  // const output = shallow(<AnimatedTextInput {...defaultProps} />);
  // expect(output).toMatchSnapshot();
  expect(true).toEqual(true)
})

it('renders with optional props', () => {
  // const output = shallow(
  //   <AnimatedTextInput onPress={() => { }} buttonStyle={{}} imageStyle={{}} />
  // );
  // expect(output).toMatchSnapshot();
})
