import React, { PureComponent } from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import Text from '@components/Text'

import * as horsesActions from '@actions/horses'

class HorseTeamSearchRow extends PureComponent {
  render() {
    const { id, name, onAddFriend, userAdded } = this.props

    const image = this.props.image
      ? { uri: this.props.image }
      : require('@images/default_user.png')

    return (
      <View style={styles.container}>
        <View style={styles.innerContainer}>
          <Image source={image} style={styles.image} />

          <Text type="title" weight="bold" style={styles.name} text={name} />

          {!userAdded && (
            <TouchableOpacity onPress={onAddFriend(id)} style={styles.button}>
              <Text
                type="title"
                weight="bold"
                style={styles.buttonText}
                message="horses/addToTeamButton"
              />
            </TouchableOpacity>
          )}

          {userAdded && <Text message={`horses/${userAdded.relationType}`} />}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  innerContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    alignItems: 'center',
    // justifyContent: 'space-between',
  },
  image: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  name: {
    fontSize: 16,
    color: '#595959',
    marginLeft: 20,
    flex: 1,
  },
  button: {
    borderWidth: 1,
    borderColor: '#117E7C',
    borderRadius: 5,
    padding: 10,
  },
  buttonText: {
    fontSize: 12,
    color: '#117E7C',
    backgroundColor: 'transparent',
  },
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(horsesActions, dispatch),
})

export default connect(
  null,
  mapDispatchToProps
)(HorseTeamSearchRow)
