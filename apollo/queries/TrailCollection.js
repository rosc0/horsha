import gql from 'graphql-tag'

export const TrailCollectionFieldsFragment = gql`
  fragment TrailCollectionFields on TrailPage {
    collection {
      id
      title
      description
      creator {
        id
        name
      }
      previewWaypointsUrl
      fullWaypointsUrl
      itinerary
      suitableForDriving
      distance
      favoriteSince
      ratingAverage
      canModify
      canDelete
      reviews {
        pageInfo {
          remaining
        }
        collection {
          author {
            id
            name
          }
          rating
        }
      }
      pictures {
        collection {
          image {
            url
          }
        }
      }
      elevationSummary {
        totalAscent
        totalDescent
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
      poiKinds
    }
    pageInfo {
      remaining
      next
      previous
    }
  }
`

export const GET_TRAILS_COLLECTION = gql`
  query getTrails(
    $filter: TrailFilterInput
    $maxItems: BigInt = 10
    $cursor: String = null
  ) {
    trails(
      filter: $filter
      pagination: { maxItems: $maxItems, cursor: $cursor }
    ) {
      ...TrailCollectionFields
    }
  }
  ${TrailCollectionFieldsFragment}
`

export const GET_TRAIL_BY_ID = gql`
  query getTrail($trailId: TrailId!) {
    trail(id: $trailId) {
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
`

export const GET_TRAIL_PICTURES = gql`
  query trailPictures($trailId: TrailId!) {
    trailPictures(filter: { trailId: $trailId }) {
      pageInfo {
        remaining
        next
        previous
      }
      collection {
        id
        image {
          url
          width
          height
        }
        author {
          id
        }
      }
    }
  }
`

export const GET_PREVIEW_TRAIL_PICTURES = gql`
  query trailPictures($trailId: TrailId!) {
    trailPictures(filter: { trailId: $trailId }) {
      pageInfo {
        remaining
        next
        previous
      }
      collection {
        id
        image {
          url
        }
      }
    }
  }
`

export const GET_TRAIL_REVIEWS = gql`
  query getTrailReviews(
    $trailId: TrailId!
    $maxItems: BigInt = 10
    $cursor: String = null
  ) {
    trailReviews(
      pagination: { maxItems: $maxItems, cursor: $cursor }
      filter: { trailId: $trailId }
    ) {
      pageInfo {
        remaining
        next
        previous
      }
      collection {
        id
        author {
          id
          name
        }
        canDelete
        rating
        canModify
        dateCreated(format: UNIX)
        dateLastUpdated(format: UNIX)
        body
      }
    }
  }
`
