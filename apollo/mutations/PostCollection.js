import gql from 'graphql-tag'

// LIKE
export const POST_LIKE = gql`
  mutation postAddLike($postId: PostId!, $userId: UserId) {
    postAddLike(id: $postId, input: { userId: $userId }) {
      since
    }
  }
`

export const POST_UNLIKE = gql`
  mutation postRemoveLike($postId: PostId!, $userId: UserId!) {
    postRemoveLike(id: $postId, userId: $userId)
  }
`

// Create post flow
// POST_PREPARE, returns id, >>
// POST_SAVE_CONTENT, >>
// POST_PUBLISH
export const POST_PREPARE = gql`
  mutation createPost {
    postPrepare {
      id
    }
  }
`
export const POST_SAVE_CONTENT = gql`
  mutation postSaveContent($postId: PostId!, $text: BodyText) {
    postSaveContent(id: $postId, content: { text: $text }) {
      id
    }
  }
`

// enum ShareScope {
//   PRIVATE
//   FRIENDS
//   PUBLIC
// }
export const POST_PUBLISH = gql`
  mutation postPublish(
    $postId: PostId!
    $horseId: HorseId = null
    $shareScope: ShareScope = FRIENDS
    $text: BodyText
    $media: [PostMediaAttachmentId!]
  ) {
    postPublishContent(
      id: $postId
      input: {
        taggedHorseId: $horseId
        shareScope: $shareScope
        text: $text
        media: $media
      }
    ) {
      id
      text
      author {
        id
        name
      }
      taggedHorse {
        id
        name
      }
      media {
        image {
          url
          width
          height
        }
      }
    }
  }
`

export const POST_UPDATE_PUBLISH = gql`
  mutation postUpdatePublish(
    $postId: PostId!
    $horseId: HorseId = null
    $shareScope: ShareScope = FRIENDS
    $text: BodyText
    $media: [PostMediaAttachmentId!]
  ) {
    postPublishContent(
      id: $postId
      input: {
        taggedHorseId: $horseId
        shareScope: $shareScope
        text: $text
        media: $media
      }
    ) {
      id
      text
      author {
        id
        name
      }
      taggedHorse {
        name
      }
      media {
        image {
          url
          width
          height
        }
      }
    }
  }
`

export const POST_DELETE = gql`
  mutation detelePost($postId: PostId!) {
    postDelete(id: $postId)
  }
`

export const POST_ADD_COMMENT = gql`
  mutation addPostComment($postId: PostId!, $userId: UserId, $text: BodyText!) {
    postAddComment(id: $postId, input: { text: $text, authorUserId: $userId }) {
      id
      text
    }
  }
`

export const POST_EDIT_COMMENT = gql`
  mutation postEditComment(
    $postId: PostId!
    $commentId: PostCommentId!
    $text: BodyText!
  ) {
    postEditComment(
      id: $postId
      commentId: $commentId
      input: { text: $text }
    ) {
      id
      text
    }
  }
`

export const POST_DELETE_COMMENT = gql`
  mutation postRemoveComment($postId: PostId!, $commentId: PostCommentId!) {
    postRemoveComment(id: $postId, commentId: $commentId)
  }
`

export const POST_ATTACH_MEDIA = gql`
  mutation postAttachMedia($postId: PostId!, $media: String!) {
    postAttachMedia(id: $postId, input: { uploadKey: $media }) {
      id
      image {
        url
      }
    }
  }
`
