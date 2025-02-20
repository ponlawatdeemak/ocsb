import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material'
import classNames from 'classnames'
import React from 'react'
import { CalendarType } from '..'
import { ExpandMore } from '@mui/icons-material'

interface CalendarMobilePopoverMainProps {
	className?: string
	calendarType: CalendarType | false
	handleCalendarTypeExpanded: (panel: CalendarType) => (event: React.SyntheticEvent, isExpanded: boolean) => void
}

const CalendarMobilePopoverMain: React.FC<CalendarMobilePopoverMainProps> = ({
	className = '',
	calendarType,
	handleCalendarTypeExpanded,
}) => {
	return (
		<Box className={classNames('h-full w-full', className)}>
			<Box>
				<Accordion
					expanded={calendarType === CalendarType.Date}
					onChange={handleCalendarTypeExpanded(CalendarType.Date)}
				>
					<AccordionSummary expandIcon={<ExpandMore />} aria-controls='panel1bh-content' id='panel1bh-header'>
						<Typography>เลือกวันที่</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<Typography>
							Nulla facilisi. Phasellus sollicitudin nulla et quam mattis feugiat. Aliquam eget maximus
							est, id dignissim quam.
						</Typography>
					</AccordionDetails>
				</Accordion>
				<Accordion
					expanded={calendarType === CalendarType.Month}
					onChange={handleCalendarTypeExpanded(CalendarType.Month)}
				>
					<AccordionSummary expandIcon={<ExpandMore />} aria-controls='panel2bh-content' id='panel2bh-header'>
						<Typography>รายเดือน</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<Typography>
							Donec placerat, lectus sed mattis semper, neque lectus feugiat lectus, varius pulvinar diam
							eros in elit. Pellentesque convallis laoreet laoreet.
						</Typography>
					</AccordionDetails>
				</Accordion>
				<Accordion
					expanded={calendarType === CalendarType.LastSevenDays}
					onChange={handleCalendarTypeExpanded(CalendarType.LastSevenDays)}
				>
					<AccordionSummary expandIcon={<ExpandMore />} aria-controls='panel3bh-content' id='panel3bh-header'>
						<Typography>7 วันล่าสุด</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<Typography>
							Nunc vitae orci ultricies, auctor nunc in, volutpat nisl. Integer sit amet egestas eros,
							vitae egestas augue. Duis vel est augue.
						</Typography>
					</AccordionDetails>
				</Accordion>
				<Accordion
					expanded={calendarType === CalendarType.LastThirtyDays}
					onChange={handleCalendarTypeExpanded(CalendarType.LastThirtyDays)}
				>
					<AccordionSummary expandIcon={<ExpandMore />} aria-controls='panel4bh-content' id='panel4bh-header'>
						<Typography>30 วันล่าสุด</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<Typography>
							Nunc vitae orci ultricies, auctor nunc in, volutpat nisl. Integer sit amet egestas eros,
							vitae egestas augue. Duis vel est augue.
						</Typography>
					</AccordionDetails>
				</Accordion>
				<Accordion
					expanded={calendarType === CalendarType.LastThreeMonths}
					onChange={handleCalendarTypeExpanded(CalendarType.LastThreeMonths)}
				>
					<AccordionSummary expandIcon={<ExpandMore />} aria-controls='panel4bh-content' id='panel4bh-header'>
						<Typography>3 เดือนล่าสุด</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<Typography>
							Nunc vitae orci ultricies, auctor nunc in, volutpat nisl. Integer sit amet egestas eros,
							vitae egestas augue. Duis vel est augue.
						</Typography>
					</AccordionDetails>
				</Accordion>
			</Box>
		</Box>
	)
}

export default CalendarMobilePopoverMain
