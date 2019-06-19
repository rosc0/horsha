import React, { PureComponent } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import Autolink from 'react-native-autolink'
import ActionSheet from 'rn-action-sheet'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import t from '@config/i18n'
import * as appActions from '@actions/app'
import { theme } from '@styles/theme'

import ArrowOptions from '@components/ArrowOptions'
import BottomBar from './BottomBar'

import Avatar from '@components/Avatar'
import UserLink from '@components/UserLink'
import Text from '@components/Text'
import AnimatedTextInput from '@components/AnimatedTextInput'
import { fromNowDateUnix } from '@utils'

const { width } = Dimensions.get('window')

class Comment extends PureComponent {
  static defaultProps = {
    details: { body: '' },
  }

  state = {
    editMode: false,
    comment: this.props.details.text,
    originalComment: '',
    hide: false,
    edited: false,
  }

  showActionSheet = () => {
    const { user } = this.props.user
    const { details: item, navigation } = this.props
    const isOwner = user.id === item.author.id

    const commentOwnerOptions = t('newsfeed/commentOwnerActions')
    const commentOptions = t('newsfeed/commentActions')

    const options = isOwner
      ? commentOwnerOptions.split('|')
      : commentOptions.split('|')

    const cancelButtonIndex = isOwner ? 2 : 1
    const destructiveButtonIndex = isOwner ? 1 : 2

    ActionSheet.show(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
        tintColor: theme.secondaryColor,
        title: t('common/chooseYourOption'),
      },
      index => this.handleActionSheet(index, isOwner)
    )
  }

  handleActionSheet = (index, isOwner) => {
    if (isOwner) {
      if (index === 0) this.editComment()
      if (index === 1) this.removeComment()
    } else {
      if (index === 0) this.reportComment()
    }
  }

  editComment = () => {
    this.setState(state => ({
      editMode: true,
      originalComment: state.comment,
    }))
    this.props.onEditStart && this.props.onEditStart(this.props.commentId)
    this.input.focus()
  }

  updateComment = () => {
    this.setState({
      editMode: false,
      edited: true,
      originalComment: '',
    })

    this.props.onEditFinish && this.props.onEditFinish()
    this.props.updateComment(this.props.details.id, this.state.comment)
    this.input.blur()
  }

  cancelUpdateComment = () => {
    this.setState(state => ({
      editMode: false,
      comment: state.originalComment,
    }))

    this.props.onEditFinish && this.props.onEditFinish()
    this.input.blur()
  }

  removeComment = () => {
    this.setState({ hide: true })
    this.props.removeComment(this.props.details.id)
  }

  reportComment = () => {
    const { navigation, details } = this.props
    navigation.navigate('Report', { endpoint: `comment/${details.id}` })
  }

  truncate = (source, isEdited) => {
    let size = 30

    if (width <= 500) {
      size = isEdited ? 48 : 54
    }

    if (width <= 375) {
      size = isEdited ? 36 : 45
    }

    if (width <= 320) {
      size = isEdited ? 30 : 36
    }

    return source.length > size ? source.slice(0, size - 1) + '...' : source
  }

  handleYou = () => this.props.openEdit(this.props.index)

  render() {
    const { editMode, comment, hide, edited } = this.state
    const { details: item, navigation } = this.props

    if (hide) return null

    const writeCommentPlaceholder = t('newsfeed/placeholder')

    return (
      <React.Fragment>
        <View style={styles.commentsItem} key={item.id}>
          <UserLink userId={item.author.id} navigation={navigation}>
            <Avatar
              newModel
              profile={item.author}
              type="user"
              style={styles.avatar}
            />
          </UserLink>

          <View style={styles.commentContainer}>
            {editMode ? (
              <AnimatedTextInput
                onLayout={event => {
                  this.handleYou(event)
                }}
                renderToHardwareTextureAndroid={true}
                ref={ref => (this.input = ref)}
                value={comment}
                onChangeText={comment => this.setState({ comment })}
                inputContainerStyle={styles.inputContainer}
                inputStyle={styles.editInput}
                autoFocus={true}
                placeholder={writeCommentPlaceholder}
                defaultMultiLineHeight={60}
                multiLine={true}
                marginTop={-8}
              />
            ) : (
              <View>
                <View style={styles.commentHeader}>
                  <UserLink userId={item.author.id} navigation={navigation}>
                    <Text
                      type="title"
                      style={styles.author}
                      text={this.truncate(
                        item.author.name,
                        !!item.last_edited || edited
                      )}
                    />
                  </UserLink>

                  {!!item.last_edited ||
                    (edited && (
                      <Text
                        style={styles.edited}
                        text={`(${t('newsfeed/edited')})`}
                      />
                    ))}

                  <ArrowOptions
                    wrapperStyle={styles.arrowOptions}
                    style={styles.arrowOptionsIcon}
                    onPress={this.showActionSheet}
                  />
                </View>
                <View style={styles.commentText}>
                  <Autolink
                    showAlert
                    linkStyle={styles.link}
                    style={styles.comment}
                    text={comment.replace(/\s{2,}/g, ' ')}
                  />
                </View>
                <Text
                  style={styles.timeText}
                  type="none"
                  text={fromNowDateUnix(item.dateCreated).trim()}
                />
              </View>
            )}
          </View>
        </View>
        {editMode && (
          <BottomBar
            onSharePress={() => {}}
            onLikePress={() => {}}
            onCommentPress={() => {}}
            onCancelPress={this.cancelUpdateComment}
            onPostCommentPress={this.updateComment}
            commentActiveMode={true}
            commentButtonDisabled={comment.length <= 3}
            messageTitle="newsfeed/update"
          />
        )}
      </React.Fragment>
    )
  }
}

const styles = StyleSheet.create({
  commentsItem: {
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    marginRight: 10,
    marginTop: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    fontSize: theme.font.sizes.smaller,
    backgroundColor: '#ffede7',
    color: '#e09e88',
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginTop: 2,
    marginLeft: 5,
  },
  author: {
    flex: 1,
    ...theme.font.userName,
  },
  timeText: {
    ...theme.font.date,
  },
  commentText: {
    marginTop: 5,
  },
  comment: {
    fontSize: theme.font.default.fontSize,
    lineHeight: 20,
    color: theme.fontColorDark,
  },
  link: {
    color: theme.secondaryColor,
  },
  arrowOptions: {
    width: 30,
    height: 30,
    paddingLeft: 30,
    paddingBottom: 30,
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 100,
    elevation: 100,
    alignItems: 'flex-end',
  },
  arrowOptionsIcon: {
    width: 15,
    height: 15,
  },
  commentContainer: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editModeButtons: {
    marginTop: 10,
    flexDirection: 'row',
    alignSelf: 'flex-end',
  },
  saveButton: {
    width: null,
    borderWidth: 1,
    borderColor: theme.secondaryColor,
    padding: 8,
  },
  saveButtonText: {
    fontSize: theme.font.sizes.smallest,
  },
  cancelButton: {
    padding: 2,
    borderColor: theme.borderDark,
    borderWidth: 1,
    alignSelf: 'flex-end',
    backgroundColor: 'white',
    marginRight: 5,
  },
  cancelButtonText: {
    fontSize: theme.font.sizes.smallest,
    color: theme.borderDark,
  },
  inputContainer: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
    marginTop: 0,
    paddingTop: 0,
  },
  editInput: {
    backgroundColor: '#f5f5f7',
    borderRadius: 3,
  },
  edited: {
    fontSize: theme.font.sizes.smaller,
    color: theme.fontColorLight,
    marginLeft: 5,
  },
  button: {
    width: null,
    height: 30,
    marginTop: 0,
    borderWidth: 1.1,
    borderColor: '#b9b9bc',
    marginHorizontal: 8,
    padding: 2,
    paddingHorizontal: 14,
    justifyContent: 'center',
    flexDirection: 'row',
  },
})

export default connect(
  state => ({ user: state.user }),
  dispatch => ({
    actions: bindActionCreators({ ...appActions }, dispatch),
  }),
  null,
  { forwardRef: true }
)(Comment)
