import 'react-native'
import React from 'react'
import AddButton from '../AddButton'
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

it('<AddButton /> renders correctly', () => {
  const output = renderer.create(<AddButton />)
  expect(output).toMatchSnapshot()
})

it('renders with optional props', () => {
  const output = renderer.create(
    <AddButton onPress={() => {}} buttonStyle={{}} imageStyle={{}} />
  )
  expect(output).toMatchSnapshot()
})
