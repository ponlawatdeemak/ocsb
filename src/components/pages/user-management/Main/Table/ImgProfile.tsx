import { getUserImage } from '@/utils/image'
import { Avatar } from '@mui/material'
import classNames from 'classnames'
import { FC, memo } from 'react'
interface Prop {
	userId: string
	className?: string
}
const ImgProfile: FC<Prop> = ({ userId, className }: Prop) => {
	return (
		<Avatar className={classNames('mr-[4px] h-[24px] w-[24px] bg-primary', className)} src={getUserImage(userId)} />
	)
}

export default memo(ImgProfile)
