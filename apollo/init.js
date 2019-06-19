import { AsyncStorage } from 'react-native'
import { InMemoryCache } from 'apollo-boost'
import ApolloClient from 'apollo-client'
import { setContext } from 'apollo-link-context'
import { createHttpLink } from 'apollo-link-http'
import * as k from '@constants/storageKeys'
// accessToken === undefined
// APOLLO
const httpLink = createHttpLink({
  uri: 'https://dev-api.horsha.com/graphql',
})

const _retrieveData = async () => {
  try {
    const token = await AsyncStorage.getItem(k.AUTH_NEW_TOKENS)
    if (token !== null) {
      return JSON.parse(token)
    }
  } catch (error) {
    // Error retrieving data
  }
}

const authLink = setContext(async (_, { headers }) => {
  // return the headers to the context so httpLink can read them
  const token = await _retrieveData()
  return {
    headers: {
      ...headers,
      Authorization: `Bearer ${token.accessToken}`,
    },
  }
})

export const client = new ApolloClient({
  // @ts-ignore
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  client: {
    trails: {},
  },
})
