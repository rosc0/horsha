import React, { PureComponent } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import Text from '@components/Text'
import Button from '@components/Button'
import { theme } from '@styles/theme'

const noop = () => {}

const images = {
  share: require('@images/share.png'),
  like: require('@images/icons/heart.png'),
  comment: require('@images/icons/comment.png'),
}

class BottomBar extends PureComponent {
  static defaultProps = {
    onSharePress: noop,
    onLikePress: noop,
    onCommentPress: noop,
    onCancelPress: noop,
    onPostCommentPress: noop,
    commentActiveMode: false,
    likeState: false,
    commentButtonDisabled: false,
    messageTitle: 'newsfeed/post',
    likeButtonDisabled: false,
  }

  render() {
    const {
      onSharePress,
      onLikePress,
      onCommentPress,
      onCancelPress,
      onPostCommentPress,
      commentActiveMode,
      likeState,
      commentButtonDisabled,
      messageTitle,
      likeButtonDisabled,
    } = this.props

    return (
      <View style={styles.fixedBottom}>
        {!commentActiveMode && (
          <View style={styles.inline}>
            {/*<Button
              type='secondary'
              style={styles.button}
              onPress={onSharePress}
            >
              <Image source={images.share} style={styles.facebook} />
            </Button>*/}
            {!likeButtonDisabled && (
              <Button
                type="secondary"
                style={styles.button}
                onPress={onLikePress}
              >
                <Image
                  source={images.like}
                  style={[styles.icon, likeState ? styles.liked : {}]}
                />
                <Text
                  type="title"
                  weight="bold"
                  style={styles.buttonText}
                  message="newsfeed/like"
                />
              </Button>
            )}

            <Button
              type="secondary"
              style={styles.button}
              onPress={onCommentPress}
            >
              <Image source={images.comment} style={styles.icon} />
              <Text
                type="title"
                weight="bold"
                style={styles.buttonText}
                message="newsfeed/comment"
              />
            </Button>
          </View>
        )}

        {commentActiveMode && (
          <View style={styles.inline}>
            <Button
              type="secondary"
              style={styles.button}
              onPress={onCancelPress}
            >
              <Text
                type="title"
                weight="bold"
                style={styles.buttonText}
                message="newsfeed/cancel"
              />
            </Button>

            <Button
              type="secondary"
              disabled={commentButtonDisabled}
              style={[
                styles.button,
                styles.addButton,
                commentButtonDisabled ? styles.disabledButtonStyles : {},
              ]}
              onPress={commentButtonDisabled ? noop : onPostCommentPress}
            >
              <Text
                type="title"
                weight="bold"
                style={[
                  styles.buttonText,
                  styles.addButtonText,
                  commentButtonDisabled ? styles.disabledButtonTextStyles : {},
                ]}
                message={messageTitle}
              />
            </Button>
          </View>
        )}
      </View>
    )
  }
}

// define your styles
const styles = StyleSheet.create({
  fixedBottom: {
    zIndex: 1000,
    height: 50,
    width: '100%',
    left: 0,
    bottom: 0,
  },
  inline: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    height: 50,
  },
  button: {
    width: null,
    height: 30,
    marginTop: 0,
    borderWidth: 1.1,
    borderColor: '#b9b9bc',
    marginHorizontal: 8,
    padding: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  addButton: {
    borderColor: '#238886',
  },
  buttonText: {
    fontSize: theme.font.sizes.smallest,
    color: '#a5a5a9',
  },
  addButtonText: {
    color: '#238886',
  },
  icon: {
    width: 15,
    height: 15,
    tintColor: '#97979c',
    resizeMode: 'contain',
    marginRight: 5,
  },
  liked: {
    tintColor: '#fdb299',
  },
  disabledButtonTextStyles: {
    color: '#ddd',
  },
  disabledButtonStyles: {
    borderColor: '#ddd',
  },
})

export default BottomBar
