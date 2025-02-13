import { LinearProgress } from '@mui/material'

const LinearProgressBar = ({ value, color }: { value: number; color: string }) => {
	return (
		<LinearProgress
			variant='determinate'
			value={value}
			sx={{
				height: '12px',
				borderRadius: '50px',
				backgroundColor: '#E6E6E6',
				'& .MuiLinearProgress-bar': {
					borderRadius: '50px',
					backgroundColor: color,
				},
			}}
		/>
	)
}

export default LinearProgressBar
