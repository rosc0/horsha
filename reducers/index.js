import { combineReducers } from 'redux'

import app from './app'
import settings from './settings'
import auth from './auth'
import user from './user'
import trails from './trails'
import poi from './poi'
import map from './map'
import notifications from './notifications'
import news from './newsfeed'
import comments from './comments'
import friends from './friends'
import friendInvitations from './friendInvitations'
import friendSuggestions from './friendSuggestions'
import horses from './horses'
import gallery from './gallery'
import record from './record'
import rides from './rides'

export default combineReducers({
  app,
  settings,
  auth,
  user,
  trails,
  poi,
  map,
  friends,
  friendInvitations,
  friendSuggestions,
  notifications,
  horses,
  gallery,
  news,
  comments,
  record,
  rides,
})
