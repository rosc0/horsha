import React, { PureComponent } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'

import Icon from '@components/Icon'
import Text from '@components/Text'
import { theme } from '@styles/theme'

class ArchivedUserBar extends PureComponent {
  navigateToArchivedUser = () => {
    const { horseUser } = this.props
    this.props.navigation.navigate('ArchivedUser', { horseUser })
  }

  render() {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => this.navigateToArchivedUser()}
        style={styles.bar}
      >
        <Icon name={'horse'} style={styles.icon} />
        <Text message={'horses/archivedHorse'} style={styles.text} />
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  bar: {
    height: 40,
    backgroundColor: theme.warning,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    color: 'white',
    marginRight: 10,
  },
  text: {
    fontSize: theme.font.sizes.default,
    color: 'white',
  },
})

export default ArchivedUserBar
