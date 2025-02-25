import { glossary, letters } from '@/utils/assets'
import { ResponseLanguage } from '@interface/config/app.config'
import { Accordion, AccordionDetails, AccordionSummary, OutlinedInput, Typography } from '@mui/material'
import classNames from 'classnames'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useMemo, useState } from 'react'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import NoDataDisplay from '@/components/common/empty/NoDataDisplay'

interface GlossaryMainProps {
	className?: string
}

export const GlossaryMain: React.FC<GlossaryMainProps> = ({ className = '' }) => {
	const { t, i18n } = useTranslation(['glossary', 'common', 'um'])
	const language = i18n.language as keyof ResponseLanguage

	const [keyword, setKeyword] = useState<string>('')
	const [letter, setLetter] = useState<string>('')

	const words = useMemo(() => {
		return glossary.filter(
			(word) =>
				word.term[language].startsWith(letter) &&
				word.term[language].toLocaleLowerCase().includes(keyword.toLocaleLowerCase()),
		)
	}, [keyword, language, letter])

	useEffect(() => {
		setKeyword('')
		setLetter('')
	}, [language])

	return (
		<div
			className={classNames(
				'relative flex h-auto w-full flex-1 flex-col items-center gap-6 py-6 lg:h-full lg:p-6',
				className,
			)}
		>
			<div className='absolute left-0 top-0 z-[0] h-[84px] w-full bg-primary'></div>
			<div className='z-[1] flex h-min w-full max-w-[1096px] flex-col rounded-[15px] shadow'>
				<div className='flex h-[60px] w-full items-center rounded-[15px_15px_0px_0px] bg-primary-light px-6 py-5'>
					<Typography className='!text-md text-white'>{t('common:menu.glossary')}</Typography>
				</div>
				<div className='flex flex-col gap-6 rounded-[0px_0px_15px_15px] bg-white p-6'>
					<div className='flex flex-col gap-[6px]'>
						<Typography className='!text-sm'>{t('um:search.keyword')}</Typography>
						<OutlinedInput
							className='[&_input]:box-border [&_input]:h-[38px] [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm'
							placeholder={t('fillKeyword')}
							value={keyword}
							onChange={(e) => {
								setKeyword(e.target.value)
							}}
						/>
					</div>
					<div className='flex flex-col gap-[6px]'>
						<Typography className='!text-sm'>{t('letter')}</Typography>
						<div className='flex w-full flex-wrap gap-2'>
							{letters[language].map((item) => (
								<button
									key={item}
									value={item}
									onClick={(e: any) => {
										if (letter === item) {
											setLetter('')
										} else {
											setLetter(e.target.value)
										}
									}}
									className={classNames(
										'h-[30px] w-[30px] rounded-[5px] bg-[#E6E6E6] text-sm text-primary hover:shadow',
										{ '!bg-secondary !text-white': item === letter },
									)}
								>
									{item}
								</button>
							))}
						</div>
					</div>
				</div>
			</div>
			<div className='z-[1] flex w-full max-w-[1096px] grow flex-col gap-4 lg:overflow-auto [&_.Mui-expanded]:!mb-0 [&_.Mui-expanded_#letter-div]:!bg-secondary [&_.Mui-expanded_#letter-div]:!text-white'>
				{words.length > 0 ? (
					words.map((resultWord) => (
						<Accordion
							className='!rounded-[20px] !border-none !shadow-none [&::before]:!opacity-0'
							key={resultWord.definition[language]}
						>
							<AccordionSummary
								className='[&_.MuiAccordionSummary-content]:!my-4'
								expandIcon={<ExpandMoreIcon />}
							>
								<div className='flex items-center gap-3'>
									<div
										id='letter-div'
										className={classNames(
											'flex h-[30px] w-[30px] items-center justify-center rounded-[5px] bg-[#E6E6E6] text-sm text-primary',
										)}
									>
										{resultWord.term[language][0]}
									</div>
									<Typography className='!text-sm text-primary'>
										{resultWord.term[language]}
									</Typography>
								</div>
							</AccordionSummary>
							<AccordionDetails className='!pt-0'>
								<Typography className='pl-[42px] !text-sm'>
									{resultWord.definition[language]}
								</Typography>
							</AccordionDetails>
						</Accordion>
					))
				) : (
					<NoDataDisplay />
				)}
			</div>
		</div>
	)
}
