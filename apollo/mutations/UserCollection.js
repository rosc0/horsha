import gql from 'graphql-tag'
import { UserFieldsFragment } from '../queries/UserCollection'

export const ACCEPT_FRIEND_REQUEST = gql`
  mutation userAcceptFriendRequest(
    $initiatorUserId: UserId!
    $userId: UserId!
  ) {
    userAcceptFriendRequest(id: $userId, initiatorUserId: $initiatorUserId)
  }
`
export const DENY_FRIEND_REQUEST = gql`
  mutation userDenyFriendRequest($initiatorUserId: UserId!, $userId: UserId!) {
    userDenyFriendRequest(id: $userId, initiatorUserId: $initiatorUserId)
  }
`
export const UPDATE_FRIEND_REQUEST = gql`
  mutation userUpdateFriendRequest(
    $initiatorUserId: UserId!
    $userId: UserId!
  ) {
    userUpdateFriendRequest(
      id: $userId
      initiatorUserId: $initiatorUserId
      input: { state: PENDING }
    )
  }
`
export const IGNORE_FRIEND_REQUEST = gql`
  mutation userUpdateFriendRequest(
    $initiatorUserId: UserId!
    $userId: UserId!
  ) {
    userUpdateFriendRequest(
      id: $userId
      initiatorUserId: $initiatorUserId
      input: { state: IGNORED }
    )
  }
`
export const USER_FRIEND_REQUEST = gql`
  mutation userRequestFriendship($targetUserId: UserId!, $userId: UserId!) {
    userRequestFriendship(id: $userId, targetUserId: $targetUserId)
  }
`
export const USER_UNFRIEND_REQUEST = gql`
  mutation userUnfriend($targetUserId: UserId!, $userId: UserId!) {
    userUnfriend(id: $userId, targetUserId: $targetUserId)
  }
`
export const USER_FOLLOW_REQUEST = gql`
  mutation userFollow($targetUserId: UserId!, $userId: UserId!) {
    userFollow(id: $userId, targetUserId: $targetUserId)
  }
`
export const USER_UNFOLLOW_REQUEST = gql`
  mutation userUnfollow($targetUserId: UserId!, $userId: UserId!) {
    userUnfollow(id: $userId, targetUserId: $targetUserId)
  }
`

// USER UPDATES
// export const USER_UPDATE_PREFERENCES = gql`
// mutation userUpdatePreferences(
//   $userId: UserId!,
//   $unitSystem: UnitSystem! = METRIC,
//   $heightUnit: HorseHeightUnit! = METER,
//   $pushEnabled: Boolean! = true,
//   $pushTopicsHorse: Boolean! = true,
//   $pushTopicsPost: Boolean! = true,
// ) {
//   userUpdatePreferences(
//     id: $userId
//     input: {
//       unitSystem: $unitSystem,
//       heightUnit: $heightUnit,
//       pushEnabled: $pushEnabled,
//       pushTopics: { horse: $pushTopicsHorse, post: $pushTopicsPost }
//     }
//   ) {
//     ...UserFields
//   }
// }
//   ${UserFieldsFragment}
// `

export const USER_UPDATE_PREFERENCES = gql`
  mutation userUpdatePreferences($userId: UserId!) {
    userUpdatePreferences(
      id: $userId
      input: {
        unitSystem: METRIC
        heightUnit: METER
        pushEnabled: true
        pushTopics: { horse: true, post: true }
      }
    ) {
      id
      name
      picture {
        url
      }
      countryCode
    }
  }
`

export const USER_CHANGE_PICTURE = gql`
  mutation userChangePicture($userId: UserId!, $uploadKey: String) {
    userChangePicture(id: $userId, input: { uploadKey: $uploadKey })
  }
`
export const USER_UPDATE_PROFILE = gql`
  mutation userUpdateProfile(
    $userId: UserId!
    $name: NameText!
    $countryCode: String!
    $about: BodyText
  ) {
    userUpdateProfile(
      id: $userId
      input: { name: $name, countryCode: $countryCode, about: $about }
    )
  }
`
export const USER_CHANGE_PASSWORD = gql`
  mutation userChangePassword($userId: UserId!, $password: Password!) {
    userChangePassword(id: $userId, input: { password: $password })
  }
`
export const USER_CHANGE_ACCOUNT_STATUS = gql`
  mutation userChangeAccountStatus(
    $userId: UserId!
    $status: UserAccountStatus! = DISABELD
  ) {
    userChangeAccountStatus(id: $userId, input: { status: $status }) {
      ...UserFields
    }
  }
  ${UserFieldsFragment}
`
export const USER_SET_PRIMARY_EMAIL = gql`
  mutation userSetAsPrimaryEmail($userId: UserId!, $email: String!) {
    userSetAsPrimaryEmail(id: $userId, input: { email: $email }) {
      ...UserFields
    }
  }
  ${UserFieldsFragment}
`
export const USER_SIGNUP_FACEBOOK = gql`
  mutation userSignupFacebook($facebookAccessToken: String!) {
    userSignupFacebook(input: { facebookAccessToken: $facebookAccessToken }) {
      ...UserFields
    }
  }
  ${UserFieldsFragment}
`
export const USER_REGISTER_EMAIL = gql`
  mutation userRegisterEmail($userId: UserId!, $email: String!) {
    userRegisterEmail(id: $userId, input: { email: $email })
  }
`
export const USER_UNREGISTER_EMAIL = gql`
  mutation userUnregisterEmail($userId: UserId!, $email: String!) {
    userUnregisterEmail(id: $userId, email: $email)
  }
`
