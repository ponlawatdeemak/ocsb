import um from '@/api/um'
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	IconButton,
	Snackbar,
	Typography,
} from '@mui/material'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'next-i18next'
import ClearIcon from '@mui/icons-material/Clear'
import Icon from '@mdi/react'
import { mdiTrayArrowDown, mdiTrayArrowUp, mdiCloseCircleOutline, mdiDownloadOutline } from '@mdi/js'
import { useQueryClient } from '@tanstack/react-query'
import { AlertInfoType } from '@/components/shared/ProfileForm/interface'
import AlertConfirm from '@/components/common/dialog/AlertConfirm'
import CloseIcon from '@mui/icons-material/Close'
import classNames from 'classnames'
import AlertSnackbar from '@/components/common/snackbar/AlertSnackbar'
import { useDropzone } from 'react-dropzone'
import { FileDownloadOutlined, FileUploadOutlined } from '@mui/icons-material'
import { relative } from 'path'
import { CsvIcon } from '@/components/svg/AppIcon'

const maxFileSize = 1.5e7
export interface FormImportProps {
	open: boolean
	onClose: () => void
	setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const DialogImport: React.FC<FormImportProps> = ({ ...props }) => {
	const { t } = useTranslation(['common', 'um'])
	// const { i18n: i18nWithCookie } = useSwitchLanguage(i18n.language as Language, 'appbar')
	const [importFile, setImportFile] = React.useState<File>()
	const { open, onClose } = props
	const [loading, setLoading] = React.useState<boolean>(false)
	const [isOpenConfirmModal, setIsOpenConfirmModal] = React.useState<boolean>(false)
	const [alertInfo, setAlertInfo] = React.useState<AlertInfoType>({
		open: false,
		severity: 'success',
		message: '',
	})

	const queryClient = useQueryClient()

	const handleFileChange = (file: File[]) => {
		const importFile = file?.[0]
		if (importFile) {
			const fileType = importFile.type
			const fileSize = importFile.size
			const validFileTypes = ['text/csv']

			if (validFileTypes.includes(fileType) && fileSize <= maxFileSize) {
				setImportFile(importFile)
			} else if (!validFileTypes.includes(fileType)) {
				// invalid file type
				// notification lower left side error
				setAlertInfo({ open: true, severity: 'error', message: t('um:error.invalidFileType') })
			} else if (fileSize > maxFileSize) {
				// limit exceed
				setAlertInfo({
					open: true,
					severity: 'error',
					message: t('um:error.fileSizeLimitExceed'),
				})
			} else {
				// something wrong
				setAlertInfo({ open: true, severity: 'error', message: t('common:error.somethingWrong') })
			}
		} else {
			// no file
			setImportFile(undefined)
			// notification lower left side error
			setAlertInfo({ open: true, severity: 'error', message: t('common:error.somethingWrong') })
		}
	}

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop: handleFileChange,
		accept: {
			'text/csv': [],
		},
	})
	const { onClick: onDropClick, ...rootProps } = getRootProps()

	const handleConfirmImport = async () => {
		try {
			setLoading(true)
			if (importFile) {
				if (importFile?.type === 'text/csv') {
					const res = await um.postImportValidate(importFile)
					console.log('👻  res: ', res)
					if (res.data?.errorList.length) {
						setAlertInfo({ open: true, severity: 'error', message: t('common:error.somethingWrong') })
						setLoading(false)
						return
					} else {
						await um.postImportData(importFile)
					}
					setAlertInfo({ open: true, severity: 'success', message: t('um:import.alert.saveComplete') })

					handleCloseImport(null, 'importFinish')
				} else {
					setAlertInfo({ open: true, severity: 'error', message: t('common:error.somethingWrong') })
				}
			}
		} catch (error: any) {
			console.error(error)
			setAlertInfo({ open: true, severity: 'error', message: t('common:error.somethingWrong') })
		} finally {
			setLoading(false)
		}
	}

	const handleRemoveFile = () => {
		setImportFile(undefined)
	}

	const handleCloseImport = (event: any, reason: string) => {
		if (reason === 'backdropClick') {
			return
		}
		onClose()
		setImportFile(undefined)
	}

	const fileSize = useMemo(() => {
		if (importFile) {
			return (importFile.size / 1024).toLocaleString('en-US', {
				// Use en-US locale for consistent comma placement
				minimumFractionDigits: 2, // Ensure 2 decimal places
				maximumFractionDigits: 2, // Ensure a maximum of 2 decimal places
			})
		} else {
			return '0kB'
		}
	}, [importFile])

	return (
		<div className='flex flex-col'>
			<Dialog
				open={open}
				onClose={handleCloseImport}
				component='form'
				onSubmit={() => {}}
				fullWidth
				keepMounted={false}
				scroll='paper'
				className='[&_.MuiPaper-root]:h-[460px] [&_.MuiPaper-root]:max-w-[600px] [&_.MuiPaper-root]:rounded-2xl'
			>
				<Box className='flex flex-row items-center justify-between bg-[#003491] pb-3'>
					<DialogTitle className='text-lg text-white'>{t('um:import.title')}</DialogTitle>
					<IconButton
						onClick={(event) => handleCloseImport(event, 'cancelClick')}
						className='mr-2 p-2'
						disabled={loading}
					>
						<CloseIcon className='text-white' />
					</IconButton>
				</Box>
				<DialogContent
					dividers={true}
					className='-mb-3 -mt-3 flex h-full flex-col items-center justify-between overflow-x-hidden bg-white max-lg:gap-3'
					sx={{
						boxShadow: '0px 3px 6px 0px #00000040',
						borderRadius: '15px',
						position: 'relative',
						zIndex: 10,
					}}
				>
					<Box className='flex w-full justify-end'>
						<Button
							variant='text'
							sx={{ '&:hover': { bgcolor: 'initial' }, color: 'black' }}
							startIcon={<Icon path={mdiDownloadOutline} size={'24px'} />}
						>
							<a href={'/document/template.csv'} download={'template.csv'}>
								{t('um:import.template')}
							</a>
						</Button>
					</Box>
					<Box className='h-full w-full'>
						<Box
							{...rootProps}
							className='flex h-full w-full items-center justify-center rounded-xl p-8'
							sx={{ border: '2px dashed #A8A8A8' }}
						>
							<input {...getInputProps()} />
							{isDragActive ? (
								<p>{t('um:import.dnd')}</p>
							) : (
								<Box className='w-full'>
									{importFile ? (
										<Box className='flex min-h-[50px] w-full items-center justify-between rounded-lg border-solid border-gray bg-background p-4'>
											<Box className='flex gap-2'>
												<Box>
													<CsvIcon />
												</Box>
												<Box className='flex flex-col justify-center'>
													<Typography className='!text-[12px]'>{importFile.name}</Typography>
													<Typography className='!text-[10px] text-[#B1B1B1]'>
														{fileSize}kB
													</Typography>
												</Box>
											</Box>
											<Box>
												<IconButton
													disableRipple
													onClick={handleRemoveFile}
													className='!bg-black !p-[2px]'
													size='small'
												>
													<ClearIcon className='!text-[18px] text-white' />
												</IconButton>
											</Box>
										</Box>
									) : (
										<Box className='flex items-center justify-center gap-2'>
											<Button
												className='flex h-[38px] items-center gap-1.5 !rounded-[5px] !px-3 !py-2.5 shadow-none hover:shadow-none max-lg:!min-w-[38px] [&_.MuiButton-icon]:m-0'
												variant='contained'
												startIcon={<FileUploadOutlined className='!h-4 !w-4 !fill-white' />}
												onClick={onDropClick}
											>
												<Box className='!text-xs text-white'>{t('um:import.upload')}</Box>
											</Button>
											<Box>
												<Box className='text-sm'>{t('um:import.titleDnd')}</Box>
												<Box className='text-[10px] text-[#616E75]'>
													{t('um:import.contentDnd')}
												</Box>
											</Box>
										</Box>
									)}
								</Box>
							)}
						</Box>
					</Box>
				</DialogContent>
				<DialogActions className={'flex justify-end bg-[#E6E6E6]'}>
					<div className={'flex h-[60px] w-full justify-between space-x-2 pt-3'}>
						<Button
							variant='text'
							sx={{ width: '50%', '&:hover': { bgcolor: 'initial' }, color: 'black' }}
							onClick={(event) => {
								handleCloseImport(event, 'cancelClick')
							}}
							disabled={loading}
						>
							{t('back')}
						</Button>
						<Divider orientation='vertical' className='h-full' />
						<Button
							variant='text'
							sx={{ width: '50%', '&:hover': { bgcolor: 'initial' }, color: '#003491' }}
							onClick={(event) => {
								handleConfirmImport()
							}}
							disabled={!importFile || loading}
							startIcon={
								loading && (
									<CircularProgress
										className='[&_.MuiCircularProgress-circle]:text-white'
										size={16}
									/>
								)
							}
						>
							{t('common:confirm')}
						</Button>
					</div>
				</DialogActions>
			</Dialog>
			<AlertSnackbar alertInfo={alertInfo} onClose={() => setAlertInfo({ ...alertInfo, open: false })} />
		</div>
	)
}
