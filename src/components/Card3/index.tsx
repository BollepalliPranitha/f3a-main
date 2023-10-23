import * as React from 'react';
import { Link } from 'react-router-dom'; // Assuming you're using React Router for navigation
import styles from './Card3.module.scss';

export const Card3 = () => {
  return (
    <div className={styles['card3-container']}>
      <div className={styles['card3-content']}>
        <h1 className={styles['card3-heading']}>Team Page</h1>
        <div>
          <Link to="/team/Team1" className={styles['card3-link']}>
            Team 1
          </Link>
        </div>
        <div>
          <Link to="/team/Team2" className={styles['card3-link']}>
            Team 2
          </Link>
        </div>
        <div>
          <Link to="/team/Team3" className={styles['card3-link']}>
            Team 3
          </Link>
        </div>
        <div>
          <Link to="/team/Team4" className={styles['card3-link']}>
            Team 4
          </Link>
        </div>
      </div>
      <Link to="/about" className={styles['back-button']}>
        Back
      </Link>
    </div>
  );
};
