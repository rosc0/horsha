import React, { PureComponent } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import Text from '@components/Text'
import Button from '@components/Button'
import { IconImage } from '@components/Icons'
import { theme } from '@styles/theme'

class NewsfeedEmpty extends PureComponent {
  render = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.center}>
      <IconImage source="logoSmall" style={styles.logo} />

      <View style={styles.center}>
        <Text
          type="title"
          weight="bold"
          style={styles.title}
          message="newsfeed/noHorsesTitle"
          values={{ user: this.props.user.name }}
        />

        <Text
          type="title"
          weight="semiBold"
          style={styles.text}
          message="newsfeed/noHorsesText"
        />

        <Button
          style={styles.buttonWrapper}
          onPress={() => this.props.navigation.navigate('EditProfile')}
        >
          <Text
            type="title"
            weight="bold"
            style={styles.button}
            message="newsfeed/updateProfileButton"
          />
        </Button>

        <Button
          style={styles.buttonWrapper}
          onPress={() => this.props.navigation.navigate('Friends')}
        >
          <Text
            type="title"
            weight="bold"
            style={styles.button}
            message="newsfeed/emptyButton"
          />
        </Button>

        <Button
          style={styles.buttonWrapper}
          onPress={() => this.props.navigation.navigate('Horses')}
        >
          <Text
            type="title"
            weight="bold"
            style={styles.button}
            message="newsfeed/noHorsesButton"
          />
        </Button>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    // backgroundColor: '#f4f4f5',
  },
  center: {
    alignItems: 'center',
    width: '100%',
    padding: 10,
    alignSelf: 'center',
    flex: 1,
  },
  title: {
    fontSize: 20,
    color: '#636363',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#919191',
    textAlign: 'center',
  },
  logo: {
    tintColor: '#dfdfdf',
    width: 80,
    height: 80,
    marginBottom: 30,
  },
  buttonWrapper: {
    backgroundColor: '#5fb1a2',
    width: '50%',
    padding: 10,
    borderRadius: 4,
    marginTop: 10,
  },
  button: {
    fontSize: theme.font.sizes.smallest,
    color: 'white',
  },
})

export default NewsfeedEmpty
