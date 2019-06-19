import Reactotron, {
  trackGlobalErrors,
  openInEditor,
  overlay,
  asyncStorage,
  networking,
} from 'reactotron-react-native'

console.disableYellowBox = true

// First, set some configuration settings on how to connect to the app
Reactotron.configure({
  name: 'Horsha',
})

// add some more plugins for redux
Reactotron.use(trackGlobalErrors())
  .use(openInEditor())
  .use(overlay())
  .use(asyncStorage())
  .use(networking())

// if we're running in DEV mode, then let's connect!
if (__DEV__) {
  Reactotron.connect({
    enabled: true,
    host: '85.145.201.97', // server ip
    port: 9090,
  })
  Reactotron.clear()
}

console.tron = Reactotron
