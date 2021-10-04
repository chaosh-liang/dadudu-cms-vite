import React, { FC } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import styles from './Settings.module.scss'
import stayTunedSvg from './images/staytuned.svg'

const Settings: FC<RouteComponentProps> = (props) => {
  return (
    <div className={styles.container}>
      <img className={styles['stay-tuned']} src={stayTunedSvg} />
    </div>
  )
}

export default Settings
