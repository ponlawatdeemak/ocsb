import html2canvas from 'html2canvas'

export const captureMapImage = async (map: any) => {
	if (map) {
		const canvas = await html2canvas(map, {
			useCORS: true,
			allowTaint: true,
			scale: 2,
		})
		const dataURL = canvas.toDataURL('image/png')
		return dataURL
	}
}
