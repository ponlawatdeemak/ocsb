import { UserRole } from '@interface/config/um.config'
import { LngLatBoundsLike } from 'maplibre-gl'

export enum AuthPath {
	Login = '/auth/login',
	ForgetPassword = '/auth/forget-password',
	ResetPassword = '/auth/reset-password',
	AuthStatus = '/auth/status',
}

export const authPathPrefix = '/auth'

export enum PublicPath {
	Overview = '/overview',
	About = '/about',
	Glossary = '/glossary',
	Setting = '/',
}

export enum PrivatePath {
	MapAnalyze = '/map-analyze',
	BurntArea = '/map-analyze/burnt-area',
	PlantingArea = '/map-analyze/planting-area',
	UserManagement = '/user-management',
	UserManagementForm = '/user-management/form',
	Profile = '/profile',
	LineExport = '/line-export',
}

export const AppPath = { ...AuthPath, ...PublicPath, ...PrivatePath }

export const allowGuestPages = [
	AppPath.Overview,
	AppPath.About,
	AppPath.Glossary,
	AppPath.Login,
	AppPath.ForgetPassword,
	AppPath.ResetPassword,
	AppPath.AuthStatus,
]

export const mapAnalyzeMenuConfig: {
	id: keyof typeof AppPath
	label: string
	path: string
	access?: string[]
}[] = [
	{
		id: 'BurntArea',
		label: 'menu.burntArea',
		path: AppPath.BurntArea,
	},
	{
		id: 'PlantingArea',
		label: 'menu.plantingArea',
		path: AppPath.PlantingArea,
	},
]

export const appMenuConfig: {
	id: keyof typeof AppPath
	label: string
	path: string
	children?: typeof mapAnalyzeMenuConfig
	access: UserRole[]
}[] = [
	{
		id: 'Overview',
		label: 'menu.overview',
		path: AppPath.Overview,
		access: [],
	},
	{
		id: 'MapAnalyze',
		label: 'menu.mapAnalyze',
		path: AppPath.MapAnalyze,
		children: mapAnalyzeMenuConfig,
		access: [
			UserRole.SuperAdmin,
			UserRole.Admin,
			UserRole.StaffSpecial,
			UserRole.StaffReg1,
			UserRole.StaffReg2,
			UserRole.StaffReg3,
			UserRole.StaffReg4,
		],
	},
	{
		id: 'About',
		label: 'menu.about',
		path: AppPath.About,
		access: [],
	},
	{
		id: 'Glossary',
		label: 'menu.glossary',
		path: AppPath.Glossary,
		access: [],
	},
	{
		id: 'Setting',
		label: 'menu.setting',
		path: AppPath.Setting,
		access: [],
	},
	{
		id: 'UserManagement',
		label: 'menu.userManagement',
		path: AppPath.UserManagement,
		access: [UserRole.SuperAdmin, UserRole.Admin],
	},
]

export const layerIdConfig = {
	toolCurrentLocation: 'tool-current-layer',
	toolMeasurement: 'tool-measurement-layer',
}

export const thaiExtent: LngLatBoundsLike = [97.3758964376, 5.69138418215, 105.589038527, 20.4178496363]

export const enSuffix = 'En'
