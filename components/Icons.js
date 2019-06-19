import React from 'react'
import { Image, TouchableOpacity } from 'react-native'
import Icon from '@components/svg/Icon'
// Require Images
// actions
// export const addIcon = require('@images/icons/add.png')
export const closeIcon = require('@images/icons/x.png')
export const checkIcon = require('@images/icons/check.png')
export const searchIcon = require('@images/icons/search.png')
export const plusIcon = require('@images/icons/plus.png')
export const successIcon = require('@images/success.png')
export const errorIcon = require('@images/error.png')
export const attachIcon = require('@images/icons/attach.png')
export const brokenIcon = require('@images/broken_image.png')

export const publicIcon = require('@images/icons/sharescope-public.png')
export const privateIcon = require('@images/icons/sharescope-private.png')
export const facebook = require('@images/icons/facebook.png')
export const facebookBlue = require('@images/icons/facebook_blue.png')
export const statusIcon = require('@images/icons/stats.png')
export const heartCircle = require('@images/heart_circle.png')
export const heartStroke = require('@images/icons/heart-stroke.png')
export const closeShadow = require('@images/icons/close_shadow.png')
// Arrows
export const arrowIcon = require('@images/arrow-bottom-thin.png')
export const fatArrowLeft = require('@images/icons/fat-arrow-left.png')
export const fatArrowRight = require('@images/icons/fat-arrow-right.png')
export const prevIcon = require('@images/arrow-left-thin.png')
export const nextIcon = require('@images/arrow-right-thin.png')
export const arrowIconTop = require('@images/arrow-top-thin.png')
export const arrowTopNormal = require('@images/arrow-top.png')
export const simpleArrow = require('@images/arrow.png')
export const descentIcon = require('@images/icons/arrow-descent.png')
export const ascentIcon = require('@images/icons/arrow-ascent.png')
// horses
export const horseIcon = require('@images/icons/horses.png')
export const rideHorseIcon = require('@images/icons/ride-horse.png')
export const defaultHorse = require('@images/default_horse.png')
export const horsePlaceholder = require('@images/horse_placeholder.png')
export const horseCircle = require('@images/horse_circle.png')
export const horseTeam = require('@images/icons/horse_team.png')
export const horseCareInfoIcon = require('@images/horse_care_info.png')
// rides
export const rides = require('@images/rides.png')
export const rideHorse = require('@images/icons/ride-horse.png')
// user
export const userIcon = require('@images/default_user.png')
export const friendsIcon = require('@images/icons/friends.png')
// logos
export const logoSmall = require('@images/logos/small.png')
// Maps
export const locationRed = require('@images/location_red.png')
export const locationGreen = require('@images/location_green.png')
export const locationYellow = require('@images/location_yellow.png')

export const locationIcon = require('@images/icons/location.png')
export const layerIcon = require('@images/icons/layer.png')
export const startIcon = require('@images/icons/marker-start.png')
export const endIcon = require('@images/icons/marker-end.png')
export const selfieCamera = require('@images/icons/selfie-camera.png')
// journal
export const likeIcon = require('@images/icons/heart.png')
export const commentIcon = require('@images/icons/comment.png')
// trails
export const trailsIcon = require('@images/icons/trails.png')
export const trailsActiveIcon = require('@images/icons/trails-active.png')
export const heartIcon = require('@images/icons/heart.png')
export const oneWayIcon = require('@images/icons/one-way.png')
export const roundTripIcon = require('@images/icons/round-trip.png')
export const drivingIcon = require('@images/icons/driving.png')
export const elevationIcon = require('@images/icons/elevation-icon.png')
export const reviewIcon = require('@images/icons/review.png')
// loading
export const loadingGray = require('@images/loading-gray.gif')
export const loading = require('@images/loading.gif')
// welcome/login/register
export const passwordHidden = require('@images/icons/password-hidden.png')
export const password = require('@images/icons/password.png')
// pois
export const poiActiveIcon = require('@images/icons/poi.png')
export const poiIcon = require('@images/icons/poi-active.png')
export const poiLocation = require('@images/icons/poi-location.png')
// record
export const pauseIcon = require('@images/pause.png')
// camera
export const cameraIcon = require('@images/icons/camera.png')
export const addCameraIcon = require('@images/icons/add-camera.png')
{
  /* 
  // Require Component Icons
  <IconImage
    style={styles.plusIcon}
    source="plusIcon"
  /> 
*/
}

export const IconImage = ({
  style = {},
  source,
  svg = false,
  width = 29,
  height = 29,
  fill = '#b7b7b8',
  ...props
}) => {
  if (svg === true) {
    return (
      <Icon
        name={source}
        height={style.height}
        width={style.width}
        strokeWidth="3"
        fill={fill}
        style={style}
      />
    )
  }
  return (
    <Image
      style={style}
      resizeMode="contain"
      source={eval(source)} // The eval() function evaluates JavaScript code represented as a string.
      {...props}
    />
  )
}

export const ArrowBottomButtonComponent = ({
  style,
  wrapperStyle = {},
  onPress,
}) => (
  <TouchableOpacity activeOpacity={0.6} onPress={onPress} style={wrapperStyle}>
    <Image style={style} source={arrowIcon} />
  </TouchableOpacity>
)
