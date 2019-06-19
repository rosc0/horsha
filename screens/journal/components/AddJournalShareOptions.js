import React, { PureComponent } from 'react'
import { StyleSheet, Switch, TouchableOpacity, View } from 'react-native'
import ActionSheet from 'rn-action-sheet'

import { theme } from '@styles/theme'
import t from '@config/i18n'
import Icon from '@components/Icon'
import Text from '@components/Text'

const shareScopeOptions = {
  PRIVATE: 'PRIVATE',
  FRIENDS: 'FRIENDS',
  PUBLIC: 'PUBLIC',
}

class AddJournalShareOptions extends PureComponent {
  static defaultProps = {
    shareScope: shareScopeOptions.FRIENDS,
    onChangeShareScope: () => {},
  }

  static getDerivedStateFromProps = (props, state) => {
    if (props.shareScope !== state.shareScope) {
      return {
        shareScope: props.shareScope,
      }
    }

    if (props.shareFacebook !== state.shareFacebook) {
      return {
        shareFacebook: props.shareFacebook,
      }
    }

    return null
  }

  state = {
    shareScope: shareScopeOptions.FRIENDS,
  }

  handleChooseShareScope = () => {
    ActionSheet.show(
      {
        title: t('journal/shareScope'),
        options: [
          t('horses/private'),
          t('horses/friends'),
          t('horses/public'),
          t('common/cancel'),
        ],
        cancelButtonIndex: 3,
        tintColor: theme.secondaryColor,
      },
      index => {
        let option = this.state.shareScope

        switch (index) {
          case 0:
            {
              option = shareScopeOptions.PRIVATE
            }
            break
          case 1:
            {
              option = shareScopeOptions.FRIENDS
            }
            break
          case 2:
            {
              option = shareScopeOptions.PUBLIC
            }
            break
        }

        this.setState({ shareScope: option })

        return this.props.onChangeShareScope(option)
      }
    )
  }

  renderShareOptions = () => {
    const { shareScope } = this.state

    return (
      <TouchableOpacity
        style={styles.shareOptionsButton}
        onPress={this.handleChooseShareScope}
      >
        <View style={styles.innerContainer}>
          <Text
            type="title"
            weight="bold"
            message={t('horses/whoCanSeeThis')}
            style={[styles.shareFacebookText, { paddingLeft: 5 }]}
          />
        </View>
        <Text
          type="title"
          weight="bold"
          message={t(`horses/${shareScope}`)}
          style={styles.shareOptionsType}
        />
        <Icon name="arrow_right" style={styles.arrowIcon} />
      </TouchableOpacity>
    )
  }

  render() {
    const { shareFacebook, onPressShareFacebook, editMode = false } = this.props

    return (
      <View style={styles.container}>
        {this.renderShareOptions()}

        <View style={styles.shareFacebookContainer}>
          <View style={styles.innerContainer}>
            <Text
              type="title"
              weight="bold"
              message="Facebook"
              style={styles.shareFacebookText}
            />
          </View>

          <Switch
            value={shareFacebook}
            onValueChange={onPressShareFacebook}
            style={styles.shareFacebookSwitch}
            disabled={editMode}
            trackColor={{ true: theme.secondaryColor }}
          />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderBottomColor: '#EEE',
    borderTopColor: '#EEE',
    marginVertical: 15,
    backgroundColor: 'white',
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareOptionsButton: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: '#EEE',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    borderTopColor: '#EEE',
  },
  shareOptionsType: {
    fontSize: 16,
    color: '#1E8583',
  },
  shareOptionsIcon: {
    color: '#1E8583',
    marginRight: 20,
    marginLeft: 5,
    fontSize: 26,
  },
  shareFacebookContainer: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  shareFacebookIcon: {
    fontSize: 50,
    color: '#38579D',
  },
  shareFacebookText: {
    ...theme.font.sectionTitle,
  },
  shareDisabled: {
    color: 'silver',
  },
  shareFacebookSwitch: {
    marginLeft: 5,
  },
  arrowIcon: {
    // marginRight: 10,
  },
})

export default AddJournalShareOptions
