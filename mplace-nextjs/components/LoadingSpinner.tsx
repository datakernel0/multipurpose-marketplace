"use client"

import { Spin } from 'antd'
import styles from './LoadingSpinner.module.css'

interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large'
  tip?: string
  fullScreen?: boolean
  style?: React.CSSProperties
}

/**
 * Reusable loading spinner component
 * Provides consistent loading states across the application
 */
export default function LoadingSpinner({
  size = 'default',
  tip,
  fullScreen = false,
  style,
}: LoadingSpinnerProps) {
  const spinner = (
    <Spin size={size} tip={tip} style={style}>
      <div className={fullScreen ? styles.loadingSpinnerFullHeight : styles.loadingSpinnerMinHeight} />
    </Spin>
  )

  if (fullScreen) {
    return (
      <div className={styles.loadingSpinnerContainer}>
        {spinner}
      </div>
    )
  }

  return spinner
}

/**
 * Inline loading spinner for buttons and small areas
 */
export function InlineSpinner({ size = 'small' }: { size?: 'small' | 'default' | 'large' }) {
  return <Spin size={size} />
}

/**
 * Page loading component with message
 */
export function PageLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className={styles.pageLoadingContainer}>
      <Spin size="large" tip={message} />
    </div>
  )
}

