import gql from 'graphql-tag'

export const UserFieldsFragment = gql`
  fragment UserFields on User {
    id
    name
    picture {
      url
    }
    countryCode
  }
`

// export const CurrentUserFieldsFragment = gql`
//   fragment CurrentUserFields on User {
//     id
//     name
//     picture {
//       url
//     }
//     countryCode
//     dateCreated
//     about
//     birthday
//     ridingTotals {
//       ascent
//       descent
//       distance
//       duration
//       count
//     }
//     account {
//       preferences {
//         unitSystem
//         heightUnit
//         pushEnabled
//         unitSystem
//         pushTopics {
//           horse
//           post
//         }
//       }
//     }
//   }
// `

export const UserFollowCollectionFieldsFragment = gql`
  fragment UserFollowCollectionFields on UserPage {
    pageInfo {
      next
      previous
      remaining
    }
    collection {
      id
      name
      picture {
        url
      }
      countryCode
      inboundFriendRequestState
    }
  }
`

// # query me {
//   #   userMe {
//   #     ...CurrentUserFields
//   #   }
//   # }
//   # ${CurrentUserFieldsFragment}

export const CURRRENT_USER = gql`
  query userMe {
    userMe {
      id
      name
      picture {
        url
      }
      countryCode
      dateCreated
      about
      birthday
      ridingTotals {
        ascent
        descent
        distance
        duration
        count
      }
      account {
        primaryEmail
        registeredEmails {
          email
          confirmed
        }
        preferences {
          unitSystem
          heightUnit
          pushEnabled
          unitSystem
          pushTopics {
            horse
            post
          }
        }
      }
    }
  }
`

export const GET_FOLLOWERS = gql`
  query getFollowerFromUserId(
    $userId: UserId!
    $maxItems: BigInt = 15
    $cursor: String = null
  ) {
    userList(
      filter: { followingUserId: $userId }
      pagination: { maxItems: $maxItems, cursor: $cursor }
    ) {
      ...UserFollowCollectionFields
    }
  }
  ${UserFollowCollectionFieldsFragment}
`

export const GET_FOLLOWING = gql`
  query getMyFollowingList(
    $userId: UserId!
    $maxItems: BigInt = 15
    $cursor: String = null
  ) {
    userList(
      filter: { followeeUserId: $userId }
      pagination: { maxItems: $maxItems, cursor: $cursor }
    ) {
      ...UserFollowCollectionFields
    }
  }
  ${UserFollowCollectionFieldsFragment}
`

export const GET_FRIENDS = gql`
  query getMyFriendsList(
    $userId: UserId!
    $maxItems: BigInt = 15
    $cursor: String = null
  ) {
    userList(
      filter: { friendsWithUser: $userId }
      pagination: { maxItems: $maxItems, cursor: $cursor }
    ) {
      ...UserFollowCollectionFields
    }
  }
  ${UserFollowCollectionFieldsFragment}
`

export const GET_PENDING_INVITATIONS = gql`
  query getPendingInvitations(
    # $userId: UserId!
    $maxItems: BigInt = 15
    $cursor: String = null
  ) {
    userList(
      filter: { inboundFriendRequestStates: [PENDING] }
      pagination: { maxItems: $maxItems, cursor: $cursor }
    ) {
      ...UserFollowCollectionFields
    }
  }
  ${UserFollowCollectionFieldsFragment}
`

export const GET_IGNORED_INVITATIONS = gql`
  query getIgnoredInvitations(
    # $userId: UserId!
    $maxItems: BigInt = 15
    $cursor: String = null
  ) {
    userList(
      filter: { inboundFriendRequestStates: [IGNORED] }
      pagination: { maxItems: $maxItems, cursor: $cursor }
    ) {
      ...UserFollowCollectionFields
    }
  }
  ${UserFollowCollectionFieldsFragment}
`

export const GET_PEOPLE_YOU_MAY_KNOW = gql`
  query getPeopleYouMayKnow(
    $userId: UserId!
    $maxItems: BigInt = 15
    $cursor: String = null
  ) {
    userFriendSuggestions(
      id: $userId
      pagination: { maxItems: $maxItems, cursor: $cursor }
    ) {
      pageInfo {
        next
        previous
        remaining
      }
      collection {
        user {
          id
          name
          picture {
            url
          }
          countryCode
        }
      }
    }
  }
`
