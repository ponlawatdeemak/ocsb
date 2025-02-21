import MapView from '@/components/common/map/MapView'
import useMapStore from '@/components/common/map/store/map'
import { Box } from '@mui/material'
import classNames from 'classnames'
import { useSession } from 'next-auth/react'
import React, { useEffect } from 'react'

interface BurntMapMainProps {
	className?: string
}

const BurntMapMain: React.FC<BurntMapMainProps> = ({ className = '' }) => {
	const { data: session } = useSession()
	const { mapLibre, overlay } = useMapStore()

	useEffect(() => {
		if (mapLibre && overlay) {
			console.log('👻 session: ', session?.user)

			mapLibre.on('moveend', () => {
				const bound = mapLibre.getBounds()
				// load hotspot if open
				// load burnt if open
				// load plant if open

				// set overlay
				overlay.setProps({ layers: [] })
			})
		}
	}, [mapLibre, session?.user])

	return (
		<Box className={classNames('', className)}>
			<Box className='flex h-full grow'>
				<MapView loading />
			</Box>
		</Box>
	)
}

export default BurntMapMain
