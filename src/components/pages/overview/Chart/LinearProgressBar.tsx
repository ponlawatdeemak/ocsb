import { LinearProgress } from '@mui/material'

const LinearProgressBar = ({
	value,
	color,
	fontColor,
	contentInner,
	contentOuter,
}: {
	value: number
	color: string
	fontColor: string
	contentInner: number | string
	contentOuter: number | string
	className?: string
}) => {
	return (
		<LinearProgress
			variant='determinate'
			value={value}
			sx={{
				height: '12px',
				borderRadius: '50px',
				backgroundColor: '#E6E6E6',
				position: 'relative',
				'& .MuiLinearProgress-bar': {
					borderRadius: '50px',
					backgroundColor: color,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'end',
					fontSize: '9px',
					':after': {
						content: `"${contentOuter}"`,
						color: 'black',
						position: 'absolute',
						right: '-25px',
					},
					':before': {
						content: `"${contentInner}"`,
						color: fontColor,
						paddingRight: '2px',
					},
				},
			}}
		/>
	)
}

export default LinearProgressBar
