import gql from 'graphql-tag'

// LIKE
export const TRAIL_LIKE = gql`
  mutation Like($trailId: TrailId!, $userId: ID) {
    trailMarkFavorite(id: $trailId, userId: $userId) {
      since
    }
  }
`

export const TRAIL_UNLIKE = gql`
  mutation unLike($trailId: TrailId!, $userId: ID) {
    trailUnmarkFavorite(id: $trailId, userId: $userId)
  }
`

// REVIEW
export const TRAIL_REVIEW_CREATE = gql`
  mutation trailReviewCreate(
    $trailId: TrailId!
    $body: BodyText
    $rating: Rating
    $trailPictureIds: [TrailPictureId!]
  ) {
    trailReviewCreate(
      input: {
        trailId: $trailId
        content: {
          body: $body
          rating: $rating
          trailPictureIds: $trailPictureIds
        }
      }
    ) {
      id
    }
  }
`

export const TRAIL_REVIEW_EDIT = gql`
  mutation trailReviewUpdate(
    $trailsReviewId: TrailReviewId!
    $body: BodyText
    $rating: Rating
    $trailPictureIds: [TrailPictureId!]
  ) {
    trailReviewUpdate(
      id: $trailsReviewId
      content: {
        body: $body
        rating: $rating
        trailPictureIds: $trailPictureIds
      }
    ) {
      id
    }
  }
`

export const TRAIL_REVIEW_DELETE = gql`
  mutation trailReviewDelete($trailsReviewId: TrailReviewId!) {
    trailReviewDelete(id: $trailsReviewId)
  }
`

export const TRAIL_PROFILE_EDIT = gql`
  mutation editTrail(
    $trailId: TrailId!
    $title: NameText!
    $description: BodyText
    $suitableForDriving: Boolean
    $surfaceTypes: [TrailSurfaceType!]
  ) {
    trailUpdateProfile(
      id: $trailId
      profile: {
        title: $title
        description: $description
        suitableForDriving: $suitableForDriving
        surfaceTypes: $surfaceTypes
      }
    ) {
      id
      title
    }
  }
`
