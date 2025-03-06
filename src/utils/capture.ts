import html2canvas from 'html2canvas'

export const captureMapImage = async (divRef: React.RefObject<HTMLDivElement>) => {
	if (!divRef.current) return null

	try {
		const canvas = await html2canvas(divRef.current, {
			useCORS: true,
			allowTaint: true,
			scale: 2,
		})
		const dataURL = canvas.toDataURL('image/png')
		return dataURL
	} catch (error) {
		console.error('Error capturing div:', error)
		return null
	}
}
