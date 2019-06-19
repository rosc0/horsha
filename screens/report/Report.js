import React, { PureComponent } from 'react'
import { Alert, KeyboardAvoidingView, StyleSheet, View } from 'react-native'
import t from '@config/i18n'
import Loading from '@components/Loading'
import Button from '@components/Button'
import Text from '@components/Text'
import HeaderTitle from '@components/HeaderTitle'
import AnimatedTextInput from '@components/AnimatedTextInput'
import Report from '@api/report'
import { theme } from '@styles/theme'

const ReportAPI = new Report()

export default class CreateReport extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: <HeaderTitle title={'report/report'} />,
      headerBackTitle: null,
      tabBarVisible: false,
    }
  }

  state = {
    reportText: '',
    fetching: false,
    focus: true,
  }

  sendReport = async () => {
    const thankYou = t('report/thankYou')
    const weWillLookIntoIt = t('report/weWillLookIntoIt')
    const { endpoint } = this.props.navigation.state.params
    const { reportText } = this.state
    this.setState({ focus: false })

    await ReportAPI.report(endpoint, reportText)
    this.props.navigation.goBack(null)

    Alert.alert(thankYou, weWillLookIntoIt)
  }

  render() {
    const { reportText, fetching, focus } = this.state

    return (
      <View style={styles.wrapper}>
        <KeyboardAvoidingView style={styles.container} behavior="padding">
          <View style={styles.textWrapper}>
            <Text
              type="title"
              weight="semiBold"
              style={styles.text}
              message="reports/reportTittle"
            />
          </View>
          <View style={[styles.addCommentWrapper]}>
            <AnimatedTextInput
              label={t('reports/reportPlaceholder')}
              multiLine={true}
              onChangeText={reportText => this.setState({ reportText })}
              value={reportText}
            />
          </View>
          {fetching ? (
            <Loading type="spinner" />
          ) : (
            <Button
              style={styles.loginButton}
              label={'reports/reportButton'}
              onPress={this.sendReport}
            />
          )}
        </KeyboardAvoidingView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    height: '100%',
    backgroundColor: theme.backgroundColor,
  },
  addCommentWrapper: {
    paddingBottom: 20,
  },
  textWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 60,
    paddingVertical: 15,
  },
  text: {
    color: '#565656',
    fontSize: 20,
    textAlign: 'center',
  },
})
