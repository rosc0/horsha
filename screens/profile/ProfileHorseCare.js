import React, { PureComponent } from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Text from '@components/Text'
import { horsesActions } from '@actions/index'
import KeyboardSpacer from '@components/KeyboardSpacer'
import HeaderTitle from '@components/HeaderTitle'
import t from '@config/i18n'
import EmptyHorseCare from './components/EmptyHorseCare'
import { IconImage } from '@components/Icons'
import AnimatedTextInput from '@components/AnimatedTextInput'
import { theme } from '@styles/theme'

class ProfileHorseCare extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: <HeaderTitle title={'horseProfile/horseCareInfoTitle'} />,
    headerRight: navigation.state.params.showEdit ? (
      <TouchableOpacity onPress={() => navigation.state.params.handleSave()}>
        <Text
          type="title"
          weight="semiBold"
          style={styles.saveButton}
          message="common/done"
        />
      </TouchableOpacity>
    ) : null,
    tabBarVisible: false,
  })

  state = {
    showEdit: false,
    id: null,
    horseInfos: null,
    horseCare: '',
    showCare: false,
    newValue: '',
  }

  componentDidMount() {
    const { horseId: id, horse } = this.props.navigation.state.params
    this.setState({
      id,
      horseInfos: horse,
      horseCare: horse.horseCare,
      horseDate: horse.birthday || new Date(),
      showCare: !!horse.horseCare,
    })
    this.props.navigation.setParams({
      handleSave: this.handleSave,
      showEdit: false,
    })
  }

  handleEdit = () => {
    const { showEdit } = this.state
    this.setState({ showCare: true, showEdit: !showEdit })
    this.props.navigation.setParams({
      showEdit: true,
    })
  }

  handleSave = () => {
    const { id, horseInfos, horseCare } = this.state
    const data = {
      ...horseInfos,
      horseCare,
    }

    this.props.actions.editHorseProfile(id, data)
    this.props.navigation.goBack(null)
  }

  renderRenderContent() {
    const { showEdit, showCare } = this.state
    const {
      profile: { horseCare },
      team,
    } = this.props.horses
    const { user } = this.props.user
    let relationType = ''
    const currentUserRelation = team.users.filter(
      teamUser => teamUser.key == user.id
    )
    if (currentUserRelation.length) {
      relationType = currentUserRelation[0].relationType
    }

    return (
      <View style={styles.mainContainer}>
        <View style={styles.container}>
          {!showCare ? (
            <EmptyHorseCare
              relationType={relationType}
              showCare={() => this.handleEdit()}
            />
          ) : showEdit ? (
            <ScrollView
              ref={scrollView => (this.scrollView = scrollView)}
              style={styles.container}
            >
              <View style={styles.editContainer}>
                <IconImage source="horseCareInfoIcon" style={styles.image} />
                <Text
                  type="title"
                  weight="semiBold"
                  style={styles.edit}
                  message="horses/horseCareExample"
                />
              </View>
              <AnimatedTextInput
                value={this.state.horseCare}
                autoFocus
                multiLine
                label={t('formLabels/horseCare')}
                onChangeText={horseCare => this.setState({ horseCare })}
                onContentSizeChange={() => {
                  this.scrollView.scrollToEnd({ animated: true })
                }}
                onFocus={() => {
                  this.scrollView.scrollToEnd({ animated: true })
                }}
                autoCorrect={false}
                underlineColorAndroid="transparent"
              />
              <KeyboardSpacer style={{ padding: 15 }} />
            </ScrollView>
          ) : (
            <View style={{ padding: 15 }}>
              {relationType === 'owner' && (
                <TouchableOpacity opacity={0} onPress={() => this.handleEdit()}>
                  <Text
                    type="title"
                    weight="bold"
                    style={styles.shortEdit}
                    message="common/edit"
                  />
                </TouchableOpacity>
              )}
              <Text type="title" style={styles.horseCare} text={horseCare} />
            </View>
          )}
        </View>
      </View>
    )
  }

  render() {
    return (
      <View style={styles.mainContainer}>{this.renderRenderContent()}</View>
    )
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: theme.backgroundColor,
  },
  container: {
    backgroundColor: theme.backgroundColor,
  },
  horseCare: {
    color: '#696969',
    fontSize: theme.font.sizes.default,
    textAlign: 'left',
  },
  edit: {
    textAlign: 'center',
    paddingBottom: 20,
  },
  saveButton: {
    fontSize: 16,
    color: 'white',
    marginRight: 10,
    marginLeft: 10,
  },
  editContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 50,
    width: '100%',
    marginVertical: 7,
  },
  image: {
    tintColor: '#BCBCBC',
    width: 170,
    height: 100,
    resizeMode: 'contain',
  },
  shortEdit: {
    width: '100%',
    color: theme.secondaryColor,
    fontSize: 16,
    textAlign: 'right',
  },
})

export default connect(
  ({ horses, user }) => ({ horses, user }),
  dispatch => ({
    actions: bindActionCreators(
      {
        ...horsesActions,
      },
      dispatch
    ),
  })
)(ProfileHorseCare)
