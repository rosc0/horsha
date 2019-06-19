import { createStackNavigator } from 'react-navigation'
import Gallery from '@screens/gallery/Gallery'
import CropPicture from '@screens/gallery/CropPicture'
import TakePicture from '@screens/gallery/TakePicture'

import { STACK_CONFIG } from './config'

import AddJournalPost from '@screens/journal/AddJournalPost'
import ChooseOptionalHorse from '@screens/horses/ChooseOptionalHorse'
import HorseAlbum from '@screens/horses/HorseAlbum'
import HorseRides from '@screens/horses/HorseRides'

export const ModalStack = createStackNavigator(
  {
    AddJournalPost: AddJournalPost,
    ChooseOptionalHorse: ChooseOptionalHorse,
    HorseAlbum: HorseAlbum,
    HorseRides: HorseRides,
    Gallery: Gallery,
    CropPicture: CropPicture,
    TakePicture: TakePicture,
  },
  {
    initialRouteName: 'AddJournalPost',
    defaultNavigationOptions: STACK_CONFIG,
  }
)
