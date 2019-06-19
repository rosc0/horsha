import types from '@constants/actionTypes'
import moment from 'moment'
import idx from 'idx'

export const ADD_HORSE_STEPS = {
  NAME: 'NAME',
  IMAGE: 'IMAGE',
  INFO: 'INFO',
  DESCRIPTION: 'DESCRIPTION',
  CARE: 'CARE',
}

export const HORSE_GENDERS = {
  MARE: 'mare',
  STALLION: 'stallion',
  GELDING: 'Gelding',
}

export const RELATION_TYPES = {
  OWNER: 'owner',
  SHARER: 'sharer',
  ARCHIVED: 'archived',
}

export const INITIAL_ALBUM_STATE = {
  fetching: true,
  pictures: [],
  upload: {
    isUploading: false,
    uploaded: false,
    errored: false,
  },
  selectedImages: [],
}

export const initialState = {
  horses: [],
  horsesRemaining: 0,
  cursor: null,
  fetched: false,
  error: false,
  fetching: false,
  journal: {
    fetching: false,
    fetched: false,
    error: false,
    //horseId: { ...journal }
  },
  addHorse: {
    error: false,
    fetching: false,
    step: ADD_HORSE_STEPS.NAME,
  },
  album: INITIAL_ALBUM_STATE,
  team: {
    fetching: true,
    users: [],
    owners: [],
  },
  profile: {
    fetched: false,
    fetching: true,
    name: null,
    breed: null,
    color: null,
    gender: null,
    weight: null,
    height: null,
    birth: null,
    dateCreated: null,
    description: null,
    image: '',
    horseCare: null,
    stats: {
      distance: 0,
      duration: 0,
      rides: 0,
    },
  },
  horseUser: null,
  horse: null,
  selectedRides: [],
  forceUpdate: null,
  horsePictureChanged: 0,
  detail: {
    entry: null,
    fetching: false,
    fetched: false,
    error: false,
  },
}

const steps = Object.values(ADD_HORSE_STEPS)

export default (state = initialState, action = {}) => {
  const horse = idx(action, _ => _.payload.collection[0].horse)

  switch (action.type) {
    case types.GET_HORSES_PENDING: {
      return {
        ...state,
        fetching: true,
        fetched: false,
      }
    }

    case types.GET_HORSES_FULFILLED: {
      return {
        ...state,
        horse: horse ? horse : initialState.horse,
        horses: action.payload.collection || [],
        horsesRemaining: action.payload.remaining,
        cursor: action.payload.cursor,
        fetched: true,
        fetching: false,
      }
    }

    case types.GET_MORE_HORSES_FULFILLED: {
      return {
        ...state,
        horses: [...state.horses, ...action.payload.collection],
        horsesRemaining: action.payload.remaining,
        cursor: action.payload.cursor,
        fetched: true,
        fetching: false,
      }
    }

    case types.GET_HORSES_REJECTED: {
      return {
        ...state,
        error: true,
        fetching: false,
      }
    }

    case types.SET_HORSE: {
      const { horse } = action

      return {
        ...state,
        horse,
      }
    }

    case types.SELECT_RIDE: {
      const { ride } = action

      return {
        ...state,
        selectedRides: [
          ...state.selectedRides,
          {
            id: ride.id,
            distance: ride.distance,
            duration: ride.duration,
            maxSpeed: ride.max_speed,
            previewTrackUrl: ride.preview_track_url,
            boundBox: ride.bounding_box,
          },
        ],
      }
    }

    case types.UNSELECT_RIDE: {
      const { id } = action.ride

      return {
        ...state,
        selectedRides: state.selectedRides.filter(
          selectedRide => selectedRide.id !== id
        ),
      }
    }

    case types.ADD_HORSE_IMAGE_PENDING: {
      return {
        ...state,
        album: {
          ...state.album,
          upload: {
            ...state.album.upload,
            isUploading: true,
          },
        },
      }
    }

    case types.ADD_HORSE_IMAGE_FULFILLED: {
      return {
        ...state,
        album: {
          ...state.album,
          upload: {
            ...state.album.upload,
            isUploading: false,
            uploaded: true,
            errored: false,
          },
        },
      }
    }

    case types.ADD_HORSE_IMAGE_REJECTED: {
      return {
        ...state,
        album: {
          ...state.album,
          upload: {
            ...state.album.upload,
            isUploading: false,
            uploaded: false,
            errored: true,
          },
        },
      }
    }

    case types.ADD_HORSE_PENDING: {
      return {
        ...state,
        addHorse: {
          ...state.addHorse,
          fetching: true,
        },
      }
    }

    case types.ADD_HORSE_REJECTED: {
      return {
        ...state,
        error: true,
        addHorse: {
          error: true,
          ...state.addHorse,
          fetching: false,
        },
      }
    }

    case types.ADD_HORSE_FULFILLED: {
      return {
        ...state,
        addHorse: {
          ...state.addHorse,
          fetching: false,
        },
      }
    }

    case types.ADD_HORSE_CLEAR: {
      return {
        ...state,
        addHorse: initialState.addHorse,
      }
    }

    case types.SET_PREVIOUS_STEP: {
      const prevStep = steps.findIndex(step => step === state.addHorse.step) - 1

      return {
        ...state,
        addHorse: {
          ...state.addHorse,
          step: steps[prevStep],
        },
      }
    }

    case types.SET_NEXT_STEP: {
      const currentStepIndex = steps.findIndex(
        step => step === state.addHorse.step
      )
      const nextStep = currentStepIndex + 1

      return {
        ...state,
        addHorse: {
          ...state.addHorse,
          step: steps[nextStep],
        },
      }
    }

    case types.GET_HORSE_ALBUM: {
      return {
        ...state,
        album: {
          ...state.album,
          fetching: true,
        },
      }
    }

    case types.GET_HORSE_ALBUM_FULFILLED: {
      return {
        ...state,
        album: {
          ...state.album,
          fetching: false,
          pictures: action.payload.collection
            ? action.payload.collection.map(picture => ({
                key: picture.id,
                image: picture.picture.url,
                height: picture.picture.height,
                width: picture.picture.width,
                canDeleteImage: picture.can_delete,
              }))
            : [],
        },
      }
    }

    case types.DELETE_HORSE_IMAGE_FULFILLED: {
      return {
        ...state,
        album: {
          ...state.album,
          pictures: state.album.pictures.filter(
            ({ key }) => !action.meta.imageIds.includes(key)
          ),
        },
      }
    }

    case types.HORSE_TOGGLE_SELECT_IMAGE: {
      const { image } = action

      const isImageSelected =
        state.album.selectedImages.findIndex(({ id }) => id === image.id) !== -1

      return {
        ...state,
        album: {
          ...state.album,
          selectedImages: isImageSelected
            ? state.album.selectedImages.filter(({ id }) => id !== image.id)
            : [...state.album.selectedImages, image],
        },
      }
    }

    case types.HORSE_CLEAR_SELECTED_IMAGES: {
      return {
        ...state,
        album: {
          ...state.album,
          selectedImages: initialState.album.selectedImages,
        },
      }
    }

    case types.HORSE_CLEAR_SELECTED_RIDES: {
      return {
        ...state,
        selectedRides: [],
      }
    }

    case types.GET_HORSE_USER: {
      return {
        ...state,
        team: {
          ...initialState.team,
          fetching: true,
        },
      }
    }

    case types.GET_HORSE_USER_FULFILLED: {
      const users = action.payload.collection
        ? action.payload.collection.map(horseUser => ({
            key: horseUser.user.id,
            name: horseUser.user.name,
            image:
              horseUser.user.profile_picture &&
              horseUser.user.profile_picture.url,
            createdAt: horseUser.date_created,
            relationType: horseUser.relation_type,
            horseUserId: horseUser.id,
          }))
        : []

      return {
        ...state,
        horseUser: action.payload.collection[0],
        team: {
          ...state.team,
          fetching: false,
          users,
          owners: users.map(
            user => user.relationType === RELATION_TYPES.OWNER && user.key
          ),
        },
      }
    }

    case types.EDIT_HORSE_USER: {
      return {
        ...state,
        fetching: true,
      }
    }

    case types.EDIT_HORSE_USER_FULFILLED: {
      const { horseId, data } = action.meta
      return {
        ...state,
        horses: data.isCurrentUser
          ? state.horses.map(item => {
              if (item.horse && item.horse.id === horseId) {
                item.relation_type = data.relation_type
              }
              return item
            })
          : state.horses,
        fetching: false,
      }
    }

    case types.GET_HORSES_JOURNAL_PENDING: {
      return {
        ...state,
        journal: {
          ...state.journal,
          fetching: true,
          fetched: false,
          error: false,
        },
      }
    }

    case types.GET_HORSES_JOURNAL_FULFILLED: {
      const { payload, meta } = action

      if (!payload || !payload.collection) return state

      const collection = payload.collection.reduce((acc, val) => {
        return acc.concat({
          subject: {
            type: 'journal_entry_created',
            journal_entry: val,
          },
        })
      }, [])

      return {
        ...state,
        journal: {
          ...state.journal,
          [meta.horseId]: collection,
          fetched: true,
          fetching: false,
          error: false,
        },
      }
    }

    case types.GET_HORSES_JOURNAL_REJECTED: {
      return {
        ...state,
        journal: {
          ...state.journal,
          fetching: false,
          fetched: false,
          error: true,
        },
      }
    }

    case types.GET_HORSE_PROFILE_PENDING: {
      return {
        ...state,
        profile: {
          ...initialState.profile,
          fetching: true,
        },
        team: initialState.team,
      }
    }

    case types.GET_HORSE_PROFILE_FULFILLED: {
      const [profile, horseUsers, album] = action.payload

      const {
        name,
        gender,
        breed,
        color,
        weight,
        height,
        birthday: birth,
        description,
        care_info,
        profile_picture,
        riding_stats,
        date_created,
      } = profile

      return {
        ...state,
        profile: {
          ...state.profile,
          fetching: false,
          fetched: true,
          name,
          gender,
          breed,
          color,
          weight: weight && weight.value,
          height: height && height.value,
          birth,
          description,
          dateCreated: date_created,
          horseCare: care_info,
          image: profile_picture ? profile_picture.url : null,
          stats: {
            distance: riding_stats && riding_stats.total_distance,
            rides: riding_stats && riding_stats.nr_of_rides,
            duration: riding_stats && riding_stats.total_duration,
          },
        },
        album: {
          ...state.album,
          fetching: false,
          pictures: album.collection
            ? album.collection.map(picture => ({
                key: picture.id,
                image: picture.picture.url,
              }))
            : [],
        },
        team: {
          ...state.team,
          fetching: false,
          users: horseUsers.collection
            ? horseUsers.collection.map(horseUser => ({
                key: horseUser.user.id,
                name: horseUser.user.name,
                image:
                  horseUser.user.profile_picture &&
                  horseUser.user.profile_picture.url,
                createdAt: horseUser.date_created,
                relationType: horseUser.relation_type,
                horseUserId: horseUser.id,
              }))
            : [],
        },
      }
    }

    case types.SET_LAST_ACCESSED_HORSE_FULFILLED: {
      const { horseUserId } = action.meta

      const key = state.horses
        .map(horseUser => horseUser.id)
        .indexOf(horseUserId)
      const horse = state.horses.splice(key, 1)

      return {
        ...state,
        horse: horse[0].horse,
        album: INITIAL_ALBUM_STATE,
        horses: horse.concat(state.horses),
      }
    }

    case types.DELETE_HORSE_JOURNAL_FULFILLED: {
      const { horseId, journalId } = action.meta

      return {
        ...state,
        journal: {
          ...state.journal,
          [horseId]: state.journal[horseId].filter(
            item => item.subject.journal_entry.id !== journalId
          ),
        },
        forceUpdate: new Date().getTime(),
      }
    }

    case types.EDIT_HORSE_FULFILLED: {
      const { meta } = action

      return {
        ...state,
        horsePictureChanged: state.horsePictureChanged + 1,
        profile: {
          ...state.profile,
          ...meta.content,
          birth: meta.content.birthday,
        },
        horses: state.horses.map(item => {
          if (item.horse && item.horse.id === meta.horseId) {
            item.horse.name = meta.content.name
            item.horse.breed = meta.content.breed
            item.horse.color = meta.content.color
            item.horse.gender = meta.content.gender
            item.horse.weight = meta.content.weight
            item.horse.height = meta.content.height
            item.horse.birth = meta.content.birthday
              ? moment(meta.content.birthday).format('YYYY-MM-DD')
              : moment().format('YYYY-MM-DD')
            item.horse.description = meta.content.description
          }

          return item
        }),
      }
    }

    case types.GET_ENTRY_PENDING: {
      return {
        ...state,
        detail: {
          ...state.detail,
          fetched: false,
          fetching: true,
        },
      }
    }

    case types.GET_ENTRY_FULFILLED: {
      return {
        ...state,
        detail: {
          ...state.detail,
          entry: action.payload,
          fetched: true,
          fetching: false,
        },
      }
    }

    case types.TOGGLE_LIKE_FULFILLED: {
      let newEntryState = {
        ...state.detail.entry,
      }

      if (
        state.detail.entry &&
        state.detail.entry.id === action.meta.contentId
      ) {
        let nr_of_likes = state.detail.entry.nr_of_likes

        if (action.payload.id) {
          newEntryState.like_id = action.payload.id
          newEntryState.nr_of_likes = nr_of_likes + 1
        } else if (action.payload.status === 204) {
          newEntryState.like_id = null
          newEntryState.nr_of_likes = nr_of_likes - 1
        }
      }

      let newJournalState = {
        ...state.journal,
      }

      if (action.meta.horseId && state.journal[action.meta.horseId]) {
        newJournalState = {
          ...state.journal,
          [action.meta.horseId]: state.journal[action.meta.horseId].map(
            item => {
              const contentType = action.meta.contentType
              const content = item.subject[contentType]

              if (content && content.id === action.meta.contentId) {
                if (action.payload.id) {
                  item.subject[contentType].like_id = action.payload.id
                  item.subject[contentType].nr_of_likes =
                    content.nr_of_likes + 1
                } else if (action.payload.status === 204) {
                  item.subject[contentType].like_id = null
                  item.subject[contentType].nr_of_likes =
                    content.nr_of_likes - 1
                }
              }

              return item
            }
          ),
        }
      }

      return {
        ...state,
        detail: {
          ...state.detail,
          entry: newEntryState,
        },
        journal: newJournalState,
        toggle: new Date().getTime(),
      }
    }

    // case types.REMOVE_COMMENT_FULFILLED: {
    //   let nr_of_comments = state.detail.entry.nr_of_comments

    //   if (state.detail.entry.id === action.meta.contentId) {
    //     nr_of_comments = nr_of_comments - 1
    //   }

    //   let newJournalState = {
    //     ...state.journal,
    //   }

    //   if (action.meta.horseId && state.journal[action.meta.horseId]) {
    //     newJournalState = {
    //       ...state.journal,
    //       [action.meta.horseId]: state.journal[action.meta.horseId].map(
    //         item => {
    //           const content = item.subject[action.meta.contentType]

    //           if (content && content.id === action.meta.contentId) {
    //             item.subject[action.meta.contentType].nr_of_comments =
    //               content.nr_of_comments - 1
    //           }

    //           return item
    //         }
    //       ),
    //     }
    //   }

    //   return {
    //     ...state,
    //     detail: {
    //       ...state.detail,
    //       entry: {
    //         ...state.detail.entry,
    //         nr_of_comments,
    //       },
    //     },
    //     journal: newJournalState,
    //   }
    // }

    // case types.ADD_COMMENT_FULFILLED: {
    //   // let nr_of_comments = state.detail.entry.nr_of_comments
    //   let nr_of_comments = 0

    //   if (state.detail.entry.id === action.meta.contentId) {
    //     nr_of_comments = nr_of_comments + 1
    //   }

    //   let newJournalState = {
    //     ...state.journal,
    //   }

    //   if (action.meta.horseId && state.journal[action.meta.horseId]) {
    //     newJournalState = {
    //       ...state.journal,
    //       [action.meta.horseId]: state.journal[action.meta.horseId].map(
    //         item => {
    //           const content = item.subject[action.meta.contentType]

    //           if (content && content.id === action.meta.contentId) {
    //             item.subject[action.meta.contentType].nr_of_comments =
    //               content.nr_of_comments + 1
    //           }

    //           return item
    //         }
    //       ),
    //     }
    //   }

    //   return {
    //     ...state,
    //     detail: {
    //       ...state.detail,
    //       entry: {
    //         ...state.detail.entry,
    //         nr_of_comments,
    //       },
    //     },
    //     journal: newJournalState,
    //   }
    // }

    default: {
      return state
    }
  }
}
