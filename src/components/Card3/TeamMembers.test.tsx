// TeamMembers.test.tsx

import { render, fireEvent, waitFor, screen, getByText } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import TeamMembers from './TeamMembers';

describe('teamMembers Component', () => {
  // Test Case 1: Renders the component with a team name
  it('renders the component with a team name', () => {
    const { getByText } = render(
      <MemoryRouter>
        <TeamMembers teamName="Team1" />
      </MemoryRouter>
    );
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const teamNameElement = getByText('Team1 Members');
    expect(teamNameElement).toBeInTheDocument();
  });
});
