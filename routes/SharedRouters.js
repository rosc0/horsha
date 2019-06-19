import { STACK_CONFIG } from './config'
// Auth
// Globals
import Gallery from '@screens/gallery/Gallery'
import CropPicture from '@screens/gallery/CropPicture'
import TakePicture from '@screens/gallery/TakePicture'
import UserProfile from '@screens/user-profile/UserProfile'
import ProfileAndSettings from '@screens/settings/ProfileAndSettings'
import EditProfile from '@screens/user-profile/EditProfile'
import Report from '@screens/report/Report'
import TrailAlbum from '@screens/trails/TrailAlbum'

// Record
// Horses
import EditHorse from '@screens/horses/EditHorse'
import HorseRides from '@screens/horses/HorseRides'
import AddHorseRide from '@screens/horses/AddHorseRide'
import HorseAlbum from '@screens/horses/HorseAlbum'
import HorseTeam from '@screens/horses/HorseTeam'
import ChooseHorse from '@screens/horses/HorseChoose'
import Profile from '@screens/profile/Profile'
import ProfileHorseCare from '@screens/profile/ProfileHorseCare'
import ArchivedUser from '@screens/horses/ArchivedUser'
import HorseJournal from '@screens/journal/HorseJournal'

// Stats
import HorseStats from '@screens/stats/HorseStats'
import UserStats from '@screens/stats/UserStats'
// Journal
import AddJournalPost from '@screens/journal/AddJournalPost'
import EditJournalPost from '@screens/journal/EditJournalPost'
import JournalAlbum from '@screens/journal/JournalAlbum'
// Settings
import Notifications from '@screens/notifications/Notifications'
import SettingsList from '@screens/settings/SettingsList'
import ManageEmails from '@screens/settings/ManageEmails'
import ChangePassword from '@screens/settings/ChangePassword'
import HeightSettings from '@screens/settings/HeightSettings'
import NotificationSettings from '@screens/settings/NotificationSettings'
import UnitSettings from '@screens/settings/UnitSettings'
import About from '@screens/settings/About'
// Legal
import TermsAndConditions from '@screens/legal/TermsAndConditions'
import LicensesAndCredits from '@screens/legal/LicensesAndCredits'
import PrivacyPolicy from '@screens/legal/PrivacyPolicy'
import NavigateToHelp from '@screens/legal/Help'
import NavigateToSendFeedback from '@screens/legal/Feedback'
// Newsfeed
import NewsfeedDetails from '@screens/newsfeed/Details'
// Trails
import TrailDetails from '@screens/trails/Details'
import POICreate from '@screens/poi/Create'
import POIEdit from '@screens/poi/Edit'
import POIFilter from '@screens/poi/Filter'
import POIDetail from '@screens/poi/Detail'
import SeeMore from '@screens/trails/SeeMore'
import TrailEdit from '@screens/trails/Edit'

// Reviews
import ReviewCreate from '@screens/review/Create'
import ReviewEdit from '@screens/review/Edit'
// Friends
// Rides
import RideDetail from '@screens/rides/RideDetail'
// Unverified user
import UnverifiedEmail from '@screens/unverified/UnverifiedEmail'

import ChooseOptionalHorse from '@screens/horses/ChooseOptionalHorse'

// Global Screens
export const globalScreens = {
  Gallery: {
    screen: Gallery,
    navigationOptions: STACK_CONFIG,
  },
  CropPicture: {
    screen: CropPicture,
    navigationOptions: STACK_CONFIG,
  },
  TakePicture: {
    screen: TakePicture,
    navigationOptions: STACK_CONFIG,
  },
  Notifications: {
    screen: Notifications,
    navigationOptions: STACK_CONFIG,
  },
  UserProfile: {
    screen: UserProfile,
    navigationOptions: STACK_CONFIG,
  },
  EditProfile: {
    screen: EditProfile,
    navigationOptions: STACK_CONFIG,
  },
  ProfileAndSettings: {
    screen: ProfileAndSettings,
    navigationOptions: STACK_CONFIG,
  },
  SettingsList: {
    screen: SettingsList,
    navigationOptions: STACK_CONFIG,
  },
  ManageEmails: {
    screen: ManageEmails,
    navigationOptions: STACK_CONFIG,
  },
  ChangePassword: {
    screen: ChangePassword,
    navigationOptions: STACK_CONFIG,
  },
  HeightSettings: {
    screen: HeightSettings,
    navigationOptions: STACK_CONFIG,
  },
  NotificationSettings: {
    screen: NotificationSettings,
    navigationOptions: STACK_CONFIG,
  },
  UnitSettings: {
    screen: UnitSettings,
    navigationOptions: STACK_CONFIG,
  },
  About: {
    screen: About,
    navigationOptions: STACK_CONFIG,
  },
  TermsAndConditions: {
    screen: TermsAndConditions,
    navigationOptions: STACK_CONFIG,
  },
  PrivacyPolicy: {
    screen: PrivacyPolicy,
    navigationOptions: STACK_CONFIG,
  },
  NavigateToHelp: {
    screen: NavigateToHelp,
    navigationOptions: STACK_CONFIG,
  },
  NavigateToSendFeedback: {
    screen: NavigateToSendFeedback,
    navigationOptions: STACK_CONFIG,
  },
  LicensesAndCredits: {
    screen: LicensesAndCredits,
    navigationOptions: STACK_CONFIG,
  },
  RideDetail: {
    screen: RideDetail,
    navigationOptions: STACK_CONFIG,
  },
  HorseStats: {
    screen: HorseStats,
    navigationOptions: STACK_CONFIG,
  },
  UserStats: {
    screen: UserStats,
    navigationOptions: STACK_CONFIG,
  },
  Profile: {
    screen: Profile,
    navigationOptions: STACK_CONFIG,
  },
  ProfileHorseCare: {
    screen: ProfileHorseCare,
    navigationOptions: STACK_CONFIG,
  },
  ChooseHorse: {
    screen: ChooseHorse,
    navigationOptions: STACK_CONFIG,
  },
  AddJournalPost: {
    screen: AddJournalPost,
    navigationOptions: STACK_CONFIG,
  },
  JournalDetail: {
    screen: NewsfeedDetails,
    navigationOptions: STACK_CONFIG,
  },
  JournalAlbum: {
    screen: JournalAlbum,
    navigationOptions: STACK_CONFIG,
  },
  HorseAlbum: {
    screen: HorseAlbum,
    navigationOptions: STACK_CONFIG,
  },
  UnverifiedEmail: {
    screen: UnverifiedEmail,
    navigationOptions: STACK_CONFIG,
  },
  CreatePOI: {
    screen: POICreate,
    navigationOptions: STACK_CONFIG,
  },
  EditPOI: {
    screen: POIEdit,
    navigationOptions: STACK_CONFIG,
  },
  FilterPOI: {
    screen: POIFilter,
    navigationOptions: STACK_CONFIG,
  },
  CreateReview: {
    screen: ReviewCreate,
    navigationOptions: STACK_CONFIG,
  },
  EditReview: {
    screen: ReviewEdit,
    navigationOptions: STACK_CONFIG,
  },
  SeeMore: {
    screen: SeeMore,
    navigationOptions: STACK_CONFIG,
  },
  HorseRides: {
    screen: HorseRides,
    navigationOptions: STACK_CONFIG,
  },
  AddHorseRide: {
    screen: AddHorseRide,
    navigationOptions: STACK_CONFIG,
  },
  EditJournal: {
    screen: EditJournalPost,
    navigationOptions: STACK_CONFIG,
  },
  TrailDetails: {
    screen: TrailDetails,
    navigationOptions: STACK_CONFIG,
  },
  EditHorse: {
    screen: EditHorse,
    navigationOptions: STACK_CONFIG,
  },
  Report: {
    screen: Report,
    navigationOptions: STACK_CONFIG,
  },
  HorseTeam: {
    screen: HorseTeam,
    navigationOptions: STACK_CONFIG,
  },
  ArchivedUser: {
    screen: ArchivedUser,
    navigationOptions: STACK_CONFIG,
  },
  POIDetail: {
    screen: POIDetail,
    navigationOptions: STACK_CONFIG,
  },
  TrailAlbum: {
    screen: TrailAlbum,
    navigationOptions: STACK_CONFIG,
  },
  Edit: {
    screen: TrailEdit,
    navigationOptions: STACK_CONFIG,
  },
  HorseJournal: {
    screen: HorseJournal,
    navigationOptions: STACK_CONFIG,
  },
  ChooseOptionalHorse: {
    screen: ChooseOptionalHorse,
    navigationOptions: STACK_CONFIG,
  },
}
