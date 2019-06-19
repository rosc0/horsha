import React, { PureComponent } from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'

import Avatar from '@components/Avatar'
import Text from '@components/Text'
import Loading from '@components/Loading'
import { theme } from '@styles/theme'

const arrowIcon = require('@images/arrow.png')

class NewsfeedHeader extends PureComponent {
  state = {
    chosenHorse: null,
  }

  render() {
    const { horse } = this.props
    if (!horse) {
      return null
    }

    return (
      <TouchableOpacity onPress={this.props.goToAddPost(horse)}>
        <View style={styles.createPost}>
          <View style={styles.avatarWrapper}>
            {horse ? (
              <Avatar
                profile={horse}
                origin="header"
                style={{
                  backgroundColor: 'white',
                }}
              />
            ) : (
              <Loading type="spinner" fullScreen={false} />
            )}

            <Image source={arrowIcon} style={styles.smallArrow} />
          </View>

          {horse && (
            <View style={styles.placeholderWrapper}>
              <Text
                style={styles.createPostHeader}
                message="newsfeed/createPostPlaceholder"
                values={{ horse: horse.name }}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  createPost: {
    backgroundColor: 'white',
    borderBottomWidth: 0.5,
    borderColor: '#d6d6da',
    paddingHorizontal: theme.paddingHorizontal,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeholderWrapper: {
    flex: 1,
    marginLeft: 7,
  },
  smallArrow: {
    tintColor: 'silver',
    height: 10,
    width: 10,
    resizeMode: 'contain',
    marginLeft: 8,
  },
  createPostHeader: {
    fontSize: theme.font.sizes.smallVariation,
    color: '#999',
  },
})

// export default connect(
//   state => ({
//     horse: state.horses,
//   }),
//   null
// )(NewsfeedHeader)

export default NewsfeedHeader
