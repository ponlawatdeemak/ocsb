import packageJson from './package.json'

export const APP_VERSION: string = `Version ${packageJson.version} (25 Oct 2024)`
export const APP_TITLE_TH: string = 'สำนักงานคณะกรรมการอ้อยและน้ำตาลทราย'
export const APP_TITLE_EN: string = 'Office of The Cane and Sugar Board'
export const APP_COPYRIGHT: string = `Copyright © ${new Date().getFullYear()} Thaicom All Rights Reserved`

export const DEFAULT_LOCATION = { lat: 13.80998598298836, lng: 100.55951031319972 } // location of Thaicom City Center
export const DEFAULT_ZOOM = 5.2 // zoom out full thailand map
export const DEFAULT_PITCH: number = 80
export const MAX_PITCH: number = 85

export const SHOW_BOUNDARY: boolean = true
export const ENABLE_TOP_APPBAR = false
export const DEFAULT_LOCALE = 'th'

export const IMG_PATH = `${process.env.NEXT_PUBLIC_API_HOSTNAME_MIS}/um/img`
