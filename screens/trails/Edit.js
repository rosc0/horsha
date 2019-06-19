import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Switch,
} from 'react-native'
import AnimatedTextInput from '@components/AnimatedTextInput'
import KeyboardSpacer from '@components/KeyboardSpacer'
import HeaderTitle from '@components/HeaderTitle'
import Text from '@components/Text'
import Checkbox from '@components/Checkbox'
import { theme } from '@styles/theme'

import t from '@config/i18n'
import * as trailActions from '@actions/trails'
import { IconImage } from '@components/Icons'

class EditTrail extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: <HeaderTitle title={'trails/editTrail'} />,
    tabBarVisible: false,
    headerLeft: (
      <TouchableOpacity onPress={() => navigation.goBack(null)}>
        <Text
          type="title"
          weight="semiBold"
          message="common/cancel"
          style={styles.cancelButton}
        />
      </TouchableOpacity>
    ),
    headerRight: (
      <TouchableOpacity
        onPress={navigation.state.params && navigation.state.params.handleSave}
      >
        <Text
          type="title"
          weight="semiBold"
          message="common/done"
          style={styles.saveButton}
        />
      </TouchableOpacity>
    ),
  })

  state = {
    title: '',
    description: '',
    trailId: '',
    suitableForDriving: false,
    trail: {},
    surfaceTypes: [],
  }

  async componentDidMount() {
    const trailId = this.props.navigation.getParam('trailId', '1')

    this.props.navigation.setParams({ handleSave: this.save })
    await this.props.actions.getTrailDetails(trailId)
  }

  static getDerivedStateFromProps(props, state) {
    const trailId = props.navigation.getParam('trailId', '1')
    const { trailDetails } = props.trails

    if (trailId !== state.trailId) {
      return {
        trailId,
        title:
          trailDetails && trailDetails.title ? trailDetails.title.trim() : '',
        description:
          trailDetails && trailDetails.description
            ? trailDetails.description.trim()
            : '',
        suitableForDriving:
          trailDetails && trailDetails.suitableForDriving
            ? trailDetails.suitableForDriving
            : false,
        surfaceTypes:
          trailDetails && trailDetails.surfaceTypes
            ? trailDetails.surfaceTypes
            : [],
        trail: trailDetails,
      }
    }

    return null
  }

  save = async () => {
    const {
      title,
      description,
      trail,
      suitableForDriving,
      surfaceTypes,
      trailId,
    } = this.state

    const payload = {
      ...trail,
      title,
      description,
      suitableForDriving,
      surfaceTypes,
    }
    await this.props.actions.editTrail(payload)

    this.props.navigation.goBack(null)
  }

  render() {
    const { description, title, suitableForDriving, surfaceTypes } = this.state

    const yesText = t('common/yes')
    const noText = t('common/no')

    const asphaltText = t('trails/asphalt')
    const dirtRoadText = t('trails/dirtRoad')
    const grassText = t('trails/grass')
    const gravelText = t('trails/gravel')
    const sandText = t('trails/sand')

    const surfaceValues = [
      { label: asphaltText, value: 'ASPHALT' },
      { label: dirtRoadText, value: 'DIRT_ROAD' },
      { label: grassText, value: 'GRASS' },
      { label: gravelText, value: 'GRAVEL' },
      { label: sandText, value: 'SAND' },
    ]

    return (
      <View style={styles.container}>
        <ScrollView style={styles.wrapper}>
          <View style={styles.box}>
            <AnimatedTextInput
              ref="name"
              label={t('trails/trailName')}
              value={title}
              inputContainerStyle={{
                borderTopWidth: 0,
              }}
              defaultMultiLineHeight={40}
              errorMessage={
                title.length > 0 &&
                title.length < 3 &&
                t('trails/titleLengthError')
              }
              onChangeText={title => this.setState({ title })}
            />
            <View style={styles.box} />
            <AnimatedTextInput
              ref="description"
              label={t('trails/description')}
              value={description}
              inputContainerStyle={{
                borderTopWidth: 0,
              }}
              multiLine={true}
              defaultMultiLineHeight={40}
              onChangeText={description => this.setState({ description })}
            />
          </View>
          <View style={styles.box}>
            <View style={styles.swithContainer}>
              <View style={styles.center}>
                <IconImage
                  style={styles.drivingIcon}
                  source="drivingIcon"
                  svg
                />
              </View>
              <Text
                type="title"
                weight="bold"
                style={styles.swithTitle}
                message="trails/isSuitableForCarriage"
              />

              <Switch
                style={styles.swithButton}
                onValueChange={suitableForDriving =>
                  this.setState({ suitableForDriving })
                }
                value={suitableForDriving}
                trackColor={{ true: theme.secondaryColor }}
              />
            </View>
          </View>
          <Text
            type="title"
            weight="black"
            style={[styles.questionTitle, styles.questionSpacing]}
            message="trails/requireWideTrailandLow"
          />

          <View style={styles.box}>
            <Text
              type="title"
              weight="black"
              style={[styles.questionTitle, styles.questionSpacing]}
              message="trails/surfaces"
            />

            <Checkbox
              values={surfaceValues}
              defaultValue={surfaceTypes}
              onSelect={val => this.setState({ surfaceTypes: val })}
            />
          </View>
        </ScrollView>

        <KeyboardSpacer topSpacing={15} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eaeaea',
  },
  wrapper: {
    flexDirection: 'column',
    backgroundColor: theme.backgroundColor,
    flex: 1,
  },
  saveButton: {
    fontSize: 16,
    color: 'white',
    marginRight: 10,
  },
  cancelButton: {
    fontSize: 16,
    color: 'white',
    marginLeft: 10,
  },
  box: {
    marginTop: 10,
    backgroundColor: theme.backgroundColor,
  },
  swithTitle: {
    flex: 1,
    color: '#7c7c7c',
    fontSize: 16.5,
    textAlign: 'left',
  },
  swithContainer: {
    height: 45,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.paddingHorizontal,
    backgroundColor: 'white',
  },
  swithButton: {},
  title: {
    color: '#444',
    fontSize: 16,
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBox: {
    padding: 15,
  },
  questionSpacing: {
    paddingHorizontal: theme.paddingHorizontal,
  },
  questionTitle: {
    marginTop: 15,
    fontSize: theme.font.sizes.small,
    color: '#7c7c7c',
  },
  questionDescription: {
    fontSize: 16,
    color: '#b7b7b8',
  },
  drivingIcon: {
    marginRight: 10,
    width: 25,
    height: 25,
  },
})

export default connect(
  state => ({ trails: state.trails }),
  dispatch => ({
    actions: bindActionCreators({ ...trailActions }, dispatch),
  })
)(EditTrail)
