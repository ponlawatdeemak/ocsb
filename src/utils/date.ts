import { Languages } from '@/enum'
import { addDays, addYears, format, isAfter } from 'date-fns'
import { enUS, th } from 'date-fns/locale'

interface DateOptions {
	locale?: Locale
	weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
	firstWeekContainsDate?: number
	useAdditionalWeekYearTokens?: boolean
	useAdditionalDayOfYearTokens?: boolean
}

export const formatDate = (
	date: Date | number,
	dateFormat: string,
	language: string,
	options: Omit<DateOptions, 'locale'> = {},
) => {
	const optionsWithLocale: DateOptions = options
	if (language === Languages.TH) {
		date = addYears(date, 543)
		optionsWithLocale['locale'] = th
	} else {
		optionsWithLocale['locale'] = enUS
	}
	return format(date, dateFormat, optionsWithLocale)
}

export const getDateInRange = (startDate: Date, endDate: Date) => {
	let currentDate = new Date(startDate)
	const dates = []
	while (!isAfter(currentDate, endDate)) {
		dates.push(currentDate)
		currentDate = addDays(currentDate, 1)
	}
	return dates
}

export const getMonthFull = (month: number, language: string) => {
	const d = new Date()
	d.setMonth(month)
	if (language === Languages.TH) {
		return format(d, 'MMMM', { locale: th })
	}
	return format(d, 'MMMM', { locale: enUS })
}

// หารอบของข้อมูล ด้วยเดือนและปีค.ศ.
export function getRound(month: number, year: number): { round: number; sDate: string; eDate: string } {
	if (month) {
		const roundConfig = [
			[11, 12, 1, 2],
			[3, 4, 5, 6],
			[7, 8, 9, 10],
		]
		const idx = roundConfig.findIndex((item) => item.includes(month))
		const round = idx + 1
		let roundYearStart = month === 11 || month === 12 ? year : year + 1
		let roundYearEnd = month === 11 || month === 12 ? year + 1 : year
		if (round === 1) {
			if (month === 11 || month === 12) {
				roundYearStart = year
				roundYearEnd = year + 1
			} else {
				roundYearStart = year - 1
				roundYearEnd = year
			}
		} else {
			roundYearStart = year
			roundYearEnd = year
		}
		const startMonth = roundConfig[idx][0] < 10 ? `0${roundConfig[idx][0]}` : roundConfig[idx][0]
		const sDate = `${roundYearStart}-${startMonth}-01`
		const endMonth = roundConfig[idx][roundConfig[idx].length - 1]
		let eDate: Date | string = new Date(roundYearEnd, endMonth, 0)
		eDate.setHours(eDate.getHours() + 7)
		eDate = eDate.toISOString().substring(0, 10)
		return { round, sDate, eDate }
	} else {
		throw new Error('Month not found.')
	}
}
