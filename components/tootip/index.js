import React, { PureComponent } from 'react'
import {
  Dimensions,
  Modal,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native'

const Screen = Dimensions.get('window')
const ScreenWidth = Screen.width
const isIOS = Platform.OS === 'ios'
const DROPDOWN_SIZE = ScreenWidth - Dimensions.get('window').width * 0.7
class Tooltip extends PureComponent {
  state = {
    isVisible: false,
    yOffset: 0,
    xOffset: 0,
    elementWidth: 0,
    elementHeight: 0,
  }

  renderedElement

  toggleTooltip = () => {
    const { onClose } = this.props
    this.setState(prevState => {
      if (prevState.isVisible && !isIOS) {
        onClose && onClose()
      }

      return { isVisible: !prevState.isVisible }
    })
  }

  wrapWithPress = (toggleOnPress, children) => {
    if (toggleOnPress) {
      return (
        <TouchableOpacity onPress={this.toggleTooltip} activeOpacity={1}>
          {children}
        </TouchableOpacity>
      )
    }

    return children
  }

  getTooltipStyle = () => {
    const { height, backgroundColor, width, containerStyle } = this.props

    return {
      position: 'absolute',
      left: DROPDOWN_SIZE / 2,
      top: 40,
      width,
      height,
      backgroundColor,
      flex: 1,
      borderRadius: 10,
      padding: 10,
      ...containerStyle,
    }
  }

  renderContent = withTooltip => {
    const { popover, toggleOnPress } = this.props

    if (!withTooltip) {
      return this.wrapWithPress(toggleOnPress, this.props.children)
    }

    const tooltipStyle = this.getTooltipStyle()
    return (
      <View>
        <View style={tooltipStyle}>{popover}</View>
      </View>
    )
  }

  render() {
    const { isVisible } = this.state
    const { onClose, withOverlay, onOpen } = this.props

    return (
      <View collapsable={false} ref={e => (this.renderedElement = e)}>
        {this.renderContent(false)}
        <Modal
          animationType="fade"
          visible={isVisible}
          transparent
          onDismiss={onClose}
          onShow={onOpen}
          onRequestClose={onClose}
        >
          <TouchableOpacity
            style={styles.container(withOverlay)}
            onPress={this.toggleTooltip}
            activeOpacity={1}
          >
            {this.renderContent(true)}
          </TouchableOpacity>
        </Modal>
      </View>
    )
  }
}

Tooltip.defaultProps = {
  withOverlay: true,
  highlightColor: 'transparent',
  withPointer: true,
  toggleOnPress: true,
  height: 40,
  width: 150,
  containerStyle: {},
  backgroundColor: '#617080',
  onClose: () => {},
  onOpen: () => {},
}

const styles = {
  container: withOverlay => ({
    backgroundColor: 'rgba(0, 0, 0, 0.30)',
    flex: 1,
  }),
}

export default Tooltip
