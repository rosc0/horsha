import React, { PureComponent } from 'react'
import { StyleSheet, Platform } from 'react-native'

import Text from '@components/Text'

export default class HeaderTitle extends PureComponent {
  render() {
    const { title } = this.props
    return (
      <Text style={styles.title} type="title" weight="normal" message={title} />
    )
  }
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    color: 'white',
    fontFamily: 'Nunito-Bold',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      android: {
        marginLeft: 15,
        marginBottom: 2,
      },
    }),
  },
})
