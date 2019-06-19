import 'react-native'
import React from 'react'
import { MockedProvider } from 'react-apollo/test-utils'
import renderer from 'react-test-renderer'

import Trails from './QueryProvider'
import { GET_TRAILS_COLLECTION } from './queries/TrailCollection'

const wait = (amount = 0) => new Promise(resolve => setTimeout(resolve, amount))

const variables = {
  maxItems: 5,
  filter: {
    boundingBox: {
      topRight: {
        latitude: 50.233002419847715,
        longitude: 6.50906324568013,
      },
      bottomLeft: {
        latitude: 50.21685451906035,
        longitude: 6.098913991729163,
      },
    },
  },
}

const responseExpec = {
  data: {
    trails: {
      collection: [
        {
          id: 'ed3d54ed-f0f0-433a-9ed2-b1d60f9a2782',
          title:
            'Naar rolfilm GHB. Chhb cfh ghj ghjj ghhhh hhhhhgg vgghh ghhhhj ghhhhh hhghgg hhghgg',
          description: 'New description another bcjcj',
          __typename: 'Trail',
        },
        {
          id: 'd177923d-378b-471e-8f51-c6704e948f66',
          title: 'eifel hele trektocht',
          description: null,
          __typename: 'Trail',
        },
        {
          id: 'c519c9d1-2604-4e72-954b-968378b1538e',
          title: 'Prum to Schonfeld',
          description: null,
          __typename: 'Trail',
        },
        {
          id: 'ac677341-1a01-4126-8f36-21e0ac82d364',
          title: 'Naar rolf ',
          description: null,
          __typename: 'Trail',
        },
      ],
      __typename: 'TrailCollection',
    },
  },
}

it('should render without error', () => {
  renderer.create(
    <MockedProvider mocks={[]}>
      <Trails />
    </MockedProvider>
  )
})

it('should render loading state initially', () => {
  const component = renderer.create(
    <MockedProvider mocks={[]}>
      <Trails />
    </MockedProvider>
  )
  expect(component.toJSON()).toMatchSnapshot()
  expect(component.toJSON().children[0].children[0]).toContain('Loading...')
})

it('should show data', async () => {
  const mock = {
    request: {
      query: GET_TRAILS_COLLECTION,
      variables: variables,
    },
    result: responseExpec,
  }

  const component = renderer.create(
    <MockedProvider mocks={[mock]} addTypename={false}>
      <Trails />
    </MockedProvider>
  )

  await wait(0) // wait for response

  // const tree = component.toJSON()
  // expect(tree).toMatchSnapshot()
  // expect(tree.children[0].children[0]).toContain('Error :(')
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  // const p = component.root.findByType('View');
  // expect(p.children).toContain('Buck is a poodle');
})

it('should show error UI', async () => {
  const mock = {
    request: {
      query: GET_TRAILS_COLLECTION,
      variables: variables,
    },
    error: new Error('aw shucks'),
  }

  const component = renderer.create(
    <MockedProvider mocks={[mock]} addTypename={false}>
      <Trails />
    </MockedProvider>
  )

  await wait(0) // wait for response

  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
  expect(tree.children[0].children[0]).toContain('Error :(')
})
