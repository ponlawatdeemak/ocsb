import { LinearProgress, Tooltip } from '@mui/material'

const LinearProgressBar = ({
	value,
	color,
	fontColor,
	contentInner,
	contentOuter,
	titleInner,
	titleOuter,
	colorInner = '#000000',
	colorOuter = '#000000',
}: {
	value: number
	color: string
	fontColor: string
	contentInner: number | string
	contentOuter: number | string
	titleInner?: string
	titleOuter?: string
	colorInner?: string
	colorOuter?: string
}) => {
	return (
		<div className='relative w-full'>
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
			{titleInner && (
				<Tooltip
					title={titleInner}
					componentsProps={{
						tooltip: {
							sx: {
								bgcolor: 'white',
								color: 'black',
								fontSize: '12px',
								padding: '8px',
								boxShadow: '0px 2px 10px -2px rgb(0 0 0 / 0.3)',
							},
						},
						arrow: {
							sx: {
								color: 'white',
							},
						},
					}}
					arrow
				>
					<div
						className='absolute top-0 h-full rounded-full hover:cursor-pointer'
						style={{ color: colorInner, width: `${value}%` }}
					></div>
				</Tooltip>
			)}
			{titleOuter && (
				<Tooltip
					title={titleOuter}
					componentsProps={{
						tooltip: {
							sx: {
								bgcolor: 'white',
								color: 'black',
								fontSize: '12px',
								padding: '8px',
								boxShadow: '0px 2px 10px -2px rgb(0 0 0 / 0.3)',
							},
						},
						arrow: {
							sx: {
								color: 'white',
							},
						},
					}}
					arrow
				>
					<div
						className='absolute top-0 h-full rounded-full hover:cursor-pointer'
						style={{ left: `${value}%`, width: `${100 - value}%`, color: colorOuter }}
					></div>
				</Tooltip>
			)}
		</div>
	)
}

export default LinearProgressBar
