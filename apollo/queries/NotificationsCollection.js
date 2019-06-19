import gql from 'graphql-tag'

const NotificationCollectionFieldsFragment = gql`
  fragment NotificationCollectionFields on NotificationPage {
    pageInfo {
      remaining
      next
    }
    collection {
      type
      id
      dateUpdated
      dateRead
      subject {
        user {
          id
          name
          picture {
            url
          }
        }
        horse {
          id
          name
          picture {
            url
          }
        }
        post {
          text
          id
          author {
            id
            name
            picture {
              url
            }
          }
        }
        trail {
          id
          title
          creator {
            name
            picture {
              url
            }
          }
        }
      }
      target {
        name
        picture {
          url
        }
      }
      actors {
        collection {
          user {
            name
            picture {
              url
            }
          }
        }
      }
    }
  }
`

export const GET_NOTIFICATIONS_COLLECTION = gql`
  query notifications(
    $userId: UserId
    $maxItems: BigInt = 15
    $cursor: String = null
  ) {
    notifications(
      filter: { userId: $userId }
      pagination: { maxItems: $maxItems, cursor: $cursor }
    ) {
      ...NotificationCollectionFields
    }
  }
  ${NotificationCollectionFieldsFragment}
`
