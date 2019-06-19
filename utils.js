import moment from 'moment'
import momentDurationFormatSetup from 'moment-duration-format'
import { NativeModules, Platform, Dimensions } from 'react-native'
import TimerMixin from 'react-timer-mixin'
import t from '@config/i18n'
import { countries, filterLaguage } from '@constants/countries'

const { width, height } = Dimensions.get('window')

momentDurationFormatSetup(moment)

export const getLocale = () => {
  if (Platform.OS === 'android') {
    return NativeModules.I18nManager.localeIdentifier
  } else {
    return NativeModules.SettingsManager.settings.AppleLocale
  }
}

export const serialize = data => {
  if (!data) return ''
  if (typeof data !== 'object' && Array.isArray(data)) return ''

  return Object.keys(data)
    .map(item => {
      if (Array.isArray(data[item])) {
        let string = ''

        data[item].map((value, key) => {
          if (key > 0) string += '&'
          string += encodeURIComponent(item) + '=' + encodeURIComponent(value)
        })

        return `${string}`
      } else {
        const key = encodeURIComponent(item)
        const val = encodeURIComponent(data[item])

        return `${key}=${val}`
      }
    })
    .join('&')
}

export const emptyToNull = data => {
  if (!data) return ''
  if (typeof data !== 'object' && Array.isArray(data)) return ''

  const newData = JSON.stringify(data).replace(/\"\"/g, 'null')
  const newData2 = newData.replace(/\:\0/g, ':null')
  return JSON.parse(newData2)
}

export const convertSerialize = data => {
  if (!data) return
  const input = serialize(data)
  let result
  if (!data.text) {
    result = input.replace(/([A-Z])/g, '_$1')
  } else if (data.text) {
    result = input
  }
  const finalResult = result.toLowerCase()
  return finalResult
}

export const renderName = name => {
  const formatted =
    name && name.slice(-1).toLowerCase() === 's' ? `${name}'` : `${name}'s`

  return capitalizeFirstLetter(formatted)
}

export const capitalizeFirstLetter = string => {
  const st = string.toLowerCase()

  return st.charAt(0).toUpperCase() + st.slice(1)
}

export const fromNowDate = date => {
  const today = moment()
  const yesterday = moment().subtract(1, 'day')

  let fromNowDate = moment(date).format('DD MMMM YYYY')

  if (
    moment(date).isSame(today, 'day') ||
    moment(date).isSame(yesterday, 'day')
  ) {
    fromNowDate = moment(date).fromNow()
  }

  return fromNowDate
}

export const fromNowDateUnix = date => {
  const today = moment()
  const yesterday = moment().subtract(1, 'day')

  let fromNowDate = moment.unix(date).format('DD MMMM YYYY')

  if (
    moment.unix(date).isSame(today, 'day') ||
    moment.unix(date).isSame(yesterday, 'day')
  ) {
    fromNowDate = moment.unix(date).fromNow()
  }

  return fromNowDate
}
export const getIndexById = (array, id) => array.map(el => el.id).indexOf(id)

export const getLanguage = (locale, defaultLanguage = 'en') => {
  if (!locale || typeof locale !== 'string') return defaultLanguage

  const availableLanguages = {
    en: ['en', 'en_us', 'en-us', 'en_uk', 'en-uk', 'en-gb', 'en_gb'],
    pt: ['pt', 'pt_br', 'pt-br', 'pt_us', 'pt-us', 'pt-pt', 'pt_pt'],
    nl: ['nl', 'nl_us', 'nl-us'],
  }

  return Object.keys(availableLanguages).reduce((acc, lang) => {
    const valuesArray = availableLanguages[lang]
    const isChosenLanguage = valuesArray.indexOf(locale.toLowerCase())

    return isChosenLanguage !== -1 ? lang : acc
  }, defaultLanguage)
}

export const getiOSDevice = device => {
  const deviceList = {
    i386: 'Simulator',
    x86_64: 'Simulator',
    'iPhone1,1': 'Original',
    'iPhone1,2': '3G',
    'iPhone2,1': '3GS',
    'iPhone3,1': '4',
    'iPhone3,2': '4',
    'iPhone3,3': '4',
    'iPhone4,1': '4s',
    'iPhone5,1': '5',
    'iPhone5,2': '5',
    'iPhone5,3': '5c',
    'iPhone6,1': '5s',
    'iPhone7,1': '6 Plus',
    'iPhone7,2': '6',
    'iPhone8,1': '6s',
    'iPhone8,2': '6s Plus',
    'iPhone8,4': 'SE',
    'iPhone9,1': '7',
    'iPhone9,3': '7',
    'iPhone9,2': '7 Plus',
    'iPhone9,4': '7 Plus',
  }

  return deviceList[device] ? deviceList[device] : ''
}

export const build = (type, data) => {
  if (type === 'get') {
    const character = data.body.indexOf('?') > -1 ? '&' : '?'
    return `${data.body}${character}access_token=${data.token}`
  }

  if (type === 'post' && typeof data !== 'object') {
    return `${data.body}&access_token=${data.token}`
  }

  const body = JSON.parse(data.body)
  body.access_token = data.token
  return body
}

export const autoBind = (methods, scope) =>
  methods.map(fn => scope[fn].bind(scope))

export const format = (
  name,
  maxLength = 18,
  separator = '...',
  ext = '.gpx'
) => {
  if (name === undefined || name === null) return ''
  if (name.length <= maxLength + 2) return name

  name = name.replace(/\.[^/.]+$/, '')

  const nameSize = name.length
  const sepLength = separator.length
  const charsToShow = maxLength - sepLength
  const frontChars = Math.ceil(charsToShow / 2)
  const backChars = Math.floor(charsToShow / 2)
  const firstPart = name.substr(0, frontChars)
  const secondPart = name.substr(nameSize - backChars)

  return firstPart + separator + secondPart + ext
}

export const formatNumber = (
  number,
  decimalPlaces = 0,
  roundToFive = false
) => {
  if (roundToFive) {
    number = Math.ceil(number / 5) * 5
  }

  // return Globalize(getLanguage( getLocale() ))
  //   .numberFormatter({
  //     minimumFractionDigits: decimalPlaces,
  //     maximumFractionDigits: decimalPlaces
  //   })( number )
  return number.toFixed(decimalPlaces)
}

export const formatBirthday = birthday =>
  birthday ? moment(birthday).format('YYYY-MM-DD') : null
export const formatWeightUnit = weight_unit => {
  // returns
  // gram, kilogram, pound

  // weight_unit
  // metric
  // imperial
  switch (weight_unit) {
    case 'imperial':
      return 'pound'
    case 'metric':
      return 'gram'
    default:
      break
  }
}
export const formatHeightUnit = height_unit => {
  // returns
  // centimeter, meter, inch, hands_height

  // units
  // centimeter, inch, hands_height

  switch (height_unit) {
    case 'centimeters':
      // return 'centimeter'
      return 'meter'
    case 'inches':
      return 'inch'
    case 'hands':
      return 'hands_height'
    default:
      break
  }
}

export const calculateElevation = (elevation = 0, unit, decimalPlaces = 2) => {
  // assumes elevation from server is m
  let calculatedElevation = formatNumber(elevation, decimalPlaces)

  if (unit === 'imperial') {
    // convert to feet
    const elevationCalc = elevation / 0.3048
    calculatedElevation = formatNumber(elevationCalc, decimalPlaces)
  }

  return calculatedElevation
}

export const calculateDistance = (distance = 0, unit, decimalPlaces = 2) => {
  // assumes distance from server is m
  let calculatedDistance = 0
  if (unit === 'metric') {
    // convert to km
    const distanceCalc = distance / 1000
    calculatedDistance = formatNumber(distanceCalc, decimalPlaces)
  } else if (unit === 'imperial') {
    // convert to miles
    const distanceCalc = distance / 1609.344
    calculatedDistance = formatNumber(distanceCalc, decimalPlaces)
  }

  return calculatedDistance
}

export const calculateSpeed = (speed = 0, unit, decimalPlaces = 2) => {
  // assumes speed from server is m/s
  let calculatedSpeed = 0

  if (unit === 'metric') {
    //convert to km/h
    const speedCalc = speed * 3.6
    calculatedSpeed = formatNumber(speedCalc, decimalPlaces)
  } else if (unit === 'imperial') {
    // convert to mph
    const speedCalc = speed * 2.23694
    calculatedSpeed = formatNumber(speedCalc, decimalPlaces)
  }

  return calculatedSpeed
}

export const calculateMaxSpeed = (locations, unit, decimalPlaces = 2) => {
  let calculatedSpeed = 0

  const allSpeedies = locations.map(i => i.coordinates.map(c => c.speed))
  const flat = allSpeedies.reduce((acc, val) => acc.concat(val), [])

  speed = Math.max(...flat)
  if (unit === 'metric') {
    //convert to km/h
    const speedCalc = speed * 3.6
    calculatedSpeed = formatNumber(speedCalc, decimalPlaces)
  } else if (unit === 'imperial') {
    // convert to mph
    const speedCalc = speed * 2.23694
    calculatedSpeed = formatNumber(speedCalc, decimalPlaces)
  }

  return calculatedSpeed
}

export const calculateHorseHeight = (height, unit, roundToFive = false) => {
  let calculatedHeight = 0

  if (unit === 'centimeters') {
    const heightCalc = height * 100
    calculatedHeight = formatNumber(heightCalc, 0, roundToFive) + ' cm'
  } else if (unit === 'inches') {
    const heightCalc = height * 39.3701
    calculatedHeight = formatNumber(heightCalc, 0, roundToFive) + '"'
  } else if (unit === 'hands') {
    const heightCalc = height * 9.842519685
    calculatedHeight = formatNumber(heightCalc, 0, roundToFive) + ' hh'
  }

  return calculatedHeight
}

export const calculateHorseWeight = (weight, unit, roundToFive = false) => {
  let calculatedWeight = 0

  if (unit === 'metric') {
    // convert g to kg
    const weightCalc = weight / 1000
    calculatedWeight = formatNumber(weightCalc, 0, roundToFive) + ' kg'
  } else if (unit === 'imperial') {
    // convert g to lb
    const weightCalc = weight * 0.00220462
    calculatedWeight = formatNumber(weightCalc, 0, roundToFive) + ' lb'
  }

  return calculatedWeight
}

export const convertForSaveHorseHeight = (height, unit) => {
  if (height === null) {
    return height
  }

  let calculatedHeight = 0

  // height saved in meters to server
  if (unit === 'centimeters') {
    // convert cm to m
    calculatedHeight = height / 100
  } else if (unit === 'inches') {
    // convert " to m
    calculatedHeight = (height * 0.0254).toFixed(2)
  } else if (unit === 'hands') {
    // convert hh to m
    calculatedHeight = (height * 0.1016).toFixed(2)
  }

  return calculatedHeight
}

export const convertForSaveHorseWeight = (weight, unit) => {
  if (weight === null) {
    return weight
  }

  let calculatedWeight = 0

  // weight saved in grams to server
  if (unit === 'metric') {
    // convert kg to g
    calculatedWeight = weight * 1000
  } else if (unit === 'imperial') {
    // convert lb to g
    calculatedWeight = (weight * 453.592).toFixed(2)
  }

  return calculatedWeight
}

export const calculateDuration = (duration = 0, noSeconds) => {
  if (duration === '0') return '0'
  const seconds = moment.duration(duration).seconds()
  const minutes = moment.duration(duration).minutes()
  const hours = Math.trunc(moment.duration(duration).asHours())

  const format = value => {
    if (value === 0) {
      return '0'
    }
    if (value < 10) {
      return `0${value}`
    }
    return value
  }

  if (noSeconds) {
    return `${format(hours)}:${format(minutes)}`
  }

  return `${format(hours)}:${format(minutes)}:${format(seconds)}`
}

export const formatCalcDuration = (
  duration = 0,
  noSeconds,
  noMinutes = false
) => {
  let seconds = moment.duration(duration).seconds()
  let minutes = moment.duration(duration).minutes()
  let hours = Math.trunc(moment.duration(duration).asHours())

  hours = hours < 10 ? '0' + hours : hours
  minutes = hours > 999 ? '' : minutes < 10 ? '0' + minutes : minutes
  seconds = seconds < 10 ? '0' + seconds : seconds

  if (noSeconds) {
    return `${hours}${hours > 999 ? '' : ':'}${minutes}`
  }

  return `${hours}:${minutes}:${seconds}`
}

export const formatChartDuration = (duration = 0) => {
  let seconds = moment.duration(duration).seconds()
  let minutes = moment.duration(duration).minutes()
  let hours = Math.trunc(moment.duration(duration).asHours())

  hours = hours < 10 ? '0' + hours : hours
  minutes = minutes < 10 ? '0' + minutes : minutes
  seconds = seconds < 10 ? '0' + seconds : seconds

  return hours
}

export const formatDurationWithoutSeconds = (n, minutes) =>
  formatCalcDuration(n, true, minutes)

export const getWeekNumber = d => {
  // Copy date so don't modify original
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
  // Return array of year and week number
  return weekNo
}

export const convertMinsToHrsMins = mins => {
  let h = Math.floor(mins / 60)
  let m = mins % 60
  h = h < 10 ? '0' + h : h
  m = m < 10 ? '0' + m : m
  return `${h}:${m}`
}

export const convertSecsToMinSecs = secs => {
  let m = Math.floor(secs / 60)
  let s = secs % 60
  m = m < 10 ? '0' + m : m
  s = s < 10 ? '0' + s : s
  return `${m}:${s}`
}

export const getTimeZone = () => {
  const offset = new Date().getTimezoneOffset()
  const o = Math.abs(offset)

  return (
    (offset < 0 ? '+' : '-') +
    ('00' + Math.floor(o / 60)).slice(-2) +
    ':' +
    ('00' + (o % 60)).slice(-2)
  )
}

export const uniq = arrArg => Array.from(new Set(arrArg))

export const msToTime = duration => {
  let milliseconds = parseInt((duration % 1000) / 100)
  let seconds = parseInt((duration / 1000) % 60)
  let minutes = parseInt((duration / (1000 * 60)) % 60)
  let hours = parseInt((duration / (1000 * 60 * 60)) % 24)

  hours = hours < 10 ? '0' + hours : hours
  minutes = minutes < 10 ? '0' + minutes : minutes
  seconds = seconds < 10 ? '0' + seconds : seconds

  return hours + ':' + minutes
}

export const poiTypes = [
  'camping',
  'eatery',
  'equestrian_facility',
  'information_point',
  'lodging',
  'parking',
  'picnic_place',
  'viewpoint',
  'watering_point',
  'water_crossing',
  'warning',
]

export const upper = s => s && s.replace(/^./, m => m.toUpperCase())

export const getRandomInt = () => Math.floor(Math.random() * (99 - 1)) + 1

export const debounce = (func, wait, immediate = false) => {
  let timeout
  return function() {
    const context = this,
      args = arguments
    const later = () => {
      timeout = null
      if (!immediate) func.apply(context, args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = TimerMixin.setTimeout(later, wait)
    if (callNow) func.apply(context, args)
  }
}

export const throttle = (callback, limit) => {
  let wait = false
  return function() {
    if (!wait) {
      callback.apply(null, arguments)
      wait = true
      TimerMixin.setTimeout(() => {
        wait = false
      }, limit)
    }
  }
}

export const rangeToPercent = (number, min, max) =>
  ((number - min) / (max - min)) * 100

export const LATITUDE_DELTA = 0.09412
export const LONGITUDE_DELTA = (LATITUDE_DELTA * width) / height

export const getBBox = center => {
  const northeast = {
    latitude: center.latitude + LATITUDE_DELTA,
    longitude: center.longitude + LONGITUDE_DELTA / 2,
  }

  const southwest = {
    latitude: center.latitude - LATITUDE_DELTA,
    longitude: center.longitude - LONGITUDE_DELTA / 2,
  }

  return {
    bb_top_right_latitude: northeast.latitude,
    bb_top_right_longitude: northeast.longitude,
    bb_bottom_left_latitude: southwest.latitude,
    bb_bottom_left_longitude: southwest.longitude,
  }
}

export const clean = str => (str ? str : '')

export const cleanMeasure = number => {
  if (number === null) {
    return ''
  }
  const ts = number.toString()
  const cvt = ts.substr(0, ts.length - 2)
  return parseInt(cvt)
}

export const cleanDate = date =>
  date ? moment(date).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')
export const birthDate = date =>
  date ? moment(date).format('MMM D, YYYY') : t('horseProfile/noHorseCare')

export const getNumber = number => parseInt(number.replace(/[^0-9]/g, ''))

export const toggle = (arr, item) =>
  arr.indexOf(item) === -1 ? arr.concat(item) : arr.filter(i => i !== item)

export const isIphoneX = () => {
  return (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    (height === 812 || width === 812 || (height === 896 || width === 896))
  )
}

export const ifIphoneX = (iphoneXStyle, regularStyle) => {
  if (isIphoneX()) {
    return iphoneXStyle
  }
  return regularStyle
}

export const isValidString = string => {
  const regExp = /[^ -~]+/g
  const match = string.match(regExp)

  return !(match && match.length)
}

export const isPasswordValid = password => {
  const regex = /((?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,32})/
  return regex.test(password)
}

export const isValidEmail = email => {
  try {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(email)
  } catch (_) {
    return false
  }
}

export const formatLikeNumber = (number, byYou) => {
  if (number === 0) return 0
  if (byYou) {
    if (number > 1) {
      return `${t('friends/you')} + ${number - 1}`
    }
    return t('friends/you')
  }
  return number
}

export const padZero = number => (parseInt(number) < 10 ? `0${number}` : number)

export const outputCountry = (code = 'US') => {
  const country = countries[code].name[filterLaguage()]

  return country
}

export const getGeoCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      position => resolve(position),
      e => reject(e)
    )
  })
}

export const getCounter = entity => {
  return entity.pageInfo.remaining + entity.collection.length
}
