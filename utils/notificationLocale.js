import store from '../store'

// TODO: make a test for this
export default (type, notification) => {
  const { id: userId } = store.getState().user

  if (type === 'journal_entry_created') {
    return {
      entry: 'journalEntry',
      data: {
        user: notification.journal_entry.user.name,
        horse: notification.journal_entry.horse.name,
      },
    }
  }

  if (type === 'friendship_created') {
    const data = {
      friend1: notification.friendship.subject_user.name,
      friend2: notification.friendship.target_user.name,
    }

    if (userId === notification.friendship.subject_user.id) {
      return {
        entry: 'youFriendsWithThem',
        data,
      }
    }

    if (userId === notification.friendship.target_user.id) {
      return {
        entry: 'themFriendsWithYou',
        data,
      }
    }

    return {
      entry: 'friendship',
      data,
    }
  }

  if (type === 'like_created') {
    return {
      entry: 'journalLikeCreated',
      data: {
        user: notification.like.user.name,
        horse: notification.like.journal_entry.horse.name,
      },
    }
  }

  if (type === 'comment_created') {
    return {
      entry: 'commentCreated',
      data: {
        user: notification.comment.user.name,
      },
    }
  }

  if (type === 'horse_user_created') {
    const data = {
      user: notification.horse_user.user.name,
      horse: notification.horse_user.horse.name,
    }

    if (userId === notification.horse_user.user.id) {
      if (notification.horse_user.relation_type === 'owner') {
        return {
          entry: 'youHorseOwnerCreated',
          data,
        }
      }

      return {
        entry: 'youHorseSharerCreated',
        data,
      }
    }

    if (notification.horse_user.relation_type === 'owner') {
      return {
        entry: 'friendHorseOwnerCreated',
        data,
      }
    }

    return {
      entry: 'friendHorseSharerCreated',
      data,
    }
  }

  if (type === 'horse_user_has_become_owner') {
    return {
      entry:
        userId === notification.horse_user.user.id
          ? 'youHorseOwnerChanged'
          : 'friendHorseOwnerChanged',
      data: {
        user: notification.horse_user.user.name,
        horse: notification.horse_user.horse.name,
      },
    }
  }

  if (type === 'horse_user_has_become_sharer') {
    return {
      entry:
        userId === notification.horse_user.user.id
          ? 'youHorseSharerChanged'
          : 'friendHorseSharerChanged',
      data: {
        user: notification.horse_user.user.name,
        horse: notification.horse_user.horse.name,
      },
    }
  }

  if (type === 'horse_user_archived') {
    return {
      entry:
        userId === notification.horse_user.user.id
          ? 'youHorseUserArchived'
          : 'friendHorseUserArchived',
      data: {
        user: notification.horse_user.user.name,
        horse: notification.horse_user.horse.name,
      },
    }
  }

  if (type === 'horse_user_unarchived') {
    return {
      entry:
        userId === notification.horse_user.user.id
          ? 'youHorseUserUnArchived'
          : 'friendHorseUserUnArchived',
      data: {
        user: notification.horse_user.user.name,
        horse: notification.horse_user.horse.name,
      },
    }
  }

  return {
    entry: null,
    data: {},
  }
}
