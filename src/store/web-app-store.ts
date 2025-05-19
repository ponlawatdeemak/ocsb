import { create } from 'zustand'

interface Store {
	apiToken: string
	identityId: string

	setApiToken: (apiToken: string) => void
	setIdentityId: (identityId: string) => void
}

export const useWebAppStore = create<Store>((set) => {
	return {
		apiToken: '',
		identityId: '',

		setApiToken: (apiToken: string) => set((state) => ({ apiToken: apiToken })),
		setIdentityId: (identityId: string) => set((state) => ({ identityId: identityId })),
	}
})
