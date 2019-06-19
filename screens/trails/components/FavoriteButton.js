import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { TouchableOpacity } from 'react-native'
import * as trailActions from '@actions/trails'
import { IconImage } from '@components/Icons'

import { HeartIcon, HeartIconActive } from './TrailsIcons'

class FavoriteButton extends PureComponent {
  state = {
    trail: null,
    isLiked: false,
  }

  static getDerivedStateFromProps(props, state) {
    const { trail } = props

    if (trail !== state.trail) {
      return {
        trail,
        isLiked:
          (trail.favoriteSince && typeof trail.favoriteSince !== 'undefined') ||
          false,
      }
    }

    return null
  }

  toggleLike = () => {
    const { isLiked } = this.state
    this.setState({ isLiked: !isLiked }, () =>
      this.props.actions.toggleTrailFavorite(!!isLiked, this.props.trail.id)
    )
  }

  render() {
    const { isLiked } = this.state
    const { styleImage, outline = false, style } = this.props
    return (
      <TouchableOpacity
        style={style}
        onPress={this.toggleLike}
        activeOpacity={1}
      >
        {isLiked ? (
          <HeartIconActive />
        ) : outline ? (
          <IconImage style={styleImage} source={'heartStroke'} />
        ) : (
          <HeartIcon />
        )}
      </TouchableOpacity>
    )
  }
}

export default connect(
  null,
  dispatch => ({
    actions: bindActionCreators(
      {
        ...trailActions,
      },
      dispatch
    ),
  })
)(FavoriteButton)
