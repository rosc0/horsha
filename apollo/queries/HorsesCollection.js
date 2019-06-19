import gql from 'graphql-tag'

export const GET_USER_HORSES = gql`
  query getUserHorses(
    $userId: UserId!
    $maxItems: BigInt = 10
    $cursor: String = null
  ) {
    horses(
      pagination: { maxItems: $maxItems, cursor: $cursor }
      filter: { memberUserId: $userId }
    ) {
      pageInfo {
        remaining
        previous
        next
      }
      collection {
        id
        name
        picture {
          url
        }
      }
    }
  }
`
