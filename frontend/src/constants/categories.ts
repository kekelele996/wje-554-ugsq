import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import { ServiceCategory } from './enums';

export const categoryConfig = {
  [ServiceCategory.CLEANING]: { label: '清洁', icon: CleaningServicesIcon, color: '#2d7f6f' },
  [ServiceCategory.REPAIR]: { label: '维修', icon: BuildCircleIcon, color: '#9b5c1c' },
  [ServiceCategory.PLUMBING]: { label: '管道', icon: PlumbingIcon, color: '#3569a8' },
  [ServiceCategory.MOVING]: { label: '搬家', icon: LocalShippingIcon, color: '#7a4b9d' },
  [ServiceCategory.ERRAND]: { label: '跑腿', icon: DirectionsRunIcon, color: '#b24635' }
} as const;
