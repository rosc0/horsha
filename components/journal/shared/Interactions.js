import React, { PureComponent } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import Text from '@components/Text'
import { IconImage } from '../../Icons'
import { formatLikeNumber } from '@utils'

/**
 * <Interactions
 *   isLiked={false}
 *   likes={likes_amount}
 *   comments={comments_amount}
 *   likePress={() => {}}
 *   commentPress={() => {}}
 * />
 */

class Interactions extends PureComponent {
  state = { isLiked: false }

  static getDerivedStateFromProps(props, state) {
    if (props.isLiked !== state.isLiked) {
      return {
        isLiked: props.isLiked,
      }
    }

    return null
  }

  onLikePress = () =>
    this.setState({ isLiked: !this.state.isLiked }, () =>
      this.props.onLikePress()
    )

  render() {
    const { likes, comments, onCommentPress } = this.props
    const { isLiked } = this.state
    const likeStyles = [styles.icon, isLiked ? styles.active : {}]

    return (
      <View style={styles.wrapper}>
        <TouchableOpacity style={styles.button} onPress={this.onLikePress}>
          <IconImage source="likeIcon" style={likeStyles} />

          <Text
            type="title"
            weight="bold"
            style={styles.count}
            text={`${likes > 0 ? likes : ''} Like${likes === 1 ? '' : 's'}`}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={onCommentPress}>
          <IconImage source="commentIcon" style={styles.icon} />

          <Text
            type="title"
            weight="bold"
            style={styles.count}
            text={`${comments > 0 ? comments : ''} Comment${
              comments === 1 ? '' : 's'
            }`}
          />
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    paddingRight: 15,
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  button: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingLeft: 15,
    marginLeft: 10,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  count: {
    color: '#afafaf',
    fontSize: 12,
    marginTop: -2,
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#d8d8d8',
    marginRight: 5,
  },
  active: {
    tintColor: '#fdb299',
  },
})

export default Interactions
