import { Dimensions, StyleSheet } from 'react-native'

import { theme } from '../../theme'

const { width, height } = Dimensions.get('window')

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
  },
  section: {
    paddingHorizontal: theme.paddingHorizontal,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#dadadd',
  },
  inline: {
    flexDirection: 'row',
  },
  alignRight: {
    justifyContent: 'flex-end',
  },
  row: {
    paddingVertical: 10,
    flexDirection: 'row',
  },
  noMarginBottom: {
    marginBottom: 0,
  },
  noBorder: {
    borderBottomWidth: 0,
    borderTopWidth: 0,
  },
  left: {
    width: 30,
  },
  middle: {
    flex: 1,
  },
  right: {
    width: 30,
  },
  middleFull: {
    flex: 1,
  },
  drivingIcon: {
    marginTop: 5,
    marginRight: 5,
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  loadingMapContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },
  map: {
    width,
    position: 'relative',
  },
  title: {
    color: '#7c7c7c',
    fontSize: theme.font.sizes.defaultPlus,
    marginLeft: 8,
    marginBottom: 10,
  },
  titleIcon: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
  },
  optionsButton: {
    marginTop: 2,
    width: 25,
    height: 25,
    resizeMode: 'contain',
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
  },
  reviewOptionsWrapper: {
    position: 'absolute',
    zIndex: 100,
    top: 0,
    right: 0,
    width: 28,
    height: 28,
    padding: 10,
    alignItems: 'flex-end',
    flexDirection: 'row',
  },
  reviewOptions: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  trailTitle: {
    fontSize: 20,
    lineHeight: 25,
    color: '#555555',
  },
  by: {
    color: '#959595',
    marginTop: 5,
  },
  bold: {
    color: '#009688',
  },
  rating: {
    marginTop: 10,
  },
  reviewText: {
    marginLeft: 5,
    fontSize: theme.font.sizes.smallVariation,
  },
  drivingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distanceWrapper: {
    flexDirection: 'row',
  },
  distanceText: {
    fontSize: 18,
    color: '#7c7c7c',
  },
  distanceIcon: {
    marginLeft: 15,
    marginRight: 5,
    width: 10,
    height: 10,
    marginTop: 8,
    tintColor: '#7c7c7c',
  },
  plusIcon: {
    width: 15,
    height: 15,
    resizeMode: 'contain',
    marginRight: 5,
    tintColor: theme.secondaryColor,
  },
  description: {
    flexDirection: 'row',
    marginTop: 5,
  },
  descriptionText: {
    fontSize: theme.font.sizes.default,
    lineHeight: 20,
    color: '#7c7c7c',
    textAlign: 'justify',
  },
  toggleText: {
    fontSize: theme.font.sizes.small,
    marginTop: 10,
    color: theme.secondaryColor,
  },
  placeholder: {
    marginTop: 10,
    width: '100%',
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rideList: {
    marginTop: 0,
  },
  rideRow: {
    flexDirection: 'row',
    marginTop: 15,
  },
  horseImage: {
    marginRight: 15,
    width: 40,
    height: 40,
    borderRadius: 3,
  },
  rideDate: {
    flex: 1,
  },
  rideDateText: {
    alignSelf: 'flex-end',
    color: '#555',
    fontSize: theme.font.sizes.defaultPlus,
  },
  rideTimer: {
    fontSize: 22,
    color: theme.secondaryColor,
    lineHeight: 0,
    marginTop: -5,
  },
  rideLabel: {
    color: 'silver',
    fontSize: theme.font.sizes.smallest,
  },
  seeMoreButton: {
    marginTop: 15,
    padding: 8,
    borderRadius: 4,
    borderWidth: 0.8,
    borderColor: theme.secondaryColor,
    width: 100,
    alignSelf: 'flex-end',
  },
  seeMoreButtonText: {
    fontSize: theme.font.sizes.small,
    alignSelf: 'center',
    color: theme.secondaryColor,
  },
  reviewButton: {
    width: 130,
    paddingHorizontal: 5,
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAverageWrapper: {
    marginTop: 10,
    marginLeft: 35,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  reviewAverage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  reviewWrapperText: {
    color: '#555',
    marginLeft: 5,
  },
  reviewList: {
    marginTop: 15,
    paddingBottom: 15,
    marginLeft: 35,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    position: 'relative',
  },
  review: {
    paddingTop: 20,
    fontSize: theme.font.sizes.smallVariation,
    lineHeight: 20,
    color: '#7c7c7c',
    textAlign: 'justify',
  },
  reviewName: {
    fontSize: theme.font.sizes.smallVariation,
    color: '#7c7c7c',
    marginRight: 5,
  },
  reviewUserName: {
    fontSize: theme.font.sizes.smallVariation,
    color: theme.secondaryColor,
    marginRight: 5,
  },
  byUserName: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 15,
  },
  button: {
    padding: 4,
    borderRadius: 4,
    borderWidth: 0.8,
    borderColor: theme.secondaryColor,
    width: 120,
    alignSelf: 'center',
    marginBottom: 30,
  },
  buttonText: {
    fontSize: theme.font.sizes.small,
    alignSelf: 'center',
    color: theme.secondaryColor,
  },
  addPhoto: {
    padding: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    marginRight: 10,
    marginBottom: 0,
  },
  seeMore: {
    width: 100,
    padding: 6,
    marginBottom: 0,
  },
  addPhotoWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  itemLength: {
    fontSize: 16,
    color: '#919191',
  },
  cameraIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
    tintColor: theme.secondaryColor,
  },
  closeWrapper: {
    position: 'absolute',
    width: 55,
    height: 55,
    paddingTop: 15,
    paddingRight: 15,
    top: 0,
    right: 0,
    zIndex: 1,
    alignItems: 'flex-end',
    backgroundColor: 'black',
  },
  close: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#bbb',
  },
  listPois: {
    marginTop: 20,
    justifyContent: 'center',
  },
  poiItem: {
    flex: 1,
    marginBottom: 30,
    flexDirection: 'row',
  },
  poiIcon: {
    width: 28,
    height: 28,
    marginLeft: -5,
  },
  viewMorePoi: {
    width: '95%',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  poiText: {
    fontSize: theme.font.sizes.smallVariation,
    lineHeight: 20,
    color: '#7c7c7c',
  },
  poiTitle: {
    marginTop: 4,
    fontSize: theme.font.sizes.defaultPlus,
  },
  poiContent: {
    marginLeft: 5,
  },
  noContent: {
    color: '#bbb',
    marginVertical: 10,
  },
  reviewStars: {
    flexDirection: 'row',
  },
  owner: {
    fontSize: theme.font.sizes.smallest,
    color: 'silver',
    marginTop: -1,
    marginLeft: 4,
  },
  starMargin: {
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    ...theme.buttons.custom,
  },
  buttonText: {
    color: theme.secondaryColor,
    fontSize: theme.font.sizes.small,
  },
})
