import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { QuantityUnitKey } from '@/enum'

type StoreQuantityUnit = {
	quantityUnit: QuantityUnitKey
	setQuantityUnit: (quantityUnit: QuantityUnitKey) => void
}

const useQuantityUnit = create(
	persist<StoreQuantityUnit>(
		(set) => ({
			quantityUnit: QuantityUnitKey.Ton,
			setQuantityUnit: (quantityUnit: QuantityUnitKey) =>
				set(() => {
					return { quantityUnit: quantityUnit }
				}),
		}),
		{
			name: 'quantityUnit', // name of the item in the storage (must be unique)
			storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
		},
	),
)

export default useQuantityUnit
