export function defaultText(text?: any, defaultValue: any = '') {
	return text ?? defaultValue
}

export function defaultNumber(value: number | string, digit: number = 2) {
	return value !== '' && value !== null
		? value.toLocaleString(undefined, { maximumFractionDigits: digit, minimumFractionDigits: 0 })
		: ''
}
