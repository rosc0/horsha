import React, { Component } from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import ActionSheet from 'rn-action-sheet'

import t from '@config/i18n'
import * as horsesActions from '@actions/horses'
import { theme } from '@styles/theme'

import HorseNavigationBarTitle from '@screens/horses/components/HorseNavigationBarTitle'
import RideStats from '@components/RideStats'
import Separator from '@components/Separator'
import Loading from '@components/Loading'
import Text from '@components/Text'
import Icon from '@components/Icon'
import BackButton from '@components/BackButton'
import HorseImage from '@components/HorseImage'
import ProfileHeader from '@components/ProfileHeader'
import ProfileAboutInfo from '@components/ProfileAboutInfo'
import ProfileAboutDescription from '@components/ProfileAboutDescription'
import ProfileHorseTeam from './components/ProfileHorseTeam'
import ProfileAlbum from './components/ProfileAlbum'
import ArchivedUserBar from '@screens/horses/components/ArchivedUserBar'

import {
  calculateHorseHeight,
  calculateHorseWeight,
  calculateDistance,
  upper,
  birthDate,
} from '@application/utils'

class Profile extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: (
      <HorseNavigationBarTitle
        title={t('horseProfile/profileTitle')}
        navigation={navigation}
      />
    ),
    headerLeft: (
      <BackButton onPress={navigation.state.params.handleBackButton} />
    ),
    gesturesEnabled: navigation.state.params.shouldAllowBackGesture,
    tabBarVisible: false,
  })

  componentDidMount() {
    this.props.navigation.setParams({
      handleBackButton: this.handleBackButton,
      shouldAllowBackGesture: true,
    })

    this.props.actions.getHorseProfile(
      this.props.navigation.state.params.horseId
    )
  }

  handleBackButton = () => {
    const { params } = this.props.navigation.state

    if (params && params.shouldResetRouterOnBack) {
      return this.props.navigation.popToTop()
    }

    return this.props.navigation.goBack(null)
  }

  handleEditHorseAbout = () =>
    this.props.navigation.navigate('EditHorse', {
      horse: this.props.horses.profile,
      horseId: this.props.navigation.state.params.horseId,
    })

  handleGoToHorseStats = () =>
    this.props.navigation.navigate('HorseStats', {
      horseId: this.props.navigation.state.params.horseId,
    })

  handleGoToHorseCareInfo = () =>
    this.props.navigation.navigate('ProfileHorseCare', {
      horse: this.props.horses.profile,
      horseId: this.props.navigation.state.params.horseId,
    })

  handleGoToHorseTeam = () =>
    this.props.navigation.navigate('HorseTeam', {
      horseId: this.props.navigation.state.params.horseId,
    })

  handleGoToHorseAlbum = () => {
    const { navigation } = this.props
    return navigation.navigate('HorseAlbum', navigation.state.params)
  }

  handleChangeAlbumFullscreenState = isGalleryFullscreen =>
    this.props.navigation.setParams({
      shouldAllowBackGesture: !isGalleryFullscreen,
    })

  handleAddPicture = () => {
    const optionsTitleText = t('gallery/optionsTitle')
    const takePictureText = t('gallery/takePicture')
    const chooseFromGalleryText = t('gallery/chooseFromGallery')
    const cancelText = t('common/cancel')

    ActionSheet.show(
      {
        title: optionsTitleText,
        options: [takePictureText, chooseFromGalleryText, cancelText],
        cancelButtonIndex: 2,
        tintColor: theme.secondaryColor,
      },
      async index => {
        switch (index) {
          case 0: {
            return this.props.navigation.navigate('TakePicture', {
              callback: true,
            })
          }
          case 1: {
            return this.props.navigation.navigate('Gallery', {
              callback: true,
            })
          }
        }
      }
    )
  }

  renderProfilePictures = () => {
    const { user } = this.props
    const { album, team } = this.props.horses

    let relationType = ''
    const currentUserRelation = team.users.filter(
      teamUser => teamUser.key === user.id
    )

    if (currentUserRelation.length) {
      relationType = currentUserRelation[0].relationType
    }

    const isOwnerNoPictures =
      relationType === 'owner' && album.pictures.length === 0

    if (relationType !== 'owner' && album.pictures.length === 0) {
      return
    }

    const albumCountText = t('horseProfile/albumCount', {
      count: album.pictures.length,
    })
    const renderRight = (
      <View style={styles.profileAlbumHeader}>
        {isOwnerNoPictures && (
          <TouchableOpacity onPress={this.handleAddPicture}>
            <Icon name="add_photo_for_album" />
          </TouchableOpacity>
        )}

        {album.pictures.length > 0 && (
          <TouchableOpacity onPress={this.handleGoToHorseAlbum}>
            <Text
              type="title"
              weight="bold"
              style={styles.seeAll}
              message="common/seeAll"
            />
          </TouchableOpacity>
        )}
      </View>
    )

    if (album.upload.isUploading) {
      return (
        <View>
          <ProfileHeader icon="add_photo" title={albumCountText} />

          <View style={styles.uploadingContainer}>
            <Text
              style={styles.uploadingText}
              message="horses/uploadingPicture"
            />
          </View>
        </View>
      )
    }

    if (album.pictures.length === 0) {
      return (
        <View>
          <ProfileHeader
            icon="add_photo"
            title={albumCountText}
            renderRight={renderRight}
          />

          <Text
            message="horseProfile/noAlbumPictures"
            style={styles.noAlbumPicturesText}
          />
        </View>
      )
    }

    return (
      <View>
        <ProfileHeader
          icon="add_photo"
          title={albumCountText}
          renderRight={renderRight}
        />

        <ProfileAlbum
          pictures={[...album.pictures].splice(0, 5)}
          onPressPicture={this.handleGoToHorseAlbum}
          onChangeFullscreenState={this.handleChangeAlbumFullscreenState}
        />
      </View>
    )
  }
  render() {
    const {
      profile: {
        name,
        breed,
        color,
        gender,
        weight,
        height,
        birth,
        description,
        dateCreated,
        stats: { distance, duration, rides },
        fetching,
      },
      team,
      horses,
    } = this.props.horses

    const { user } = this.props

    if (fetching) {
      return <Loading type="spinner" />
    }

    let relationType = ''
    const currentUserRelation = team.users.filter(
      teamUser => teamUser.key === user.id
    )

    if (currentUserRelation.length) {
      relationType = currentUserRelation[0].relationType
    }

    const horseId = this.props.navigation.state.params.horseId
    const horseUser = horses.filter(horseUser => horseUser.horse.id === horseId)

    const isOwner = relationType === 'owner'
    const isOwnerOrSharer = isOwner || relationType === 'sharer'
    const isArchived = relationType === 'archived'
    const image = this.props.horses.profile.image
      ? { uri: this.props.horses.profile.image }
      : require('@images/horse_placeholder.png')
    const aboutText = t('horseProfile/about')
    const breedText = t('horseProfile/breed')
    const colorText = t('horseProfile/color')
    const genderText = t('horseProfile/gender')
    const weightText = t('horseProfile/weight')
    const heightText = t('horseProfile/height')
    const birthText = t('horseProfile/birth')
    const onHorshaText = t('horseProfile/onHorshaSince')
    const horseTeamCountText = t('horseProfile/horseTeamCount', {
      count: team.users.length,
    })

    const unitSystem = user.account.preferences.unitSystem
    const distanceUnit = unitSystem === 'IMPERIAL' ? 'Mi' : 'Km'

    return (
      <ScrollView style={styles.container}>
        {isArchived && (
          <ArchivedUserBar
            navigation={this.props.navigation}
            horseUser={horseUser[0]}
          />
        )}

        <View style={styles.innerContainer}>
          <View
            style={[
              styles.infoContainer,
              styles.paddingRight,
              styles.flexStart,
            ]}
          >
            <HorseImage
              lightbox={this.props.horses.profile.image ? true : false}
              horse={this.props.horses.profile}
              image={image}
              style={styles.picture}
            />

            <View style={[styles.infoInnerContainer, styles.flexStart]}>
              {isOwner && (
                <TouchableOpacity
                  onPress={this.handleEditHorseAbout}
                  style={[styles.editButton, styles.flexEnd]}
                >
                  <Text
                    type="title"
                    weight="bold"
                    style={styles.edit}
                    message="common/edit"
                  />
                </TouchableOpacity>
              )}
              <Text
                type="title"
                weight="semiBold"
                style={styles.name}
                text={name}
              />
              <Text
                type="title"
                weight="semiBold"
                numberOfLines={1}
                style={styles.subtitle}
                text={
                  !!distance
                    ? `${calculateDistance(
                        distance,
                        unitSystem
                      )} ${distanceUnit}`
                    : `0 ${distanceUnit}`
                }
              />
              <Text
                numberOfLines={2}
                style={styles.subtitle}
                text={relationType && upper(relationType)}
              />
            </View>
          </View>

          <View style={styles.paddingRight}>
            <Separator />
          </View>

          <View>
            <ProfileHeader
              icon="horse"
              title={aboutText}
              renderRight={
                isOwner && (
                  <TouchableOpacity
                    onPress={this.handleEditHorseAbout}
                    style={styles.editButton}
                  >
                    <Text
                      type="title"
                      weight="bold"
                      style={styles.edit}
                      message="common/edit"
                    />
                  </TouchableOpacity>
                )
              }
            />

            <View style={[styles.aboutInfoContainer, styles.paddingRight]}>
              <ProfileAboutInfo
                label={breedText}
                value={breed}
                ownProfile={isOwner}
                edit={() => this.handleEditHorseAbout()}
              />
              <ProfileAboutInfo
                label={colorText}
                value={color}
                ownProfile={isOwner}
                edit={() => this.handleEditHorseAbout()}
              />
              <ProfileAboutInfo
                label={genderText}
                value={gender !== 'unknown' && upper(gender)}
                ownProfile={isOwner}
                edit={() => this.handleEditHorseAbout()}
              />

              <ProfileAboutInfo
                label={weightText}
                value={
                  weight
                    ? calculateHorseWeight(
                        weight,
                        user.account.preferences.unitSystem
                      )
                    : null
                }
                ownProfile={isOwner}
                edit={() => this.handleEditHorseAbout()}
              />

              <ProfileAboutInfo
                label={heightText}
                value={
                  height
                    ? calculateHorseHeight(
                        height,
                        user.account.preferences.heightUnit
                      )
                    : null
                }
                ownProfile={isOwner}
                edit={() => this.handleEditHorseAbout()}
              />

              <ProfileAboutInfo
                label={birthText}
                value={birthDate(birth)}
                ownProfile={isOwner}
                edit={() => this.handleEditHorseAbout()}
              />
              {dateCreated && (
                <ProfileAboutInfo
                  label={onHorshaText}
                  style={{ width: 130 }}
                  value={birthDate(dateCreated)}
                  ownProfile={isOwner}
                  edit={() => this.handleEditHorseAbout()}
                />
              )}
              <ProfileAboutDescription
                description={description}
                style={styles.paddingRight}
                ownProfile={isOwner}
                edit={() => this.handleEditHorseAbout()}
              />
            </View>

            {isOwnerOrSharer && (
              <TouchableOpacity onPress={this.handleGoToHorseCareInfo}>
                <Text
                  type="title"
                  weight="bold"
                  style={styles.horseCareInfo}
                  message="horseProfile/horseCareInfo"
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.paddingRight}>
            <Separator />
          </View>

          <RideStats
            titleMessageKey={t('userProfile/statsTitle')}
            linkOnPress={() => this.handleGoToHorseStats()}
            totalRidingDistance={distance}
            totalRidingTime={duration}
            nrOfRides={rides}
            rounded
          />

          <View style={styles.paddingRight}>
            <Separator />
          </View>

          <View>
            <ProfileHeader
              icon="horse_team"
              title={horseTeamCountText}
              renderRight={
                relationType !== '' && team.users && team.users.length > 0 ? (
                  <TouchableOpacity
                    onPress={this.handleGoToHorseTeam}
                    style={styles.editButton}
                  >
                    <Text
                      type="title"
                      weight="bold"
                      style={styles.seeAll}
                      message="common/seeAll"
                    />
                  </TouchableOpacity>
                ) : null
              }
            />
            <View style={styles.paddingRight}>
              <ProfileHorseTeam
                users={team.users}
                navigate={this.props.navigation.navigate}
              />
            </View>
          </View>

          <View style={styles.paddingRight}>
            <Separator />
          </View>
          <View style={styles.paddingRight}>
            {this.renderProfilePictures()}
          </View>
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    backgroundColor: 'white',
    padding: 15,
    paddingRight: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#CCC',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paddingRight: {
    paddingRight: 15,
  },
  noAlbumPicturesText: {
    paddingTop: 15,
  },
  uploadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  profileAlbumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  picture: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    backgroundColor: '#eaeaea',
  },
  infoInnerContainer: {
    marginLeft: 15,
    flex: 1,
  },
  name: {
    ...theme.font.profileName,
  },
  subtitle: {
    color: '#696969',
    fontSize: theme.font.sizes.smallVariation,
  },
  edit: {
    color: theme.secondaryColor,
    fontSize: theme.font.sizes.default,
  },
  horseCareInfo: {
    color: theme.secondaryColor,
    fontSize: theme.font.sizes.small,
    marginTop: 15,
  },
  aboutInfoContainer: {
    marginTop: 10,
  },
  seeAll: {
    color: '#696969',
    fontSize: theme.font.sizes.default,
    paddingLeft: 5,
  },
  editButton: {
    paddingLeft: 55,
    paddingRight: 15,
  },
  flexStart: {
    alignItems: 'flex-start',
  },
  flexEnd: {
    alignSelf: 'flex-end',
    paddingRight: 0,
    textAlign: 'right',
    paddingBottom: 10,
  },
})

const mapStateToProps = ({ horses, user, gallery }) => ({
  horses,
  user: user.user,
  image: gallery.images[0] || {},
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(horsesActions, dispatch),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Profile)
