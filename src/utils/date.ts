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
