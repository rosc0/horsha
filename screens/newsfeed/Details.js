import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  findNodeHandle,
  Dimensions,
} from 'react-native'
import KeyboardSpacer from '@components/KeyboardSpacer'
import BackButton from '@components/BackButton'
import idx from 'idx'

import * as newsActions from '@actions/newsfeed'
import * as horseActions from '@actions/horses'
import { theme } from '@styles/theme'
import t from '@config/i18n'
import JournalEntry from '@components/journal/JournalEntry'
import Avatar from '@components/Avatar'
import HeaderTitle from '@components/HeaderTitle'
import AnimatedTextInput from '@components/AnimatedTextInput'
import Loading from '@components/Loading'
import Text from '@components/Text'
import Comment from './details/Comment'
import NoComments from './details/NoComments'
import BottomBar from './details/BottomBar'
import { GET_NEWSFEED_ITEM } from '../../apollo/queries/NewsFeedCollection'
import { Query } from 'react-apollo'
import { GET_POST_COMMENTS } from '../../apollo/queries/PostCollection'

const sizes = new Map()
const { width } = Dimensions.get('window')
const maxItems = 5
class NewsfeedDetails extends PureComponent {
  timoutId = null
  isLike = false
  subject = null

  constructor(props) {
    super(props)
    this.scrollView = React.createRef()
    this.commentsRef = React.createRef()
  }

  static navigationOptions = ({ navigation }) => ({
    headerTitle: <HeaderTitle title={'newsfeed/journalTitle'} />,
    headerLeft: (
      <BackButton onPress={() => navigation.goBack(null)}>
        {t('common/cancel')}
      </BackButton>
    ),
    tabBarVisible: false,
  })

  state = {
    entry: null,
    viaComment: false,
    via: false,
    horseId: false,
    contentType: null,
    commentText: '',
    showPostActions: false,
    showBottomBar: true,
    block: false,
  }

  // toggleLike = async item => {
  //   const { post, status_update } = item.subject
  //   // const likeId = post ? post.likedSince : status_update.likedSince
  //   const contentId = post ? post.id : status_update.id
  //   const isLiked = !!post.likedSince

  //   const likeable = await this.props.actions.toggleLike(isLiked, contentId)
  // }

  toggleLike = async () => {
    const { post, status_update } = this.subject
    console.log('this.subject', this.subject)
    // const likeId = post ? post.likedSince : status_update.likedSince
    const contentId = post ? post.id : status_update.id
    const isLiked = !!post.likedSince

    await this.props.actions.toggleLike(isLiked, contentId)
  }

  goToAddComment = (focus = true) => {
    if (this.scrollView !== null && this.scrollView !== undefined) {
      this.timoutId = setTimeout(() => {
        if (this.props.comments.fetched) {
          this.scrollView.current.scrollToEnd({ animated: true })

          // if (focus) {
          //   this.input.focus()
          // }
          this.setState({ block: true, viaComment: false })
        }
      }, 0)
    }
  }

  openPostActions = () => {
    this.setState({ showPostActions: true })
    this.goToAddComment()
  }

  closePostActions = () => {
    this.setState({ showPostActions: false, commentText: '' })
    this.input.blur()
  }

  addComment = postId => {
    const { commentText } = this.state
    this.props.actions.addComment(postId, commentText)
    this.closePostActions()
    this.goToAddComment(false)
  }

  updateComment = (commentId, comment) => {
    const postId = this.props.navigation.getParam('journalId', '')

    this.props.actions.updateComment(commentId, postId, comment)
  }

  openEdit = async index => {
    this.timoutId = setTimeout(() => {
      this.commentsRef.current.measureLayout(
        // I needed to do this to work and measure on android
        findNodeHandle(this.scrollView.current),
        (x, oy) => {
          this.scrollView.current.scrollTo({
            x,
            y: oy + sizes.get(index) - 140,
            animated: true,
          })
        }
      )
    }, 0)
  }

  removeComment = commentId => {
    const postId = this.props.navigation.getParam('journalId', '')

    this.props.actions.removeComment(
      commentId,
      postId //post id
    )
  }

  loadPreviousComments = async (fetchMore, pageInfo, collection) => {
    await fetchMore({
      variables: { cursor: pageInfo.next, maxItems },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return previousResult
        }

        const previousEntry = previousResult.postComments.collection
        const newCollection = fetchMoreResult.postComments.collection

        let hasMoreListings = collection.length % maxItems === 0
        if (!hasMoreListings) {
          return previousResult
        }
        if (newCollection.length < maxItems) {
          hasMoreListings = false
        }

        const result = {
          postComments: {
            ...fetchMoreResult.postComments,
            collection: [...previousEntry, ...newCollection],
            __typename: previousResult.postComments.__typename,
          },
        }

        return result
      },
    })
  }

  loadMoreComments = async () => {
    const { comments } = this.props
    const { contentType } = this.state

    await this.props.actions.getMoreComments(
      this.props.detail.entry.id,
      contentType,
      comments.previous
    )
  }

  onEditStart = () => {
    this.setState({ showBottomBar: false })
  }

  onEditFinish = () => this.setState({ showBottomBar: true })

  componentWillUnmount() {
    if (this.timoutId !== null) {
      clearTimeout(this.timoutId)
    }
  }

  render() {
    const {
      showPostActions,
      commentText,
      via,
      horseId,
      showBottomBar,
    } = this.state

    const { user } = this.props.user
    // const isLiked = true
    const postId = this.props.navigation.getParam('journalId', '')

    return (
      <View style={styles.wrapper}>
        <ScrollView
          ref={this.scrollView}
          style={styles.flex}
          keyboardShouldPersistTaps="handled"
        >
          <Query query={GET_NEWSFEED_ITEM} variables={{ postId }}>
            {({ loading, error, data }) => {
              if (loading) return <Loading type="spinner" />
              if (error) return console.log(`Error! ${error.message}`)

              const entry = {
                type: 'post_published',
                subject: {
                  post: data.post,
                },
              }

              this.isLike = data && data.post && !!data.post.likedSince
              this.subject = entry.subject
              // this.setState({ subject: entry.subject })
              //   const { post, status_update } = item.subject

              return (
                <JournalEntry
                  navigate={this.props.navigation.navigate}
                  navigation={this.props.navigation}
                  entry={entry}
                  userId={user.id}
                  onPress={() => {}}
                  wrapperStyle={styles.journalEntry}
                  onCommentPress={this.goToAddComment}
                  isHorseJournal={via}
                  horseId={horseId}
                  isDetails={true}
                />
              )
            }}
          </Query>

          <Query query={GET_POST_COMMENTS} variables={{ postId, maxItems }}>
            {({ loading, error, data, fetchMore }) => {
              if (loading) return <Loading type="spinner" />
              if (error) return console.log(`Error! ${error.message}`)

              const {
                postComments: { collection, pageInfo },
              } = data
              const commentsBefore = pageInfo.remaining > 0

              return (
                <View
                  ref={this.commentsRef}
                  style={{ opacity: 1 }}
                  collapsable={false}
                  removeClippedSubviews={false}
                  style={styles.commentsWrapper}
                >
                  {collection.length > 0 ? (
                    <View>
                      {commentsBefore && (
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() =>
                            this.loadPreviousComments(
                              fetchMore,
                              pageInfo,
                              collection
                            )
                          }
                        >
                          <Text
                            weight="semiBold"
                            message="newsfeed/viewNumberMoreComments"
                            values={{ numberOfComments: pageInfo.remaining }}
                            style={styles.loadPrevious}
                          />
                        </TouchableOpacity>
                      )}
                      {collection
                        .map((comment, i) => (
                          <View
                            key={comment.id}
                            onLayout={event => {
                              const { y, height } = event.nativeEvent.layout
                              sizes.set(i, y + height)
                            }}
                          >
                            <Comment
                              index={i}
                              details={comment}
                              authorId={comment.author.id}
                              navigation={this.props.navigation}
                              removeComment={this.removeComment}
                              updateComment={this.updateComment}
                              openEdit={this.openEdit}
                              onEditStart={this.onEditStart}
                              onEditFinish={this.onEditFinish}
                            />
                          </View>
                        ))
                        .reverse()}
                    </View>
                  ) : (
                    <NoComments />
                  )}
                </View>
              )
            }}
          </Query>

          {showBottomBar && (
            <View style={[styles.addCommentWrapper]}>
              <Avatar profile={user} type="user" style={styles.avatarComment} />

              <AnimatedTextInput
                ref={ref => (this.input = ref)}
                onFocus={this.openPostActions}
                autoFocus={this.state.viaComment}
                value={commentText}
                onChangeText={commentText => this.setState({ commentText })}
                inputContainerStyle={{
                  borderTopWidth: 0,
                  borderBottomWidth: 0,
                  padding: 0,
                  paddingRight: 10,
                  margin: 0,
                  width: width - 35,
                }}
                inputStyle={styles.input}
                placeholder={t('newsfeed/writeComment')}
                defaultMultiLineHeight={80}
                multiLine={true}
                marginTop={0}
              />
            </View>
          )}
        </ScrollView>

        {showBottomBar && (
          <BottomBar
            onSharePress={() => {}}
            onLikePress={() => this.toggleLike()}
            onCommentPress={this.goToAddComment}
            onCancelPress={this.closePostActions}
            onPostCommentPress={() => this.addComment(postId)}
            commentActiveMode={showPostActions}
            commentButtonDisabled={commentText.length <= 3}
            likeState={!this.isLike}
          />
        )}

        <KeyboardSpacer />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    height: '100%',
    backgroundColor: 'white',
  },
  journalEntry: {
    marginBottom: 0,
    borderTopWidth: 0,
    paddingTop: 20,
  },
  addCommentWrapper: {
    backgroundColor: 'white',
    marginBottom: 50,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#efefef',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  input: {
    color: theme.fontColorDark,
    fontSize: theme.font.sizes.default,
    padding: 0,
    margin: 0,
    marginRight: 15,
    textAlignVertical: 'top',
    marginVertical: 0,
  },
  commentsWrapper: {
    flex: 1,
    padding: 10,
    paddingHorizontal: 15,
    paddingTop: 30,
    borderTopWidth: 1,
    borderColor: '#efefef',
  },
  avatarComment: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    marginLeft: 10,
    marginTop: 10,
  },
  loadPrevious: {
    fontSize: theme.font.sizes.small,
    color: theme.secondaryColor,
    paddingBottom: 30,
  },
  loadMore: {
    fontSize: theme.font.sizes.small,
    color: theme.secondaryColor,
  },
})

export default connect(
  state => ({
    user: state.user,
    comments: state.comments,
    news: state.news,
    horseJournal: state.horses.journal,
    detail: state.horses.detail,
  }),
  dispatch => ({
    actions: bindActionCreators({ ...newsActions, ...horseActions }, dispatch),
  })
)(NewsfeedDetails)
