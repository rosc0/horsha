import API from './index'
import { serialize } from '@application/utils'
import * as endpoints from './endpoints'
import config from 'react-native-config'
import {
  POST_LIKE,
  POST_ADD_COMMENT,
  POST_DELETE_COMMENT,
  POST_UNLIKE,
  POST_EDIT_COMMENT,
} from '../apollo/mutations/PostCollection'
import { client } from '../apollo/init'
import { GET_POST_COMMENTS } from '../apollo/queries/PostCollection'
import { GET_NEWSFEED_ITEM } from '../apollo/queries/NewsFeedCollection'

class Newsfeed extends API {
  getUpdates(maxItems = 10, cursor = false) {
    const { user_id } = this.getHeaders()
    let data = { user_id, max_items: maxItems }

    if (cursor) {
      data['cursor'] = cursor
    }

    const endpoint = `${endpoints.NEWSFEED}?${serialize(data)}`
    return new Promise((resolve, reject) => {
      this.setEndpoint(endpoint)
        .get({ token: true })
        .then(resolve)
        .catch(reject)
    })
  }

  getUpdate(id) {
    const newsId = id ? `/${id}` : ''
    const endpoint = `${endpoints.JOURNAL_ENTRY}${newsId}`

    return this.setEndpoint(endpoint).get({ token: true })
  }

  deleteUpdate(id) {
    const { access_token } = this.getHeaders()

    const params = serialize({ access_token })
    const endpoint = `${endpoints.JOURNAL_ENTRY}/${id}?${params}`

    return this.setEndpoint(endpoint).delete()
  }

  async toggleLike(likeState, postId) {
    const { user_id } = this.getHeaders()

    const data = await client.mutate({
      mutation: likeState ? POST_UNLIKE : POST_LIKE,
      variables: {
        postId,
        userId: user_id,
      },
      refetchQueries: () => [
        {
          query: GET_NEWSFEED_ITEM,
          variables: {
            postId,
          },
        },
      ],
    })
    return data
  }

  getComments(
    contentId,
    contentType,
    previous = null,
    next = null,
    commentId = null,
    maxItems = null
  ) {
    // /comment?
    // max_items=2
    // &journal_entry_id=d1798c15-e9b4-4b64-abee-452c8e138a85
    // &cursor={next-value}

    let data = {
      max_items: maxItems ? maxItems : 5,
    }

    if (contentType === 'journal_entry') {
      data.journal_entry_id = contentId
    }

    if (contentType === 'status_update') {
      data.status_update_id = contentId
    }

    if (commentId) {
      data.from_id = commentId
    }

    if (next) {
      data.cursor = next
      data.page_dir = 'b'
    }

    if (previous) {
      data.cursor = previous
    }

    const endpoint = `${endpoints.COMMENTS}?${serialize(data)}`

    return new Promise((resolve, reject) => {
      this.setEndpoint(endpoint)
        .get({ token: true })
        .then(resolve)
        .catch(reject)
    })
  }

  async addComment(postId, text) {
    const { userId } = this.getHeaders()

    const data = await client.mutate({
      mutation: POST_ADD_COMMENT,
      variables: {
        postId,
        text,
        userId,
      },
      refetchQueries: () => [
        {
          query: GET_NEWSFEED_ITEM,
          variables: {
            postId,
          },
        },
        {
          query: GET_POST_COMMENTS,
          variables: {
            postId,
          },
        },
      ],
    })
    return data
  }

  async updateComment(commentId, postId, text) {
    const { userId } = this.getHeaders()

    const data = await client.mutate({
      mutation: POST_EDIT_COMMENT,
      variables: {
        postId,
        commentId,
        text,
      },
      refetchQueries: () => [
        {
          query: GET_NEWSFEED_ITEM,
          variables: {
            postId,
          },
        },
        {
          query: GET_POST_COMMENTS,
          variables: {
            postId,
          },
        },
      ],
    })
    return data
  }

  async removeComment(commentId, postId) {
    const data = await client.mutate({
      mutation: POST_DELETE_COMMENT,
      variables: {
        postId,
        commentId,
      },
      refetchQueries: () => [
        {
          query: GET_NEWSFEED_ITEM,
          variables: {
            postId,
          },
        },
        {
          query: GET_POST_COMMENTS,
          variables: {
            postId,
          },
        },
      ],
    })
    console.log('delete', data)
    return data
  }
}

export default Newsfeed
