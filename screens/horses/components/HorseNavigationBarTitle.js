import React, { Component } from 'react'
import NavigationBarTitle from '@components/navigationBar/NavigationBarTitle'
import t from '@config/i18n'

class HorseNavigationBarTitle extends Component {
  state = {
    horseScreens: [
      {
        title: t('horses/journal'),
        route: 'HorseJournal',
      },
      {
        title: t('horses/album'),
        route: 'HorseAlbum',
      },
      {
        title: t('horses/rides'),
        route: 'HorseRides',
      },
      {
        title: t('horses/horseTeam'),
        route: 'HorseTeam',
      },
      {
        title: t('horses/profile'),
        route: 'Profile',
      },
      {
        title: t('horses/stats'),
        route: 'HorseStats',
      },
    ],
  }

  render() {
    const { navigation, ...props } = this.props
    const { params } = navigation.state
    const limitViews = ['HorseAlbum', 'HorseRides', 'HorseTeam']
    let screens = this.state.horseScreens

    if (params && params.limitedView) {
      screens = screens.filter(screen => !limitViews.includes(screen.route))
    }

    return (
      <NavigationBarTitle
        dropdownOptions={screens}
        condition={navigation.state.routeName}
        navigation={navigation}
        {...props}
      />
    )
  }
}

export default HorseNavigationBarTitle
