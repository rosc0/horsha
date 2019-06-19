import React, { PureComponent } from 'react'
import uuid from 'uuid/v4'
import Mapbox from '@mapbox/react-native-mapbox-gl'

import Text from '@components/Text'

class MapCallout extends PureComponent {
  static defaultProps = {
    strokeColor: 'red',
    strokeWidth: 4,
  }

  constructor(props) {
    super(props)

    this.state = {
      id: props.id || uuid(),
    }
  }

  render() {
    const { id } = this.state
    const { title, ...props } = this.props

    return (
      <Mapbox.Callout
        id={id}
        // style={{ width: 120, height: 120, backgroundColor: 'white' , position: 'absolute' }}
        style={{
          // flex: 1,
          height: 120,
          backgroundColor: 'white',
          position: 'absolute',
          bottom: 0,
          width: '100%',
          // flexDirection: 'center',
          justifyContent: 'center',
        }}
        {...props}
      >
        <Text text={title} />
        <Text text="test" />
      </Mapbox.Callout>
    )
  }
}

export default MapCallout
