// TODO: fix this test
import { fetchMock, headersMock, asyncStorageMock } from '../../../test/mocks'
const context = describe

it('should have a test', () => expect(1 + 1).toBe(2))

headersMock()
asyncStorageMock()

import Authentication from '../../api/auth'

const success = {
  access_token: 'ab03f2ed509c90dd97d1bd618af20867',
  token_type: 'bearer',
  expires_in: 3599,
  refresh_token: '47739bdc3e715f93bff7c485c7ed4f47',
}

context('Authentication', () => {
  let authAPI = null

  describe('Authenticate', () => {
    beforeEach(() => {
      authAPI = new Authentication()
    })
    afterAll(() => {
      authAPI = null
    })

    it('should login by password', () => {
      fetchMock(success)

      const credentials = {
        grant_type: 'password',
        username: 'john@doe.com',
        password: 'pass',
      }

      const auth = authAPI.authenticate(credentials)

      return auth.then(response => {
        expect(response.token_type).toBeDefined()
        expect(response.refresh_token).toBeDefined()
        expect(response.token_type).toBeDefined()
        expect(response.access_token).toBeDefined()
      })
    })

    it('should login by facebook', () => {
      fetchMock(success)

      const credentials = {
        grant_type: 'facebook_token',
        facebook_id: 'WejV5YDUPPs8M4Yz2dN55LXbP8MU3qiB',
        facebook_access_token: '6CADBABE67C5C9A9',
      }

      const auth = authAPI.authenticate(credentials)

      return auth.then(response => {
        expect(response.token_type).toBeDefined()
        expect(response.refresh_token).toBeDefined()
        expect(response.token_type).toBeDefined()
        expect(response.access_token).toBeDefined()
      })
    })
  })
})
