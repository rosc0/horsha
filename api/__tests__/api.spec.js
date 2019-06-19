import API from '../index'
import { fetchMock, headersMock } from '../../../test/mocks'

const context = describe

headersMock()

context('API', () => {
  let wrapperAPI = null

  describe('Context', () => {
    beforeEach(() => {
      wrapperAPI = new API()
    })
    afterAll(() => {
      wrapperAPI = null
    })

    it('should exists', () => {
      expect(wrapperAPI).toBeDefined()
    })

    it('should have `setAuthConfig` method', () => {
      expect(wrapperAPI.setAuthConfig).toBeDefined()
    })

    it('should have `setEndpoint` method', () => {
      expect(wrapperAPI.setEndpoint).toBeDefined()
    })

    it('should have `getEndpoint` method', () => {
      expect(wrapperAPI.getEndpoint).toBeDefined()
    })

    it('should have `setBody` method', () => {
      expect(wrapperAPI.setBody).toBeDefined()
    })

    it('should have `getConfig` method', () => {
      expect(wrapperAPI.getConfig).toBeDefined()
    })

    it('should have `get` method', () => {
      expect(wrapperAPI.get).toBeDefined()
    })

    it('should have `post` method', () => {
      expect(wrapperAPI.post).toBeDefined()
    })

    it('should have `put` method', () => {
      expect(wrapperAPI.put).toBeDefined()
    })
  })

  describe('Auth config', () => {
    beforeEach(() => {
      wrapperAPI = new API({ isAuth: true })
    })
    afterAll(() => {
      wrapperAPI = null
    })

    it('should have content-type of form-urlencoded', () => {
      const config = wrapperAPI.setAuthConfig().getConfig()

      expect(config.headers).toBeDefined()
      expect(typeof config.headers).toBe('object')
      expect(config.headers['Content-Type']).toBeDefined()
      expect(config.headers['Content-Type']).toBe(
        'application/x-www-form-urlencoded'
      )
    })
  })

  describe('Methods', () => {
    beforeEach(() => {
      wrapperAPI = new API()
    })
    afterAll(() => {
      wrapperAPI = null
    })

    it('`setEndpoint() && `getEndPoint()`', () => {
      const simpleEndpoint = wrapperAPI.setEndpoint('/token')
      expect(simpleEndpoint.getEndpoint()).toMatch(/\/token/)

      const nestedEndpoint = wrapperAPI.setEndpoint('/user/1')
      expect(nestedEndpoint.getEndpoint()).toMatch(/\/user\/1/)
    })

    it('`setBody()`', () => {
      const user = {
        id: 13,
        name: 'John Doe',
        email: 'john@doe.com',
      }

      const apiWithBody = wrapperAPI.setBody(user).getConfig()
      expect(apiWithBody.body).toBeDefined()
      expect(apiWithBody.body).toBe(
        'id=13&name=John%20Doe&email=john%40doe.com'
      )

      const apiWithoutBody = wrapperAPI.setBody('').getConfig()
      expect(apiWithoutBody.body).toBeDefined()
      expect(apiWithoutBody.body).toBe('')

      const apiWithStringBody = wrapperAPI.setBody('nope').getConfig()
      expect(apiWithStringBody.body).toBeDefined()
      expect(apiWithStringBody.body).toBe('')

      const apiWithArrayBody = wrapperAPI
        .setBody(['test', 'test 2'])
        .getConfig()
      expect(apiWithArrayBody.body).toBeDefined()
      expect(apiWithArrayBody.body).toBe('')
    })
  })

  describe('GET Request', () => {
    beforeEach(() => {
      wrapperAPI = new API()
    })
    afterAll(() => {
      wrapperAPI = null
    })

    it('should make a get request properly', () => {
      const response = {
        status: 'ok',
        users: [{ name: 'Jane Doe' }, { name: 'John Doe' }],
      }

      fetchMock(response)

      const usersRequest = wrapperAPI.setEndpoint('/users')

      return usersRequest.get().then(response => {
        expect(response).toBeDefined()

        expect(response.status).toBeDefined()
        expect(response.status).toBe('ok')

        expect(response.users).toBeDefined()
        expect(response.users).toHaveLength(2)
        expect(response.users).toEqual([
          { name: 'Jane Doe' },
          { name: 'John Doe' },
        ])
      })
    })
  })

  describe('POST Request', () => {
    beforeEach(() => {
      wrapperAPI = new API()
    })
    afterAll(() => {
      wrapperAPI = null
    })

    it('should make a get request properly', () => {
      const body = { name: 'Horse name' }
      const resp = { status: 'added' }

      fetchMock(resp)

      const horseRequest = wrapperAPI.setEndpoint('/horse').setBody(body)

      return horseRequest.post().then(req => {
        expect(req).toBeDefined()
        expect(req).toEqual({ status: 'added' })
      })
    })
  })

  describe('PUT Request', () => {
    beforeEach(() => {
      wrapperAPI = new API()
    })
    afterAll(() => {
      wrapperAPI = null
    })

    it('should make a get request properly', () => {
      const body = { name: 'Jane Doe' }
      const resp = { status: 'ok' }

      fetchMock(resp)

      const userRequest = wrapperAPI.setEndpoint('/user/1').setBody(body)

      return userRequest.get().then(req => {
        expect(req).toBeDefined()
        expect(req).toEqual({ status: 'ok' })
      })
    })
  })
})
