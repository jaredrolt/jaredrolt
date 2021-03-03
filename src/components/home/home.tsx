import React from 'react';
import classnames from 'classnames';
import styles from './home.module.css';

export const Home = () => {
  return (
    <div className={classnames(styles.flexCenter, styles.positionRef, styles.fullHeight)}>
      <div className={styles.content}>
        <div className={styles.title}>
          Jared Rolt
        </div>
        <h2 className={styles.subtitle}>Software Engineer</h2>
        <div className={styles.links}>
          <a href="https://www.linkedin.com/in/jaredrolt/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="https://github.com/jaredrolt" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
      </div>
    </div>
  );
};
