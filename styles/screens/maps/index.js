import React from 'react'
import { StyleSheet, Platform } from 'react-native'
import Mapbox from '@mapbox/react-native-mapbox-gl'

import { theme } from '@styles/theme'

export const MAP_STYLES = {
  OUTDOORS: {
    label: 'Outdoors',
    url: 'mapbox://styles/mapbox/outdoors-v9?optimize=true',
  },
  STREETS: {
    label: 'Streets',
    url: Mapbox.StyleURL.Street,
  },
  SATELLITE: {
    label: 'Satellite',
    url: Mapbox.StyleURL.Satellite,
  },
  SATELLITE_STREET: {
    label: 'Satellite Streets',
    url: Mapbox.StyleURL.SatelliteStreet,
  },
  DARK: {
    label: 'Dark',
    url: Mapbox.StyleURL.Dark,
  },
  LIGHT: {
    label: 'Light',
    url: Mapbox.StyleURL.Light,
  },
}

export const styles = StyleSheet.create({
  mapRootContainer: StyleSheet.absoluteFillObject,
  // location permissions request
  addButton: {
    marginRight: 10,
  },
  whiteContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginTop: 20,
  },
  button: {
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: theme.secondaryColor,
    borderRadius: 5,
    padding: 10,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
  },
  // Record Screen
  recordContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  // Trails
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  scrollView: {
    position: 'absolute',
    zIndex: 5,
    backgroundColor: 'transparent',
    width: '100%',
    bottom: 10,
    left: 0,
  },
  redoSearch: {
    position: 'absolute',
    zIndex: 15,
    backgroundColor: 'transparent',
    width: '100%',
    bottom: 185,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    position: 'absolute',
    zIndex: 4,
    left: 0,
    right: 0,
  },
  mapControl: {
    zIndex: 3,
  },
  centering: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  startEnd: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
})
