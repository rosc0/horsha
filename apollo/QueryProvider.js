import React from 'react'
import { Text, View } from 'react-native'
import { Query } from 'react-apollo'
import Loading from '@components/Loading'
import { setAlertStatus } from '../actions/app'
import store from '@application/store'

import { GET_TRAILS_COLLECTION } from './queries/TrailCollection'

const vari = {
  maxItems: 10,
  filter: {
    boundingBox: {
      topRight: {
        latitude: 52.4595011,
        longitude: 4.915234374384236,
      },
      bottomLeft: {
        latitude: 52.271261100000004,
        longitude: 4.871767625615763,
      },
    },
  },
}

const getTrails = data =>
  new Promise(async (resolve, reject) => {
    try {
      const { trails } = data
      if (!!trails && trails.collection) {
        await Promise.all(
          trails.collection.map(async (trail, key) => {
            trails.collection[key].coordinates = await fetch(
              trail.fullWaypointsUrl
            ).then(res => res.json())
          })
        )
      }

      return resolve(trails)
    } catch (err) {
      return reject(err)
    }
  })

const wait = (amount = 0) => new Promise(resolve => setTimeout(resolve, amount))

export default class QueryProvider extends React.Component {
  state = {
    convertedData: null,
    doMore: true,
  }

  async call(data) {
    if (this.state.doMore === false) return
    this._asyncRequest = await getTrails(data).then(convertedData => {
      this._asyncRequest = null
      this.setState({ convertedData, doMore: false })
    })
  }

  componentWillUnmount() {
    if (this._asyncRequest) {
      this._asyncRequest.cancel()
    }
  }

  render() {
    return (
      <Query
        query={GET_TRAILS_COLLECTION}
        variables={vari}
        fetchPolicy="cache-and-network"
      >
        {({ loading, error, data, refetch, client }) => {
          if (loading) {
            return (
              <View>
                <Text>Loading</Text>
              </View>
            )
            // return <Loading fullScreen type="spinner" />
            // return null
          }
          if (error) {
            return (
              <View>
                <Text>Error :( {error}</Text>
              </View>
            )
          }

          wait(0)
          this.call(data)

          if (this.state.convertedData === null) {
            // return <Loading fullScreen type="spinner" />
            return null
          } else {
            return (
              <React.Fragment>
                {this.props.children({
                  loading,
                  error,
                  data: this.state.convertedData,
                  refetch,
                  client,
                })}
              </React.Fragment>
            )
          }
        }}
      </Query>
    )
  }
}
