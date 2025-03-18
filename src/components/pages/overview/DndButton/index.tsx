import { useCallback } from 'react'
import { useDrag } from 'react-dnd'

export interface BoxProps {
	left: number
	bottom: number
	onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
	hideSourceOnDrag?: boolean
	children?: React.ReactNode
}

export const DndButton: React.FC<BoxProps> = ({ left, bottom, onClick, hideSourceOnDrag, children }) => {
	const [{ isDragging }, drag] = useDrag(
		() => ({
			type: 'box',
			item: { left, bottom },
			collect: (monitor) => ({
				isDragging: monitor.isDragging(),
			}),
		}),
		[left, bottom],
	)

	const dragRef = useCallback(
		(node: HTMLButtonElement | null) => {
			if (node) drag(node)
		},
		[drag],
	)

	if (isDragging && hideSourceOnDrag) {
		return <button ref={dragRef} />
	}

	return (
		<button
			ref={dragRef}
			style={{
				left,
				bottom: bottom,
			}}
			onClick={onClick}
			className='fixed z-[9999] rounded-full border-[0.5px] border-solid border-gray-300 bg-white p-2 shadow-md hover:shadow-md'
		>
			{children}
		</button>
	)
}
