// Auth
export const TOKEN = '/token'
export const RESET_PASSWORD = '/password_reset/request'
export const REGISTER_DEVICE = '/device'

// Newsfeed
export const NEWSFEED = '/news'
export const JOURNAL_ENTRY = '/journal_entry'
export const COMMENTS = '/comment'
export const LIKE = '/like'

// User
export const USER = '/user'
export const USER_PROFILE = '/user/:id'
export const USER_SEARCH = '/user/search'
export const CURRENT_USER = '/user/me'
export const UPDATE_USER_PROFILE = '/user/:id/profile'
export const UPDATE_USER_PREFERENCES = '/user/:id/preferences'
export const UPDATE_USER_PROFILE_IMAGE = '/user/:id/profile_picture'
export const RESEND_EMAIL_CONFIRMATION =
  '/user/:userId/registered_email/:email/confirmation_state'
export const REGISTERED_EMAIL = '/user/:userId/registered_email'
export const SET_EMAIL_PRIMARY = '/user/:userId/primary_email'
export const CREATE_USER_WITH_FACEBOOK = '/user/facebook'

//Friends
export const REQUEST_FRIENDSHIP = '/user/:user_id/friend_request'
export const ACCEPT_FRIEND_REQUEST =
  '/user/:initiating_user_id/friend_request/:target_user_id/accept'
export const IGNORE_FRIEND_REQUEST =
  '/user/:initiating_user_id/friend_request/:target_user_id/state'
export const DELETE_FRIEND_REQUEST =
  '/user/:initiating_user_id/friend_request/:target_user_id'
export const DELETE_FRIEND = '/user/:user_id/friend/:target_user_id'
export const FRIEND_SUGGESTIONS = '/user/:user_id/friend_suggestions'

// Horses
export const HORSE = '/horse'
export const HORSE_USER = '/horse_user'
export const HORSE_PICTURE = '/profile_picture'
export const HORSE_ALBUM = '/horse_picture'
export const HORSE_USER_RELATION = '/relation'
export const HORSE_JOURNAL = '/journal_entry'
export const HORSE_LAST_ACCESSED = '/horse_user/:id/last_accessed'
export const STATUS_UPDATE = '/status_update'

// Rides
export const RIDE = '/ride'
export const GEO = '/geo/track/gpx'
export const TRACK = '/geo/gpx/track'
export const CONVERT_GPX_WAYLIST = '/geo/gpx/waypoint_list'
// Trails
export const TRAILS = '/trail'
export const TRAIL_PICTURES = '/trail_picture'
export const TRAIL_REVIEW = '/trail_review'
export const TRAIL_POI = '/trail_poi'
export const TRAIL_FAVORITES = '/trail_favorite'
export const TRAIL_RIDES = '/trail_ride'

// Point of Interests
export const POIS = '/poi'

// Report
export const REPORT = '/report'

// Notifications
export const READ_MARKER = '/notification/read_state'
export const NOTIFICATIONS = '/notification'

// Upload
export const UPLOAD = '/upload'
