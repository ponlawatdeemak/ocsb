import { create } from 'zustand'

interface ObjectPassword {
	isSuccess?: boolean | null
	email?: string | null
	type?: string | null
}

interface PasswordState {
	forgetPassword: ObjectPassword | null
	setDataForgetPassword: (value: ObjectPassword | null) => void
}

export const passwordStore = create<PasswordState>((set, get) => ({
	forgetPassword: null,
	setDataForgetPassword: (value: ObjectPassword | null) => {
		set({ forgetPassword: value })
	},
}))
