// Shared between 2 files
// TODO: Make a component

import { theme } from '../../theme'

export default {
  wrapper: {
    flex: 1,
    backgroundColor: theme.border,
  },
  statusBar: {
    backgroundColor: theme.mainColor,
  },
  navBar: {
    backgroundColor: theme.mainColor,
    borderBottomWidth: 0,
  },
  title: {
    color: 'white',
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: theme.font.sizes.defaultPlus,
    fontFamily: 'Nunito-Bold',
  },
  rowInline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: '#dddddd',
  },
  center: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  rowNoBorder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  row: {
    marginTop: 8,
  },
  rowItem: {
    backgroundColor: 'white',
    padding: 8,
    borderBottomWidth: 1,
    borderColor: theme.border,
  },
  labelInline: {
    fontSize: theme.font.sizes.default,
    color: '#7b7b7b',
  },
  labelClear: {
    fontSize: theme.font.sizes.default,
    color: '#009688',
  },
  label: {
    fontSize: 12,
    color: '#7b7b7b',
    marginBottom: 8,
    marginTop: 20,
    marginLeft: 18,
  },
  trailType: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trailTypeItem: {
    backgroundColor: '#fafafa',
    flex: 1,
    padding: 10,
    marginRight: 15,
    alignItems: 'center',
  },
  active: {
    backgroundColor: '#eaeaea',
  },
  last: {
    marginRight: 0,
  },
  trailItemText: {
    fontSize: theme.font.sizes.small,
    color: '#009688',
    marginTop: 8,
  },
  rowSurface: {
    marginTop: 0,
    marginBottom: 5,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#029789',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  activeRadio: {
    borderColor: '#029789',
  },
  checkbox: {
    // borderWidth: 2,
    // borderColor: '#727272',
    marginRight: 8,
    // borderRadius: 2,
    padding: 2,
    height: 20,
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    width: 15,
    height: 15,
  },
  radioValue: {
    width: 10,
    height: 10,
    borderRadius: 50,
    marginTop: 3,
    backgroundColor: '#029789',
  },
  thumb: {
    backgroundColor: '#009688',
    height: 20,
    width: 20,
    top: 10,
  },
  distance: {
    color: 'gray',
    fontSize: theme.font.sizes.small,
    marginTop: 15,
    textAlign: 'left',
  },
  distanceTextWrapper: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    justifyContent: 'space-between',
  },
  distanceWrapper: {
    paddingHorizontal: 10,
    backgroundColor: 'white',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  poiItem: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  poiItemNearby: {
    flexDirection: 'row',
    paddingVertical: 0,
    paddingLeft: 10,
    paddingRight: 5,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trailPoiItem: {
    flexDirection: 'row',
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  border: {
    borderBottomWidth: 2,
    borderBottomColor: 'gray',
  },
  poiList: {
    flexDirection: 'row',
    paddingRight: 10,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  poiItemText: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    justifyContent: 'flex-start',
  },
  poiItemTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    justifyContent: 'flex-start',
  },
  poiIcon: {
    width: 25,
    height: 25,
    marginRight: 15,
    marginLeft: 0,
  },
  heartIcon: {
    width: 24,
    height: 20,
    marginRight: 15,
    marginLeft: 0,
    tintColor: '#FDB299',
  },
  avatarIcon: {
    width: 25,
    height: 25,
    marginRight: 15,
    marginLeft: 0,
    borderRadius: 25 / 2,
  },
  poiText: {
    color: 'gray',
    fontSize: theme.font.sizes.default,
  },
  name: {
    padding: 10,
    backgroundColor: '#eee',
  },
  input: {
    color: '#777',
    fontSize: theme.font.sizes.small,
    fontFamily: 'OpenSans',
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  rangeSlider: {
    height: 50,
    width: '100%',
  },
  closeIcon: {
    width: 20,
    height: 20,
    tintColor: 'white',
    borderRadius: 10,
    padding: 4,
    marginLeft: 15,
  },
  filterButton: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButtonLabel: {
    fontSize: theme.font.sizes.smallVariation,
    color: '#7d7d7d',
  },
  filterButtonValue: {
    fontSize: theme.font.sizes.smallVariation,
    color: '#b6b6b7',
  },
  arrowOptionReview: {
    width: 10,
    height: 16,
    resizeMode: 'contain',
    marginLeft: 10,
  },
}
