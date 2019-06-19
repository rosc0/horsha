import React, { PureComponent } from 'react'
import {
  Alert,
  LayoutAnimation,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  NativeModules,
} from 'react-native'
import moment from 'moment'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { NavigationActions } from 'react-navigation'

import Text from '@components/Text'

import { theme } from '@styles/theme'
import t from '@config/i18n'
import * as horsesActions from '@actions/horses'
import { RELATION_TYPES } from '@reducers/horses'
import Horses from '@api/horses'
import { arrowIcon, arrowIconTop, userIcon } from '@components/Icons'

const { UIManager } = NativeModules

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true)

const HorsesAPI = new Horses()

const MIN_HEIGHT = 0
const MAX_HEIGHT = 70

class HorseTeamRow extends PureComponent {
  state = { shouldShowActionBar: 0, h: 0 }

  componentDidUpdate(prevProps) {
    if (prevProps.shouldShowActionBar !== this.props.shouldShowActionBar) {
      const toValue = this.props.shouldShowActionBar ? MAX_HEIGHT : MIN_HEIGHT
      LayoutAnimation.spring(0)
      this.setState({ h: toValue })
    }
  }

  changeRelationAlert = (title, message, relationType) => {
    const { isCurrentUser } = this.props

    Alert.alert(
      title,
      message,
      [
        {
          text: t('common/cancel'),
        },
        {
          text: t('common/ok'),
          onPress: () => {
            this.props.actions.editHorseUser(this.props.horseId, {
              horseUserId: this.props.horseUserId,
              relation_type: relationType,
              isCurrentUser,
            })
            LayoutAnimation.spring(0)

            this.setState({ shouldShowActionBar: 0, h: 70 })
          },
        },
      ],
      {
        cancelable: true,
      }
    )
  }

  handleChangeRelationType = relationType => () => {
    const { isCurrentUser } = this.props

    let changeRelationTitle = null
    let changeRelationMessage = null

    switch (relationType) {
      case RELATION_TYPES.ARCHIVED:
        {
          if (isCurrentUser) {
            changeRelationTitle = t('horses/makeSelfArchivedTitle')
            changeRelationMessage = t('horses/makeSelfArchivedMessage')
          } else {
            changeRelationTitle = t('horses/makeArchivedTitle')
            changeRelationMessage = t('horses/makeArchivedMessage')
          }
        }
        break
      case RELATION_TYPES.OWNER:
        {
          changeRelationTitle = t('horses/makeOwnerTitle')
          changeRelationMessage = t('horses/makeOwnerMessage')
        }
        break
      case RELATION_TYPES.SHARER: {
        changeRelationTitle = t('horses/makeSharerTitle')
        changeRelationMessage = t('horses/makeSharerMessage')
      }
    }

    if (relationType === RELATION_TYPES.ARCHIVED && isCurrentUser) {
      Alert.alert(
        t('horses/selfArchiveWarningTitle'),
        t('horses/selfArchiveWarningMessage'),
        [
          {
            text: t('horses/selfArchiveOkButton'),
            onPress: () => {
              this.changeRelationAlert(
                changeRelationTitle,
                changeRelationMessage,
                relationType
              )
            },
          },
        ],
        {
          cancelable: true,
        }
      )
    } else {
      this.changeRelationAlert(
        changeRelationTitle,
        changeRelationMessage,
        relationType
      )
    }
  }

  handleDeleteFromHorses = () =>
    Alert.alert(
      t('horses/removeFromMyHorsesTitle'),
      t('horses/removeFromMyHorsesMessage'),
      [
        {
          text: t('common/cancel'),
        },
        {
          text: t('common/ok'),
          onPress: async () => {
            await HorsesAPI.deleteHorseUser(this.props.horseUserId)
            await this.props.actions.getHorses()

            return this.props.navigation.dispatch(
              NavigationActions.navigate({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: 'Main' })],
              })
            )
          },
        },
      ],
      {
        cancelable: true,
      }
    )

  renderActionButtons = () => {
    const { isCurrentUser, isCurrentUserOwner, relationType } = this.props

    // const heightInterpolate = this.state.slideDown.interpolate({
    //   inputRange: [0, 1],
    //   outputRange: [MIN_HEIGHT, MAX_HEIGHT],
    // })

    const animatedStyle = [
      styles.actionButtonsContainer,
      {
        height: this.state.h,
      },
    ]

    if (isCurrentUser && relationType !== RELATION_TYPES.ARCHIVED) {
      return (
        <View style={animatedStyle}>
          <TouchableOpacity
            onPress={this.handleChangeRelationType(RELATION_TYPES.ARCHIVED)}
            style={styles.button}
          >
            <Text
              type="title"
              weight="bold"
              style={styles.buttonText}
              message="horses/leaveHorseTeam"
            />
          </TouchableOpacity>
        </View>
      )
    }

    if (isCurrentUser && relationType === RELATION_TYPES.ARCHIVED) {
      return (
        <View style={animatedStyle}>
          <TouchableOpacity
            onPress={() => this.handleDeleteFromHorses()}
            style={styles.button}
          >
            <Text
              type="title"
              weight="bold"
              style={styles.buttonText}
              message="horses/removeFromMyHorses"
            />
          </TouchableOpacity>
        </View>
      )
    }

    if (isCurrentUserOwner) {
      return (
        <View style={animatedStyle}>
          {relationType === RELATION_TYPES.SHARER && (
            <TouchableOpacity
              onPress={this.handleChangeRelationType(RELATION_TYPES.OWNER)}
              style={styles.button}
            >
              <Text
                type="title"
                weight="bold"
                style={styles.buttonText}
                message="horses/makeOwnerButton"
              />
            </TouchableOpacity>
          )}

          {(relationType === RELATION_TYPES.OWNER ||
            relationType === RELATION_TYPES.ARCHIVED) && (
            <TouchableOpacity
              onPress={this.handleChangeRelationType(RELATION_TYPES.SHARER)}
              style={styles.button}
            >
              <Text
                type="title"
                weight="bold"
                style={styles.buttonText}
                message="horses/makeSharerButton"
              />
            </TouchableOpacity>
          )}

          {(relationType === RELATION_TYPES.SHARER ||
            relationType === RELATION_TYPES.OWNER) && (
            <TouchableOpacity
              onPress={this.handleChangeRelationType(RELATION_TYPES.ARCHIVED)}
              style={styles.button}
            >
              <Text
                type="title"
                weight="bold"
                style={styles.buttonText}
                message="horses/removeButton"
              />
            </TouchableOpacity>
          )}
        </View>
      )
    }
  }

  render() {
    const {
      horseUserId,
      name,
      createdAt,
      relationType,
      onPress,
      isCurrentUser,
      isCurrentUserOwner,
    } = this.props

    const image = this.props.image ? { uri: this.props.image } : userIcon

    const showDropdown = isCurrentUser || isCurrentUserOwner

    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => onPress(horseUserId)}
          style={styles.innerContainer}
          activeOpacity={showDropdown ? 0.7 : 1}
        >
          <Image source={image} style={styles.image} resizeMode="cover" />

          <View style={styles.infoContainer}>
            <Text type="title" weight="bold" style={styles.name} text={name} />

            <Text
              type="title"
              style={styles.date}
              message="horses/sinceRelation"
              values={{
                since: moment(createdAt).format('D MMM. YYYY'),
                relation: t(`horses/${relationType}`),
              }}
            />
          </View>

          {showDropdown && (
            <TouchableOpacity
              onPress={() => {
                this.setState({
                  shouldShowActionBar:
                    this.state.shouldShowActionBar === 0 ? 1 : 0,
                })
                onPress(horseUserId)
              }}
            >
              <Image
                source={this.state.h === 70 ? arrowIconTop : arrowIcon}
                style={styles.arrow}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
        {showDropdown && this.renderActionButtons(showDropdown)}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    marginTop: 10,
    paddingTop: 10,
  },
  innerContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.paddingHorizontal,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  image: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'column',
    marginHorizontal: 15,
  },
  name: {
    fontSize: 16,
    color: '#595959',
  },
  date: {
    fontSize: theme.font.sizes.smallVariation,
    color: '#595959',
  },
  arrow: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  actionButtonsContainer: {
    backgroundColor: theme.mainColor,
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 5,
  },
  button: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginVertical: 15,
  },
  buttonText: {
    fontSize: 12,
    color: 'white',
    backgroundColor: 'transparent',
  },
})

const mapStateToProps = ({ user }) => ({
  user,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(horsesActions, dispatch),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HorseTeamRow)
