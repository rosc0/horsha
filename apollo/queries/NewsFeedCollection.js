import gql from 'graphql-tag'
import { PostCollectionFieldsNewsFeedFragment } from './PostCollection'
// import { PostCollectionFieldsFragment } from './PostCollection'

// // export const GET_NEWSFEED_COLLECTION = gql`
// //   query newsFeed($maxItems: BigInt = 1, $userId: UserId!) {
// //     newsFeed(userId: $userId, pagination: { maxItems: $maxItems }) {
// //       ...NewsFeedItemCollectionFields
// //     }
// //   }
// //   ${NewsFeedItemCollectionFieldsFragment}
// // `

// const NewsFeedItemCollectionFieldsFragment = gql`
//   fragment NewsFeedItemCollectionFields on NewsFeedItemPage {
//     pageInfo {
//       remaining
//     }
//     collection {
//       id
//       targetUser {
//         name
//       }
//       visible
//       type
//       dateCreated
//       subject {
//         ...PostFragment
//       }
//     }
//   }
//   ${PostFragment}
// `

// const PostFragment = gql`
//   fragment PostFragment on NewsSubject {
//     post {
//       id
//     }
//   }
//   # ${PostCollectionFieldsFragment}
// `

// export const GET_NEWSFEED_COLLECTION = gql`
//   query newsFeed($maxItems: BigInt = 1, $userId: UserId!) {
//     newsFeed(
//       userId: $userId,
//       pagination: { maxItems: $maxItems }
//     ) {
//       pageInfo {
//         remaining
//       }
//       collection {
//         id
//         targetUser {
//           name
//         }
//         visible
//         type
//         dateCreated
//         subject {
//           post {
//             id
//           }
//         }
//       }
//     }
//   }
// `

// fragment PostFragment on NewsSubject {
//   post {
//     ...PostFragmentFileds
//   }
// }

const PostFragmentFragment = gql`
  fragment PostFragment on NewsSubject {
    post {
      ...PostFragmentFileds
    }
  }
  ${PostCollectionFieldsNewsFeedFragment}
`

const NewsFeedItemCollectionFieldsFragment = gql`
  fragment NewsFeedItemCollectionFields on NewsFeedItemPage {
    pageInfo {
      remaining
      previous
      next
    }
    collection {
      id
      targetUser {
        name
      }
      visible
      type
      dateCreated
      subject {
        ...PostFragment
      }
    }
  }
  ${PostFragmentFragment}
`

export const GET_NEWSFEED_COLLECTION = gql`
  query newsFeed(
    $maxItems: BigInt = 15
    $userId: UserId!
    $cursor: String = null
  ) {
    newsFeed(
      userId: $userId
      pagination: { maxItems: $maxItems, cursor: $cursor }
    ) {
      ...NewsFeedItemCollectionFields
    }
  }
  ${NewsFeedItemCollectionFieldsFragment}
`

export const GET_NEWSFEED_ITEM = gql`
  query newsFeedItem($postId: PostId!) {
    post(id: $postId) {
      ...PostFragmentFileds
    }
  }
  ${PostCollectionFieldsNewsFeedFragment}
`
