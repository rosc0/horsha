import React, { PureComponent } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

import Icon from '@components/Icon'
import Text from '@components/Text'
import { IconImage } from '@components/Icons'

const { width: deviceWidth } = Dimensions.get('window')

class RecordActions extends PureComponent {
  renderTrailFoillowed = () => {
    const { onPressFollowTrail, trailFollowed } = this.props

    return (
      <TouchableOpacity
        style={styles.followTrailInfoContainer}
        onPress={onPressFollowTrail}
      >
        <Text
          type="title"
          weight="bold"
          style={styles.followTrailLabel}
          message="record/followTrail"
        />

        <Text
          type="title"
          weight="bold"
          style={styles.followTrailTitle}
          text={
            trailFollowed.title.length > 20
              ? `${trailFollowed.title.toUpperCase().substring(0, 17)}...`
              : trailFollowed.title.toUpperCase()
          }
        />
      </TouchableOpacity>
    )
  }

  renderActions = () => {
    const {
      onPressStartRide,
      onPressFollowTrail,
      onPressStopRide,
      onPressPauseRide,
      onPressResumeRide,
      onPressAddToRides,
      onPressDeleteRide,
      isRecording = false,
      isPaused = false,
      isStartingRide = false,
      isFinished = false,
      isDeviceConnected,
      trailFollowed,
    } = this.props

    const isSmallScreen = deviceWidth < 375

    if (isFinished) {
      return (
        <View style={styles.container}>
          <View
            style={[styles.actionsContainer, styles.finishedActionsContainer]}
          >
            <TouchableOpacity
              onPress={!isDeviceConnected ? () => {} : onPressAddToRides}
              style={[
                styles.buttonContainer,
                !isDeviceConnected && styles.buttonContainerLocked,
              ]}
            >
              <Text
                type="title"
                weight="bold"
                style={styles.buttonLabel}
                message="record/addToRides"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onPressDeleteRide}
              style={[styles.buttonContainer, styles.secondaryButtonContainer]}
            >
              {!isSmallScreen && (
                <Icon name="delete" style={styles.secondaryButtonIcon} />
              )}

              <Text
                type="title"
                weight="bold"
                style={[styles.buttonLabel, styles.secondaryButtonLabel]}
                message="record/delete"
              />
            </TouchableOpacity>
          </View>
        </View>
      )
    }

    if (isPaused) {
      return (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            onPress={onPressResumeRide}
            style={styles.buttonContainer}
          >
            {!isSmallScreen && <Icon name="resume" style={styles.buttonIcon} />}

            <Text
              type="title"
              weight="bold"
              style={styles.buttonLabel}
              message="record/resume"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onPressStopRide}
            style={[styles.buttonContainer, styles.stopButtonContainer]}
          >
            {!isSmallScreen && <Icon name="stop" style={styles.buttonIcon} />}

            <Text
              type="title"
              weight="bold"
              style={styles.buttonLabel}
              message="record/stop"
            />
          </TouchableOpacity>

          {trailFollowed.id && this.renderTrailFoillowed()}
        </View>
      )
    }

    if (isRecording && !isPaused) {
      return (
        <View style={styles.container}>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              onPress={onPressPauseRide}
              style={[styles.buttonContainer, styles.pauseButtonContainer]}
            >
              {!isSmallScreen && (
                <IconImage source="pauseIcon" style={styles.pauseButtonIcon} />
              )}

              <Text
                type="title"
                weight="bold"
                style={[styles.buttonLabel, styles.pauseButtonLabel]}
                message="record/pause"
              />
            </TouchableOpacity>

            {trailFollowed.id && this.renderTrailFoillowed()}
          </View>
        </View>
      )
    }

    return (
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          onPress={!isStartingRide ? onPressStartRide : () => {}}
          style={[
            styles.buttonContainer,
            isStartingRide && styles.buttonContainerDisabled,
          ]}
        >
          {!!isStartingRide ? (
            <ActivityIndicator color="white" style={styles.buttonIconLoading} />
          ) : (
            !isSmallScreen && <Icon name="resume" style={styles.buttonIcon} />
          )}

          <Text
            type="title"
            weight="bold"
            style={styles.buttonLabel}
            message="record/startRide"
          />
        </TouchableOpacity>

        {trailFollowed.id ? (
          this.renderTrailFoillowed()
        ) : (
          <TouchableOpacity
            style={[styles.buttonContainer, styles.secondaryButtonContainer]}
            onPress={onPressFollowTrail}
          >
            <Text
              type="title"
              weight="bold"
              style={[styles.buttonLabel, styles.secondaryButtonLabel]}
              message="record/followTrail"
            />
          </TouchableOpacity>
        )}
      </View>
    )
  }

  render() {
    return <View style={styles.container}>{this.renderActions()}</View>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    height: 80,
    backgroundColor: 'white',
  },
  pauseButtonContainer: {
    backgroundColor: '#FFB332',
    paddingHorizontal: 30,
    paddingVertical: 17.3,
  },
  pauseButtonIcon: {
    tintColor: 'white',
    width: 18,
    height: 18,
    marginRight: 7,
  },
  pauseButtonLabel: {
    color: 'white',
  },
  actionsContainer: {
    flex: 1,
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonContainer: {
    padding: 15,
    backgroundColor: '#1E8583',
    justifyContent: 'center',
    flexDirection: 'row',
    borderRadius: 7,
  },
  buttonContainerDisabled: {
    backgroundColor: '#BCBEC0',
  },
  buttonIconLoading: {
    marginRight: 5,
  },
  buttonLabel: {
    color: 'white',
    textAlign: 'center',
    alignSelf: 'center',
  },
  buttonIcon: {
    color: 'white',
    marginRight: 5,
  },
  secondaryButtonContainer: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#1E8583',
    marginLeft: 10,
  },
  secondaryButtonIcon: {
    color: '#1E8583',
    marginRight: 5,
  },
  secondaryButtonLabel: {
    color: '#1E8583',
  },
  stopButtonContainer: {
    backgroundColor: '#D5142B',
    marginLeft: 10,
  },
  finishedActionsContainer: {
    position: 'relative',
  },
  followTrailInfoContainer: {
    justifyContent: 'center',
    marginLeft: 10,
  },
  followTrailLabel: {
    color: '#808080',
    fontSize: 12,
  },
  followTrailTitle: {
    color: '#1E8583',
    fontSize: 12,
  },
})

export default RecordActions
