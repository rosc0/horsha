import React, { PureComponent } from 'react'
import { Modal, StyleSheet, TouchableHighlight, View } from 'react-native'

class InternalModal extends PureComponent {
  static defaultProps = {
    visible: false,
    onClose: () => {},
  }

  render() {
    const { visible, onClose, children } = this.props

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <TouchableHighlight
          onPress={onClose}
          style={styles.container}
          underlayColor="transparent"
        >
          <View style={styles.innerContainer}>{children}</View>
        </TouchableHighlight>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  innerContainer: {
    borderRadius: 2,
    backgroundColor: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
})

export default InternalModal
