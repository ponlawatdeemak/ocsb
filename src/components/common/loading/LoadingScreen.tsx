import { CircularProgress } from '@mui/material'

const LoadingScreen = () => {
	return (
		<div className='flex h-full w-full flex-col items-center justify-center bg-white'>
			<CircularProgress size={80} color='primary' />
		</div>
	)
}

export default LoadingScreen
