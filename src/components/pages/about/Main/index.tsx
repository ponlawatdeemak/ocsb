import { Languages } from '@/enum'
import { ResponseLanguage } from '@interface/config/app.config'
import { Typography } from '@mui/material'
import classNames from 'classnames'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface AboutMainProps {
	className?: string
}

export const AboutMain: React.FC<AboutMainProps> = ({ className = '' }) => {
	const { t, i18n } = useTranslation(['common'])
	const language = i18n.language as keyof ResponseLanguage

	return (
		<div
			className={classNames(
				'relative flex h-auto w-full flex-1 flex-col items-center gap-6 py-6 lg:p-6',
				className,
			)}
		>
			<div className='absolute left-0 top-0 z-[0] h-[84px] w-full bg-primary'></div>
			<div className='z-[1] flex h-min w-full max-w-[1096px] flex-col rounded-[15px] shadow'>
				<div className='flex h-[60px] w-full items-center rounded-[15px_15px_0px_0px] bg-primary-light px-6 py-5'>
					<Typography className='!text-md text-white'>{t('menu.about')}</Typography>
				</div>
				<div className='flex grow flex-col gap-4 rounded-[0px_0px_15px_15px] bg-white px-6 pb-7 pt-5'>
					<Typography className='!text-md text-primary'>
						{language === Languages.TH ? 'ข้อมูลโครงการ' : 'Project Information'}
					</Typography>
					<Typography className='whitespace-pre-line !text-sm !font-light text-black'>
						{language === Languages.TH
							? `โครงการจัดทำระบบการติดตามร่องรอยการเผาไหม้ในไร่อ้อย ด้วยเทคโนโลยีอวกาศและภูมิสารสนเทศระบบดาวเทียม เป็นการนำเอาระบบวิทยาศาสตร์และเทคโนโลยี เช่น ดาวเทียมสำรวจทรัพยากรโลก (Earth Observation Satellite) ร่วมกับการวิเคราะห์ข้อมูล (Data Analytics) และปัญญาประดิษฐ์ (Artificial Intelligence/ Machine Learning) มาใช้ในการติดตาม ตรวจสอบ และแจ้งเตือนการเผาในแปลงปลูกอ้อย รวมถึงการวิเคราะห์พื้นที่ปลูกอ้อย และคาดการณ์ปริมาณอ้อยเข้าหีบ ในพื้นที่ต้นแบบ เพื่อจะสามารถเป็นตัวอย่างในการขยายการนำไปใช้งานได้ทั่วประเทศต่อไป
                            
                            ทั้งนี้การนำระบบวิทยาศาสตร์และเทคโนโลยีมาใช้ จะช่วยให้สำนักงานคณะกรรมการอ้อยและน้ำตาลทราย (สอน.) มีเครื่องมือที่มีความน่าเชื่อถือ ข้อมูลมีความถูกต้องแม่นยำ สามารถระบุพื้นที่เป้าหมาย เพื่อเข้าปฏิบัติการแก้ไขปัญหาการลักลอบเผาอ้อย และการขับเคลื่อนนโยบาย การกำหนดมาตรการภาครัฐ และการดำเนินโครงการต่าง ๆ เช่น การแก้ไขปัญหาฝุ่นละอองขนาดเล็ก PM 2.5 ได้อย่างมีประสิทธิภาพมากยิ่งขึ้น อีกทั้งเครื่องมือดังกล่าวยังสามารถนำมาใช้ในการส่งเสริมการวางแผนปลูกอ้อยให้กับเกษตรกร การกำหนดนโยบาย เช่น การกำหนดราคา การควบคุมตลาดเพื่อให้เกิดความสมดุลระหว่างอุปสงค์และอุปทาน และเพื่อการพัฒนาขีดความสามารถในการแข่งขันของประเทศไทยได้ต่อไป`
							: `The project aims to develop a system for tracking burning traces in sugarcane fields using space technology and satellite-based geoinformatics. It integrates scientific and technological systems such as Earth Observation Satellites with data analytics and artificial intelligence/machine learning to monitor, verify, and provide early warnings of burning activities in sugarcane plantations. Additionally, it analyzes sugarcane planting areas and forecasts sugarcane yield for the pilot regions, which can serve as a model for nationwide implementation.
                            
                            The adoption of this technology will provide the Office of Cane and Sugar Board (OCSB) with reliable and accurate tools for identifying target areas to address illegal sugarcane burning and drive government policies and measures. This includes initiatives to tackle air pollution such as PM 2.5. Furthermore, the system can aid in promoting effective planning for sugarcane cultivation, setting policies like pricing, controlling markets to balance supply and demand, and enhancing Thailand's competitive capabilities.`}
					</Typography>
				</div>
			</div>
			<div className='z-[1] flex h-min w-full max-w-[1096px] flex-col gap-6 lg:flex-row'>
				<div className='flex h-full w-full flex-col gap-4 rounded-[15px] bg-white p-6 shadow'>
					<Typography className='!text-md text-primary'>
						{language === Languages.TH ? 'วัตถุประสงค์ของการพัฒนาโครงการ' : 'Project Objectives'}
					</Typography>
					<Typography className='whitespace-pre-line !text-sm !font-light text-black'>
						{language === Languages.TH
							? `พัฒนาระบบวิเคราะห์ข้อมูลเพื่อการติดตามร่องรอยการเผาไหม้ในไร่อ้อย ด้วยเทคโนโลยีอวกาศและภูมิสารสนเทศระบบดาวเทียม ดังนี้
                            
                            2.1 เพื่อเป็นเครื่องมือในการติดตาม ตรวจสอบ และแจ้งเตือนการเผา(Hotspot)  ร่องรอยการเผา (Burn Scar) ในพื้นที่ปลูกอ้อย
                            2.2 เพื่อเป็นเครื่องมือในการวิเคราะห์พื้นที่ปลูกอ้อย ในเชิงพื้นที่ ได้แก่ ระดับภูมิภาค จังหวัด อำเภอ และตำบล
                            2.3 เพื่อเป็นเครื่องมือในการคาดการณ์ปริมาณอ้อยเข้าหีบ ในแต่ละช่วงเวลา ทำได้แม่นยำมากยิ่งขึ้น`
							: `The objective of this project is to develop a data analysis system for tracking burning traces in sugarcane fields using space technology and satellite-based geoinformatics, as follows:
                            
                            2.1 To serve as a tool for monitoring, verifying, and providing early warnings of hotspots and burn scars in sugarcane-growing areas.
                            2.2 To act as a tool for analyzing sugarcane cultivation areas spatially, including at the regional, provincial, district, and subdistrict levels.
                            2.3 To serve as a tool for more accurately forecasting sugarcane yields at different times.`}
					</Typography>
				</div>
				<div className='flex h-full w-full flex-col gap-4 rounded-[15px] bg-white p-6 shadow'>
					<Typography className='!text-md text-primary'>
						{language === Languages.TH
							? 'สำนักงานสำนักงานคณะกรรมการอ้อยและน้ำตาลทราย'
							: 'Office of the Cane and Sugar Board (OCSB)'}
					</Typography>
					<Typography className='whitespace-pre-line !text-sm !font-light text-black'>
						{language === Languages.TH
							? `ที่ตั้ง: 75/6 ถนนพระรามที่ 6 แขวงทุ่งพญาไท เขตราชเทวี กรุงเทพมหานคร 10400
                           โทรศัพท์: 0 2430 6810
                           แฟกส์: 0 2354 3445
                           อีเมล: E-saraban@ocsb.go.th`
							: `Address: 75/6 Rama VI Road, Thung Phaya Thai Subdistrict, Ratchathewi District, Bangkok 10400, Thailand
                            Phone: +66 2 430 6810
                            Fax: +66 2 354 3445
                            Email: E-saraban@ocsb.go.th`}
					</Typography>
				</div>
			</div>
		</div>
	)
}
