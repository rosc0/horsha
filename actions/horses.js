import types from '@constants/actionTypes'
import HorsesClass from '@api/horses'
import NewsClass from '@api/newsfeed'
import { clearImages } from './gallery'
import { refreshNewsfeed } from './newsfeed'

const Horses = new HorsesClass()
const Newsfeed = new NewsClass()

export const getHorses = () => ({
  type: types.GET_HORSES,
  payload: Horses.getHorses(),
})

export const getMoreHorses = cursor => ({
  type: types.GET_MORE_HORSES,
  payload: Horses.getHorses(50, cursor),
})

export const setPreviousStep = () => ({
  type: types.SET_PREVIOUS_STEP,
})

export const setNextStep = () => ({
  type: types.SET_NEXT_STEP,
})

export const addHorse = data => async dispatch => {
  const horse = await dispatch({
    type: types.ADD_HORSE,
    payload: Horses.addHorse(data),
  })

  await dispatch(clearAddHorse())

  return horse
}

export const clearAddHorse = () => ({
  type: types.ADD_HORSE_CLEAR,
})

export const editHorseUser = (horseId, data) => {
  return async dispatch => {
    await dispatch({
      type: types.EDIT_HORSE_USER,
      payload: Horses.editHorseUser(data),
      meta: { horseId, data },
    })

    return dispatch(getHorseUser(horseId))
  }
}

export const setLastAccessedHorse = horseUserId => ({
  type: types.SET_LAST_ACCESSED_HORSE,
  payload: Horses.setLatestHorse(horseUserId),
  meta: { horseUserId },
})

export const getHorseAlbum = (horseId, filter) => ({
  type: types.GET_HORSE_ALBUM,
  payload: Horses.getHorseAlbum(horseId, filter),
})

export const addHorseImage = (horseId, uploadKey) => async dispatch => {
  await dispatch({
    type: types.ADD_HORSE_IMAGE,
    payload: Horses.addHorseImage(horseId, uploadKey),
  })

  return Promise.all([
    dispatch(clearImages()),
    dispatch(getHorseAlbum(horseId)),
  ])
}

export const editHorseImage = (horseId, uploadKey) => async dispatch => {
  await dispatch({
    type: types.SET_HORSE_PROFILE_IMAGE,
    payload: Horses.setHorseProfileImage(horseId, uploadKey),
  })

  return Promise.all([dispatch(clearImages()), dispatch(getHorses())])
}

export const editHorseProfile = (horseId, content) => ({
  type: types.EDIT_HORSE,
  payload: Horses.editHorse(horseId, content),
  meta: { horseId, content },
})

export const deleteHorseImages = imageIds => ({
  type: types.DELETE_HORSE_IMAGE,
  payload: Horses.deleteHorseImage(imageIds),
  meta: {
    imageIds,
  },
})

export const getHorseUser = horseId => ({
  type: types.GET_HORSE_USER,
  payload: Horses.getHorseUser(horseId),
})

export const getHorseJournal = horseId => ({
  type: types.GET_HORSES_JOURNAL,
  payload: Horses.getHorseJournal(horseId),
  meta: { horseId },
})

export const saveHorseJournal = message => async dispatch => {
  const journal = await dispatch({
    type: types.SAVE_HORSE_JOURNAL,
    payload: Horses.saveHorseJournal(message),
  })
  // await dispatch(refreshNewsfeed())
  // await dispatch(getHorseJournal(message.horse_id))
  return journal.value
}

// export const editHorseJournal = (
//   journalId,
//   message,
//   userId,
//   horseId
// ) => async dispatch => {
//   const journal = await dispatch({
//     type: types.EDIT_HORSE_JOURNAL,
//     payload: Horses.editHorseJournal(journalId, message),
//   })
//   await dispatch(refreshNewsfeed())
//   await dispatch(getHorseJournal(horseId))
//   await dispatch(getJournalPost(journalId))
//   return journal.value
// }

export const editHorseJournal = message => async dispatch => {
  const journal = await dispatch({
    type: types.EDIT_HORSE_JOURNAL,
    payload: Horses.editHorseJournal(message),
  })
  // await dispatch(refreshNewsfeed())
  // await dispatch(getHorseJournal(message.horse_id))
  console.log('edit journal', journal)
  return journal.value
}

export const deleteHorseJournal = (horseId, journalId) => ({
  type: types.DELETE_HORSE_JOURNAL,
  payload: Newsfeed.deleteUpdate(journalId),
  meta: { horseId, journalId },
})

export const addFriendToTeam = (horseId, userId) => {
  return async dispatch => {
    await dispatch({
      type: types.ADD_FRIEND_TEAM,
      payload: Horses.addFriendTeam(horseId, userId),
    })

    await dispatch(getHorseUser(horseId))
  }
}

export const getHorseProfile = horseId => async dispatch =>
  dispatch({
    type: types.GET_HORSE_PROFILE,
    payload: Promise.all([
      Horses.getHorseProfile(horseId),
      Horses.getHorseUser(horseId),
      Horses.getHorseAlbum(horseId),
    ]),
  })

export const setHorse = horse => ({
  type: types.SET_HORSE,
  horse,
})

export const selectRide = ride => ({
  type: types.SELECT_RIDE,
  ride,
})

export const unselectRide = ride => ({
  type: types.UNSELECT_RIDE,
  ride,
})

export const toggleSelectImage = image => ({
  type: types.HORSE_TOGGLE_SELECT_IMAGE,
  image,
})

export const clearSelectedImages = () => ({
  type: types.HORSE_CLEAR_SELECTED_IMAGES,
})

export const clearSelectedRides = () => ({
  type: types.HORSE_CLEAR_SELECTED_RIDES,
})

export const editShareScope = (id, shareScope) => ({
  type: types.EDIT_SHARESCOPE,
  payload: Horses.editShareScope(id, shareScope),
})

export const getJournalPost = journalId => ({
  type: types.GET_ENTRY,
  payload: Horses.getJournalPost(journalId),
})

export const getStatusPost = statudId => ({
  type: types.GET_ENTRY,
  payload: Horses.getStatusPost(statudId),
})
