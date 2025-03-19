export function defaultText(text?: any, defaultValue: any = '') {
	return text ?? defaultValue
}

export function defaultNumber(value: number | string, digit: number = 2) {
	return value || value === 0
		? value.toLocaleString(undefined, { maximumFractionDigits: digit, minimumFractionDigits: 0 })
		: ''
}

export function nFormatter(num: number, digits = 2) {
	return num.toLocaleString(undefined, { notation: 'compact', maximumFractionDigits: digits })
}

export const getRoundedMax = (value: number, tickCount: number = 8) => {
	const magnitude = Math.pow(10, Math.floor(Math.log10(value)))

	const maximumStep = 10
	const stepOption = 0.025

	const stepOptions = Array.from(
		{ length: Math.ceil(maximumStep / stepOption) },
		(_, index) => Math.round((index + 1) * stepOption * 1000) / 1000,
	)

	const step = (stepOptions.find((step) => value / (step * magnitude) <= tickCount) ?? 0) * magnitude

	const roundedMax = Math.ceil(value / step) * step

	return { roundedMax, step }
}

export const getStepValue = (value: number, tickCount: number = 8) => {
	const magnitude = Math.pow(10, Math.floor(Math.log10(value)))

	const maximumStep = 10
	const stepOption = 0.5

	const stepOptions = Array.from(
		{ length: Math.ceil(maximumStep / stepOption) },
		(_, index) => Math.round((index + 1) * stepOption * 1000) / 1000,
	)

	const step = (stepOptions.find((step) => value / (step * magnitude) <= tickCount) ?? 0) * magnitude

	return step
}
