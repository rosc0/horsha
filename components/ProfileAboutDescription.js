import React, { PureComponent } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import t from '@config/i18n'
import Text from '@components/Text'
import { theme } from '@styles/theme'

const MAX_DESCRIPTION_LENGTH = 180

class ProfileAboutDescription extends PureComponent {
  state = {
    showFullDescription: false,
  }

  handleSeeMore = () =>
    this.setState({ showFullDescription: !this.state.showFullDescription })

  render() {
    const { showFullDescription } = this.state
    const { description, ownProfile = false, edit = () => {} } = this.props

    if (!description && !!ownProfile) {
      return (
        <TouchableOpacity style={styles.container} onPress={edit}>
          <Text
            weight="black"
            style={styles.add}
            text={t('common/addASummary')}
          />
        </TouchableOpacity>
      )
    }
    if (!description) return <View />

    const isDescriptionBig = description.length > MAX_DESCRIPTION_LENGTH

    const seeMoreText = t('common/seeMoreLower')
    const seeLessText = t('common/seeLessLower')

    return (
      <View style={styles.container}>
        <Text
          multiline={showFullDescription}
          weight="black"
          numberOfLines={!showFullDescription ? 4 : 0} // 0 to show entire data
          style={styles.description}
          text={
            isDescriptionBig && !showFullDescription
              ? `${description.slice(0, MAX_DESCRIPTION_LENGTH - 3)}...`
              : description
          }
        />
        {isDescriptionBig && (
          <TouchableOpacity
            style={styles.seeMoreButton}
            onPress={this.handleSeeMore}
          >
            <Text
              weight="bold"
              style={styles.seeMore}
              text={!showFullDescription ? seeMoreText : seeLessText}
            />
          </TouchableOpacity>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  description: {
    color: '#8C8C8C',
    fontSize: theme.font.sizes.default,
    alignItems: 'flex-start',
  },
  seeMoreButton: {
    height: 16,
    alignSelf: 'flex-end',
  },
  seeMore: {
    fontSize: theme.font.sizes.default,
    color: theme.secondaryColor,
  },
  add: {
    fontSize: theme.font.sizes.small,
    color: theme.secondaryColor,
  },
})

export default ProfileAboutDescription
