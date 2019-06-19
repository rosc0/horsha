import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import ActionSheet from 'rn-action-sheet'

import Text from '@components/Text'
import Avatar from '@components/Avatar'
import ArrowOptions from '@components/ArrowOptions'
import { theme } from '@styles/theme'
import t from '@config/i18n'
import * as newsActions from '@actions/newsfeed'
import * as horsesActions from '@actions/horses'
import { fromNowDateUnix } from '@application/utils'
import { IconImage } from '../../Icons'

/**
 *
 * <Header
 *   content={data}
 *   navigation={this.props.navigation}
 *   navigate={this.props.navigation.navigate}
 *   showArrow={true}
 *   isDetails={false}
 *   isHorseJournal={false}
 *   horseId={null}
 * />
 *
 */

class Header extends PureComponent {
  static defaultProps = {
    firstLink: '',
    secondLink: '',
    middleText: '',
    avatar: '',
    horseAvatar: '',
    dateCreated: '',
    isPrivate: false,
    showArrow: false,
    isOwner: false,
    entryId: '',
    entry: {},
    navigate: () => {},
  }

  redirect = (type, id) => {
    const screen =
      type === 'horse'
        ? { name: 'Profile', params: { horseId: id } }
        : { name: 'UserProfile', params: { userId: id } }

    this.props.navigate(screen.name, screen.params)
  }

  showOptions = () => {
    const { isOwner } = this.props.content

    const optionsText = t('common/chooseYourOption')
    const reportDuplicate = t('report/report')
    const cancel = t('common/cancel')
    const updateEntry = t('newsfeed/editEntry')
    const deleteEntry = t('newsfeed/deleteEntry')

    const actionSheetOptions = {
      title: optionsText,
      options: [reportDuplicate, cancel],
      cancelButtonIndex: 1,
      tintColor: theme.secondaryColor,
    }

    if (isOwner) {
      actionSheetOptions.options = [updateEntry, deleteEntry, cancel]

      actionSheetOptions.destructiveButtonIndex = 1
      actionSheetOptions.cancelButtonIndex = 2
    }

    ActionSheet.show(actionSheetOptions, index =>
      this.handleChoose(index, isOwner)
    )
  }

  handleChoose = (index, isOwner) => {
    const { entryId: id, entry, navigate, horseAvatar } = this.props.content
    if (index === 0 && !isOwner) {
      navigate('Report', { endpoint: `trail/${id}` })
    }

    if (index === 0 && isOwner) {
      navigate('EditJournal', {
        entry: {
          ...entry,
          horseAvatar,
        },
      })
    }

    if (index === 1 && isOwner) {
      this.deleteUpdate(id)
    }
  }

  deleteUpdate = entryId => {
    const { isHorseJournal, horseId } = this.props

    Alert.alert(
      t('newsfeed/areYouSureUpdateTitle'),
      t('newsfeed/areYouSureUpdateText'),
      [
        {
          text: t('common/cancel'),
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: t('common/delete'),
          onPress: async () => {
            if (isHorseJournal) {
              await this.props.actions.deleteHorseJournal(horseId, entryId)
            } else {
              await this.props.actions.deleteUpdate(entryId)
            }

            if (this.props.isDetails) {
              this.props.navigation.goBack(null)
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: false }
    )
  }

  decideIcon = shareScope => {
    if (shareScope === 'private') return 'privateIcon'
    if (shareScope === 'friends') return 'friendsIcon'
    return 'publicIcon'
  }

  render() {
    const { content: data, showArrow, renderContent } = this.props
    const { firstLink, secondLink } = data

    return (
      <View style={styles.header}>
        <View style={styles.avatars}>
          {data.avatar && secondLink && (
            <View style={styles.avatarsImages}>
              <TouchableOpacity
                onPress={() => this.redirect(firstLink.type, firstLink.id)}
              >
                <Avatar
                  newModel
                  type={firstLink.type}
                  profile={data.avatar}
                  style={styles.avatarImage}
                />
              </TouchableOpacity>
              {data.entry.taggedHorse && (
                <View style={styles.bullets}>
                  <View style={styles.bullet} />
                  <View style={styles.bullet} />
                </View>
              )}

              {data.entry.taggedHorse && (
                <TouchableOpacity
                  onPress={() =>
                    this.redirect(
                      secondLink.type,
                      data.entry.taggedHorse && data.entry.taggedHorse.id
                    )
                  }
                >
                  <Avatar
                    newModel
                    profile={data.entry.taggedHorse}
                    style={styles.secondAvatar}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}

          {data.avatar && !secondLink && (
            <View style={styles.avatarsImages}>
              <TouchableOpacity
                onPress={() => this.redirect(firstLink.type, firstLink.id)}
              >
                <Avatar
                  newModel
                  type={firstLink.type}
                  profile={data.avatar}
                  style={styles.avatarImage}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.middleWrapper}>
          <View style={styles.textWrapper}>
            <Text
              type="title"
              weight="semiBold"
              style={styles.titleLink}
              onPress={() =>
                data.availableLink &&
                this.redirect(firstLink.type, firstLink.id)
              }
              text={firstLink.name}
            />

            <Text
              type="title"
              weight="semiBold"
              style={styles.title}
              text={` ${data.middleText} `}
            />

            {secondLink && (
              <Text
                type="title"
                weight="semiBold"
                style={styles.titleLink}
                onPress={() =>
                  this.redirect(
                    secondLink.type,
                    data.horseAvatar && data.horseAvatar.id
                  )
                }
                text={secondLink.name}
              />
            )}
          </View>

          <View style={styles.sharescopeWrapper}>
            <Text
              style={styles.timeAgo}
              text={fromNowDateUnix(data.dateCreated)}
            />
            <IconImage
              source={`${data.shareScope.toLocaleLowerCase()}Icon`}
              style={styles.sharescope}
            />
          </View>

          {renderContent}
        </View>

        {showArrow && (
          <ArrowOptions
            wrapperStyle={styles.options}
            onPress={this.showOptions}
          />
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: theme.paddingHorizontal,
  },
  secondAvatar: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    marginTop: 2,
  },
  avatarImage: {
    width: 30,
    height: 30,
    marginTop: 2,
    resizeMode: 'contain',
  },
  middleWrapper: {
    flex: 1,
  },
  textWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  title: {
    ...theme.font.userName,
    color: '#4d4d4d',
    lineHeight: 20,
  },
  titleLink: {
    lineHeight: 20,
    ...theme.font.userName,
  },
  sharescopeWrapper: {
    marginTop: -4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sharescope: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
    marginLeft: 5,
    marginTop: 4,
  },
  options: {
    paddingBottom: 10,
    paddingLeft: 12,
    paddingRight: 15,
    marginRight: -15,
  },
  timeAgo: {
    ...theme.font.date,
  },
  avatars: {
    position: 'relative',
  },
  avatarsImages: {
    marginRight: 10,
    alignItems: 'center',
  },
  bullet: {
    width: 3,
    height: 3,
    backgroundColor: 'silver',
    borderRadius: 3,
    marginTop: 3,
  },
  bullets: {
    marginVertical: 4,
  },
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...newsActions,
      ...horsesActions,
    },
    dispatch
  ),
})

export default connect(
  null,
  mapDispatchToProps
)(Header)
