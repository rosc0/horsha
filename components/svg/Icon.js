import React from 'react'
import SvgIcon from './SvgIcon'
import svgs from './svgs'

{
  /* 
  <Icon
    name={name}
    height={height}
    width={width}
    strokeWidth={strokeWidth}
    fill={fill}
  />
*/
}

const Icon = props => <SvgIcon {...props} svgs={svgs} />

export default Icon
