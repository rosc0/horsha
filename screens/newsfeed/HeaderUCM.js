import React, { PureComponent } from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'

import Avatar from '@components/Avatar'
import Text from '@components/Text'
import Loading from '@components/Loading'
import { theme } from '@styles/theme'
import { POST_PREPARE } from '../../apollo/mutations/PostCollection'
import { Mutation } from 'react-apollo'

class NewsfeedHeader extends PureComponent {
  state = {
    chosenHorse: null,
  }

  render() {
    return (
      <View style={{ flexDirection: 'row' }}>
        <Mutation
          mutation={POST_PREPARE}
          onCompleted={({ postPrepare }) => {
            this.props.goToAddPost(null, postPrepare.id)
          }}
        >
          {createPost => (
            <TouchableOpacity style={{ flex: 1 }} onPress={() => createPost()}>
              <View style={styles.createPost}>
                <View style={styles.placeholderWrapper}>
                  <Text
                    style={styles.createPostHeader}
                    message="newsfeed/createPost"
                  />
                </View>
              </View>
            </TouchableOpacity>
          )}
        </Mutation>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => this.props.goToAddPost(null)}
        >
          <View style={styles.createPost}>
            <View style={styles.placeholderWrapper}>
              <Text
                style={styles.createPostHeader}
                message="newsfeed/createActivity"
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>
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
    borderWidth: 0.5,
    borderColor: '#d6d6da',
  },
  avatarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeholderWrapper: {
    flex: 1,
    padding: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallArrow: {
    tintColor: 'silver',
    height: 10,
    width: 10,
    resizeMode: 'contain',
    marginLeft: 8,
  },
  createPostHeader: {
    ...theme.font.userName,
    fontSize: theme.font.sizes.smallVariation,
  },
})

// export default connect(
//   state => ({
//     horse: state.horses,
//   }),
//   null
// )(NewsfeedHeader)

export default NewsfeedHeader
