import React from 'react'
import { Dimensions, Image, StyleSheet, TouchableOpacity } from 'react-native'
import { theme } from '@styles/theme'
import Text from '@components/Text'
import { IconImage } from '@components/Icons'

const dimensions = Dimensions.get('window')
const size = { width: dimensions.width, height: dimensions.height }

const styles = StyleSheet.create({
  titleIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  heart: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: 'silver',
    top: 2,
  },
  heartActive: {
    tintColor: theme.likeActive,
  },
  trailButton: {
    borderWidth: 0.8,
    borderColor: theme.secondaryColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '65%',
    borderRadius: 5,
    padding: 4,
    marginTop: 20,
  },
  icon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  greenTint: {
    tintColor: theme.secondaryColor,
  },
  drivingIcon: {
    marginTop: 5,
    marginRight: 5,
    width: 22,
    height: 22,
    resizeMode: 'contain',
    tintColor: '#4d4d4d',
  },
  trailButtonText: {
    marginLeft: 10,
    fontSize: 12,
    color: theme.secondaryColor,
  },
  trailButton: {
    borderWidth: 0.8,
    borderColor: theme.secondaryColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '65%',
    borderRadius: 5,
    padding: 4,
    marginTop: 20,
  },
})

export const HeartIcon = () => (
  <IconImage style={styles.heart} source="heartIcon" />
)

export const HeartIconActive = () => (
  <IconImage style={[styles.heart, styles.heartActive]} source="heartIcon" />
)

export const RideIcon = ({ style = {} }) => (
  <IconImage style={style} source="rideHorse" />
)

export const OneWay = () => (
  <IconImage style={styles.titleIcon} source="oneWayIcon" />
)

export const RoundTrip = () => (
  <IconImage style={styles.titleIcon} source="roundTripIcon" />
)

export const ElevationIcon = () => (
  <IconImage style={styles.icon} source="elevationIcon" />
)

export const ReviewIcon = () => (
  <IconImage style={styles.icon} source="reviewIcon" />
)

export const CameraIcon = ({ style = {} }) => (
  <IconImage style={[styles.icon, style]} source="cameraIcon" />
)

export const AddCameraIcon = ({ style = {} }) => (
  <IconImage style={[styles.icon, style]} source="addCameraIcon" />
)

export const LocationIcon = ({ style = {} }) => (
  <IconImage style={[styles.icon, style]} source="poiLocation" />
)

export const DrivingIcon = () => (
  <IconImage style={styles.drivingIcon} source="drivingIcon" />
)

export const ArrowBottomButton = ({ style, wrapperStyle = {}, onPress }) => (
  <TouchableOpacity activeOpacity={0.6} onPress={onPress} style={wrapperStyle}>
    <IconImage style={style} source="arrowIcon" />
  </TouchableOpacity>
)

export const FollowButton = ({ onPress, style = {}, text }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={[styles.trailButton, style]}
  >
    <RideIcon style={[styles.icon, styles.greenTint]} />
    <Text
      type="title"
      weight="bold"
      style={styles.trailButtonText}
      text={text}
    />
  </TouchableOpacity>
)
