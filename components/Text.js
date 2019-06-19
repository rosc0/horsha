import React, { PureComponent } from 'react'
import { Text as ReactText } from 'react-native'
import { FormattedMessage } from 'react-native-globalize'
import { theme } from '@styles/theme'

class Text extends PureComponent {
  static defaultProps = {
    type: 'default',
    style: {},
  }

  render() {
    const {
      weight,
      style,
      type = 'default',
      text,
      message,
      values,
      children,
      ...props
    } = this.props

    let fontWeight = ''
    switch (weight) {
      case 'bold':
        {
          fontWeight = '-Bold'
        }
        break
      case 'black':
        {
          if (theme.font[type].fontFamily === 'Nunito') {
            fontWeight = '-Black'
          } else {
            fontWeight = '-Bold'
          }
        }
        break
      case 'semiBold':
        {
          fontWeight = '-SemiBold'
        }
        break
      case 'light':
        {
          if (theme.font[type].fontFamily === 'Nunito') {
            fontWeight = '-Light'
          }
        }
        break
    }

    let styles = style
    if (type !== 'none') {
      const fontFamily = `${theme.font[type].fontFamily}${fontWeight}`
      styles = [{ fontFamily: fontFamily, color: theme.fontColor }, style]
    }

    const formatText = (!message && text) || ''

    return (
      <React.Fragment>
        {message ? (
          <FormattedMessage message={message} values={values} style={styles} />
        ) : (
          formatText !== '' && (
            <ReactText {...props} style={styles}>
              {formatText}
            </ReactText>
          )
        )}
        {children && children}
      </React.Fragment>
    )
  }
}

export default Text
