import gql from 'graphql-tag'

// export const PostCollectionFragment = gql`
//   fragment PostCollection on PostPage {
//     pageInfo {
//             remaining
//             previous
//      next
//     }
//     collection {
//       ...PostFragmentFields
//     }
//   }
//   ${PostCollectionFieldsFragment}
// `

// export const PostCollectionFieldsFragment = gql`
//   fragment PostFragmentFields on Post {
//     id
//     taggedHorse {
//       id
//     }
//     shareScope
//     text
//     media {
//       image {
//         url
//       }
//     }
//     author {
//       id
//       name
//       countryCode
//     }
//     dateCreated(format: RFC3339)
//     likes {
//       pageInfo {
//               remaining
// previous
// next
//       }
//       collection {
//         user {
//           name
//         }
//       }
//     }
//     likedSince
//     activity {
//       type
//       track {
//         distance
//       }
//     }
//     statusUpdate {
//       subject {
//         horse {
//           id
//         }
//         user {
//           id
//         }
//       }
//     }
//     publishState
//     datePublished
//     comments {
//       pageInfo {
// remaining
// previous
// next
//       }
//     }
//     canModify
//     canDelete
//     canUntagHorse
//     media {
//       image {
//         url
//       }
//     }
//   }
// `

// export const GET_POSTS_COLLECTION = gql`
//   query getPosts($maxItems: BigInt = 1) {
//     posts(
//       filter: { publishStates: PUBLISHED }
//       pagination: { maxItems: $maxItems }
//     ) {
//       ...PostCollectionFields
//     }
//   }
//   ${PostCollectionFragment}
// `

// export const GET_POSTS_FROM_USER_COLLECTION = gql`
//   query postsFromUser($maxItems: BigInt = 1, $authorUserId: String) {
//     posts(
//       filter: { authorUserId: $authorUserId }
//       pagination: { maxItems: $maxItems }
//     ) {
//       ...PostCollectionFields
//     }
//   }
//   ${PostCollectionFragment}
// `

// export const GET_POSTS_DRAFTS_COLLECTION = gql`
//   query getDraftPosts($maxItems: BigInt = 1) {
//     posts(
//       filter: { publishStates: UNPUBLISHED }
//       pagination: { maxItems: $maxItems }
//     ) {
//       ...PostCollectionFields
//     }
//   }
//   ${PostCollectionFragment}
// `

export const GET_POST_COMMENTS = gql`
  query getPostsComments(
    $postId: PostId!
    $maxItems: BigInt = 5
    $cursor: String = null
  ) {
    postComments(
      id: $postId
      pagination: { maxItems: $maxItems, cursor: $cursor }
    ) {
      pageInfo {
        remaining
        previous
        next
      }
      collection {
        text
        id
        canModify
        canRemove
        dateCreated
        author {
          id
          name
          picture {
            url
          }
        }
      }
    }
  }
`

export const PostCollectionFieldsNewsFeedFragment = gql`
  fragment PostFragmentFileds on Post {
    id
    taggedHorse {
      id
      name
      picture {
        url
      }
    }
    shareScope
    text
    media {
      id
      image {
        url
        width
        height
      }
      dateCreated
    }
    author {
      id
      name
      countryCode
      picture {
        url
      }
    }
    dateCreated
    likes {
      pageInfo {
        remaining
      }
      collection {
        user {
          name
        }
      }
    }
    likedSince
    activity {
      type
      trackAttachment {
        distance
      }
    }
    statusUpdate {
      subject {
        horse {
          id
          name
          picture {
            url
          }
        }
        user {
          id
          name
          picture {
            url
          }
        }
        trail {
          id
          title
          fullWaypointsUrl
          description
          dateCreated(format: UNIX)
          reviews {
            pageInfo {
              remaining
            }
            collection {
              id
              author {
                id
                name
              }
              rating
              body
              dateCreated(format: UNIX)
              dateLastUpdated(format: UNIX)
            }
          }
          creator {
            id
            name
          }
          review {
            author {
              id
              name
            }
          }
          previewWaypointsUrl
          itinerary
          suitableForDriving
          distance
          favoriteSince
          ratingAverage
          canModify
          canDelete
          pictures(maxItems: 5) {
            pageInfo {
              remaining
            }
            collection {
              id
              image {
                url
              }
              author {
                name
              }
            }
          }
          elevationSummary {
            totalAscent
            totalDescent
            minAltitude
            maxAltitude
          }
          boundingBox {
            topRight {
              longitude
              latitude
            }
            bottomLeft {
              longitude
              latitude
            }
          }
          surfaceTypes
          poiKinds
          poiOccurrences {
            kind
            count
          }
          pois {
            collection {
              distanceFromStart
              poi {
                kind
                creator {
                  name
                  id
                }
                location {
                  latitude
                  longitude
                }
                description
              }
            }
          }
        }
      }
      type
    }
    publishState
    datePublished
    comments {
      pageInfo {
        remaining
      }
      collection {
        id
        text
      }
    }
    canModify
    canUntagHorse
  }
`
