// Find closest index for a given value
const closest = (array, n) => array.findIndex(elem => n <= elem)

export function valueToPosition(value, valuesArray, sliderLength) {
  const index = closest(valuesArray, value)
  const arrLength = valuesArray.length - 1
  const validIndex = index === -1 ? arrLength : index

  return (sliderLength * validIndex) / arrLength
}

export function positionToValue(position, valuesArray, sliderLength) {
  const max = valuesArray.length - 1
  const min = 0
  const positionPercent = (100 * position) / sliderLength
  const minv = Math.log(1)
  const maxv = Math.log(max)

  if (positionPercent === 0) {
    return min
  } else if (positionPercent === 100) {
    return max
  }

  const scale = (maxv - minv) / 100
  return Math.floor(Math.exp(minv + scale * positionPercent)) || 0
}

export function createArray(start, end, step) {
  var i
  var length
  var direction = start - end > 0 ? -1 : 1
  var result = []
  if (!step) {
    //console.log('invalid step: ', step)
    return result
  } else {
    length = Math.abs((start - end) / step) + 1
    for (i = 0; i < length; i++) {
      result.push(start + i * Math.abs(step) * direction)
    }
    return result
  }
}
