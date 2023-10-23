import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './TeamMembers.module.scss';

interface TeamMembersProps {
  teamName: string;
}

interface AvailabilityData {
  teamName: string;
  playerName: string;
  matchDay: string;
  availability: string;
}

const TeamMembers: React.FC<TeamMembersProps> = ({ teamName }) => {
  const [availability, setAvailability] = useState<AvailabilityData[]>([]);

  useEffect(() => {
    const fetchAvailabilityData = async () => {
      try {
        const response = await axios.get<AvailabilityData[]>(`http://localhost:3000/api/availability/${teamName}`);
        setAvailability(response.data);
      } catch (error) {
        console.error('Error fetching availability data:', error);
      }
    };

    fetchAvailabilityData();
  }, [teamName]);

  const playerNames = Array.from(new Set(availability.map(data => data.playerName)));
  const matchDays = Array.from(new Set(availability.map(data => data.matchDay)));

  type TableRow = {
    playerName: string;
    [key: string]: string | undefined;
  };

  const tableData: TableRow[] = [];

  playerNames.forEach(playerName => {
    const rowData: TableRow = { playerName };

    matchDays.forEach(matchDay => {
      const availabilityData = availability.find(data => data.playerName === playerName && data.matchDay === matchDay);
      rowData[matchDay] = availabilityData ? availabilityData.availability : undefined;
    });

    tableData.push(rowData);
  });

  const updateAvailability = async (playerName: string, matchDay: string, newAvailability: string) => {
    try {
      await axios.post('/update-availability', {
        playerName,
        matchDay,
        availability: newAvailability,
      });

      setAvailability(prevAvailability =>
        prevAvailability.map(data =>
          data.playerName === playerName && data.matchDay === matchDay
            ? { ...data, availability: newAvailability }
            : data
        )
      );
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const saveAvailabilityToDB = async () => {
    try {
      for (const rowData of tableData) {
        for (const matchDay of matchDays) {
          const newAvailability = rowData[matchDay];
          if (newAvailability !== undefined) {
            await updateAvailability(rowData.playerName, matchDay, newAvailability);
          }
        }
      }
      console.log('Availability data saved to the database.');
    } catch (error) {
      console.error('Error saving availability data to the database:', error);
    }
  };

  return (
    <div className={styles['team-members-container']}>
      <h2 className={styles['team-members-heading']}>{teamName} Members</h2>
      <table>
        <thead>
          <tr>
            <th>Player Name</th>
            {matchDays.map(matchDay => (
              <th key={matchDay}>{matchDay}</th>
            ))}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((rowData, index) => (
            <tr key={rowData.playerName}>
              <td>{rowData.playerName}</td>
              {matchDays.map(matchDay => (
                <td key={matchDay}>
                  <select
                    id={`availability-${rowData.playerName}-${matchDay}`} // Unique id attribute
                    name={`availability-${rowData.playerName}-${matchDay}`} // Unique name attribute
                    value={rowData[matchDay] || ''}
                    onChange={e => updateAvailability(rowData.playerName, matchDay, e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="If Need Be">If Need Be</option>
                    <option value="Cannot Attend">Cannot Attend</option>
                    <option value="Pending">Pending</option>
                  </select>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={saveAvailabilityToDB}>Save</button>
      <Link to="/card" className={styles['back-button']}>
        Back
      </Link>
    </div>
  );
};

export default TeamMembers;
