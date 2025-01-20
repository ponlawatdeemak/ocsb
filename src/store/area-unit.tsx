import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { AreaUnit } from '@/enum'

type StoreAreaUnit = {
	areaUnit: AreaUnit
	setAreaUnit: (areaUnit: AreaUnit) => void
}

const useAreaUnit = create(
	persist<StoreAreaUnit>(
		(set) => ({
			areaUnit: AreaUnit.Rai,
			setAreaUnit: (areaUnit: AreaUnit) =>
				set(() => {
					return { areaUnit: areaUnit }
				}),
		}),
		{
			name: 'sugarcaneAreaUnit', // name of the item in the storage (must be unique)
			storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
		},
	),
)

export default useAreaUnit
