import React, { PureComponent } from 'react'
import { StyleSheet, View } from 'react-native'

import Text from '@components/Text'
import Icon from '@components/Icon'
import { theme } from '@styles/theme'

class ProfileHeader extends PureComponent {
  render() {
    const { icon, title, renderRight, style, values, message } = this.props

    return (
      <View style={[styles.container, style]}>
        <Icon name={icon} style={styles.icon} />

        <View style={styles.titleContainer}>
          <View style={styles.title}>
            {message ? (
              <Text
                type="title"
                weight="bold"
                style={styles.title}
                message={message}
                values={values}
              />
            ) : (
              <Text
                type="title"
                weight="bold"
                style={styles.title}
                text={title}
              />
            )}
          </View>

          {React.isValidElement(renderRight) && renderRight}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginRight: 10,
  },
  icon: {
    marginRight: 10,
  },
  titleContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    // flex: 2,
    fontSize: theme.font.sizes.defaultPlus,
    color: '#7B7B7B',
    justifyContent: 'flex-start',
    flexDirection: 'row',
  },
})

export default ProfileHeader
