import React, { Component } from 'react'
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import NavBar, { NavButton, NavButtonText, NavTitle } from 'react-native-nav'

import Text from '@components/Text'
import { icons, poiLabels } from '@components/PoiIcons'
import HeaderButton from '@components/HeaderButton'
import HeaderTitle from '@components/HeaderTitle'

import t from '@config/i18n'
import { theme } from '@styles/theme'
import filterStyles from '@styles/screens/trails/filter-modal'
import { IconImage, checkIcon } from '@components/Icons'
import { toggle } from '@utils'

class FilterPois extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: <HeaderTitle title={'trails/filter'} />,
    tabBarVisible: false,
    headerLeft: (
      <HeaderButton onPress={() => navigation.goBack(null)}>
        <IconImage source="closeIcon" style={filterStyles.closeIcon} />
      </HeaderButton>
    ),
    headerRight: (
      <HeaderButton
        textStyle={{ paddingRight: 17, paddingLeft: 0 }}
        onPress={navigation.state.params && navigation.state.params.save}
      >
        {t('common/apply')}
      </HeaderButton>
    ),
  })

  state = {
    filter: true,
    pois: [],
  }

  componentDidMount() {
    const { filter, pois } = this.props.navigation.state.params

    this.setState({
      filter: !filter && pois.length == 0 ? true : filter,
      pois,
    })

    this.props.navigation.setParams({ save: this.save })
  }

  check = item => {
    const { pois: selectedPois } = this.state
    const pois = toggle(selectedPois, item)

    this.setState({ pois })
  }

  save = () => {
    const { navigation } = this.props

    navigation.state.params.onSave(this.state)
    navigation.goBack(null)
  }

  toggleAll = () => {
    const allTypes = Object.keys(poiLabels)

    this.setState(({ pois }) => ({
      pois: allTypes.length === pois.length ? [] : allTypes,
    }))
  }

  header = () => (
    <NavBar style={filterStyles}>
      <NavButton onPress={() => this.props.navigation.goBack(null)}>
        <NavButtonText style={filterStyles.buttonText}>
          {t('common/cancel')}
        </NavButtonText>
      </NavButton>

      <NavTitle style={filterStyles.title}>{t('trails/filter')}</NavTitle>

      <NavButton onPress={this.save}>
        <NavButtonText style={filterStyles.buttonText}>
          {t('common/done')}
        </NavButtonText>
      </NavButton>
    </NavBar>
  )

  render() {
    const { pois } = this.state
    const { filter } = this.props.navigation.state.params
    const labels = Object.keys(poiLabels)

    const all = labels.length === pois.length

    return (
      <View style={styles.wrapper}>
        <ScrollView style={styles.wrapper}>
          <View style={styles.poiWrapper}>
            <View style={styles.poiHeader}>
              <Text weight="bold" style={styles.title} message="poi/showOnly" />
              {filter && (
                <TouchableOpacity
                  style={{ flex: 1 }}
                  activeOpacity={0.7}
                  onPress={this.save}
                >
                  <Text
                    type="title"
                    weight="bold"
                    style={[styles.toggleButton, styles.center]}
                    message="poi/clear"
                  />
                </TouchableOpacity>
              )}
              {pois.length > 0 && !filter && (
                <TouchableOpacity
                  style={{ flex: 1 }}
                  activeOpacity={0.7}
                  onPress={() => this.setState({ pois: [] })}
                >
                  <Text
                    type="title"
                    weight="bold"
                    style={[styles.toggleButton, styles.center]}
                    message="poi/clear"
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={{ flex: 1 }}
                activeOpacity={0.7}
                onPress={this.toggleAll}
              >
                <Text
                  type="title"
                  weight="bold"
                  style={styles.toggleButton}
                  message={all ? 'poi/deselectAll' : 'poi/selectAll'}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.poiList}>
              {labels.map((item, i) => {
                const isChecked = pois.indexOf(item) >= 0

                return (
                  <TouchableOpacity
                    key={i}
                    activeOpacity={0.7}
                    onPress={() => this.check(item)}
                  >
                    <View
                      style={[styles.poiItem, i === 0 ? styles.firstItem : {}]}
                    >
                      <View style={styles.inline}>
                        <Image
                          source={icons[item]}
                          style={filterStyles.poiIcon}
                        />
                        <Text
                          type="title"
                          weight="bold"
                          style={styles.poiName}
                          text={poiLabels[item]}
                        />
                      </View>

                      <CheckIcon checked={isChecked} />
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
  },
  poiWrapper: {
    marginTop: 10,
  },
  firstItem: {
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  poiList: {
    marginTop: 10,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  poiItem: {
    borderBottomWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  poiName: {
    fontSize: theme.font.sizes.smallVariation,
    color: 'gray',
  },
  title: {
    fontSize: theme.font.sizes.small,
    color: 'gray',
    flex: 1,
  },
  checkIcon: {
    width: 15,
    height: 12,
    justifyContent: 'flex-end',
  },
  toggleButton: {
    fontSize: theme.font.sizes.smallest,
    color: theme.secondaryColor,
    flex: 1,
    justifyContent: 'flex-end',
    textAlign: 'right',
  },
  center: {
    textAlign: 'center',
    justifyContent: 'center',
  },
  poiHeader: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
})

const CheckIcon = ({ checked }) => {
  if (!checked) return null

  return <Image source={checkIcon} style={styles.checkIcon} />
}

export default FilterPois
