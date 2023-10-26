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

axios.defaults.baseURL = 'http://localhost:3000';

const TeamMembers: React.FC<TeamMembersProps> = ({ teamName }) => {
  const [availability, setAvailability] = useState<AvailabilityData[]>([]);
  const [newMemberName, setNewMemberName] = useState('');

  // Fetch availability data when the component loads
  const fetchAvailabilityData = async () => {
    try {
      const response = await axios.get<AvailabilityData[]>(`/api/availability/${teamName}`);
      setAvailability(response.data);
    } catch (error) {
      console.error('Error fetching availability data:', error);
    }
  };

  useEffect(() => {
    fetchAvailabilityData();
  }, [teamName]);

  const playerNames = Array.from(new Set(availability.map(data => data.playerName)));
  const matchDays = Array.from(new Set(availability.map(data => data.matchDay)));

  const availabilityCounts: { [matchDay: string]: number } = {};

  availability.forEach(data => {
    if (data.availability === 'Yes') {
      availabilityCounts[data.matchDay] = (availabilityCounts[data.matchDay] || 0) + 1;
    }
  });

  const updateAvailability = async (playerName: string, matchDay: string, newAvailability: string) => {
    try {
      console.log('Updating availability for', playerName, matchDay, newAvailability); // Add this line for debugging

      await axios.post('api/availability/update-availability', {
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
      for (const playerName of playerNames) {
        for (const matchDay of matchDays) {
          const newAvailability = (
            availability.find(data => data.playerName === playerName && data.matchDay === matchDay) || {
              availability: '',
            }
          ).availability;
          if (newAvailability !== undefined) {
            await updateAvailability(playerName, matchDay, newAvailability);
          }
        }
      }
      console.log('Availability data saved to the database.');
    } catch (error) {
      console.error('Error saving availability data to the database:', error);
    }
  };

  const addMember = () => {
    const memberName = prompt('Enter the name of the new member:');

    if (memberName) {
      setNewMemberName(memberName);
    }
  };

  const saveNewMember = async () => {
    try {
      // Define a default team for new members
      const defaultTeam = teamName; // Set the default team as the current teamName
      // First, create the new player in the 'Player' table
      const newPlayerResponse = await axios.post('/api/players', {
        name: newMemberName,
        team: defaultTeam,
      });

      if (newPlayerResponse.status !== 200) {
        throw new Error('Failed to create a new player');
      }
      for (const matchDay of matchDays) {
        // Then, add the new member to the 'AvailabilityData' table for each matchDay
        const newMemberResponse = await axios.post('/api/availability/add-member', {
          playerName: newMemberName,
          matchDay, // Use the current matchDay from the loop
          availability: 'Pending',
          teamName: defaultTeam,
        });
        console.log('error ', newMemberName, matchDay, defaultTeam);
        if (newMemberResponse.status !== 200) {
          throw new Error('Failed to add a new member');
        }
      }

      // Refresh the data after adding a new member
      fetchAvailabilityData();
    } catch (error) {
      console.error('Error adding a new member:', error);
    }
  };
  const deleteMember = async (playerName: string, matchDay: string) => {
    try {
      // Confirm the deletion with the user
      const confirmDeletion = window.confirm(`Are you sure you want to delete ${playerName} on ${matchDay}?`);
      if (!confirmDeletion) {
        return;
      }

      // Delete data from both tables
      await axios.delete('/api/availability/delete-member', {
        data: {
          playerName,
          matchDay,
          teamName,
        },
      });
      await axios.delete('/api/players', {
        data: {
          playerName,
          team: teamName,
        },
      });

      // Refresh the data after deletion
      fetchAvailabilityData();
    } catch (error) {
      console.error('Error deleting member:', error);
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
              <th key={matchDay}>
                {matchDay}
                <div>Count: {availabilityCounts[matchDay] || 0}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {playerNames.map(playerName => (
            <tr key={playerName}>
              <td>{playerName}</td>
              {matchDays.map(matchDay => (
                <td key={matchDay}>
                  <select
                    name={`availability_${playerName}_${matchDay}`}
                    value={
                      (
                        availability.find(data => data.playerName === playerName && data.matchDay === matchDay) || {
                          availability: '',
                        }
                      ).availability
                    }
                    onChange={e => updateAvailability(playerName, matchDay, e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="If Need Be">If Need Be</option>
                    <option value="Cannot Attend">Cannot Attend</option>
                    <option value="Pending">Pending</option>
                  </select>
                  <button onClick={() => deleteMember(playerName, matchDay)} className={styles['delete-button']}>
                    Delete
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {newMemberName !== '' && (
        <div>
          <input
            type="text"
            placeholder="New Member Name"
            value={newMemberName}
            onChange={e => setNewMemberName(e.target.value)}
          />
          <button onClick={saveNewMember} className={styles['save-button']}>
            Save New Member
          </button>
        </div>
      )}

      <Link to="/card" className={styles['back-button']}>
        Back
      </Link>
      <button onClick={addMember} className={styles['save-button']}>
        Add Member
      </button>
      <button onClick={saveAvailabilityToDB} className={styles['save-button']}>
        Save
      </button>
    </div>
  );
};

export default TeamMembers;
