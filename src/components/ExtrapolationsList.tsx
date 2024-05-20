import React from 'react';
import { Box, List, ListItem } from '@chakra-ui/react';
import Extrapolation from './Extrapolation';
import { ExtrapolationPrompt } from '../types';

type ExtrapolationListProps = {
  extrapolations: ExtrapolationPrompt[];
};

const ExtrapolationsList: React.FC<ExtrapolationListProps> = ({
  extrapolations,
}) => {
  if (extrapolations.length === 0) return null;

  return (
    <Box display="flex" justifyContent="center">
      <List spacing={3}>
        {extrapolations.map((extrapolation) => (
          <ListItem key={extrapolation.id}>
            <Extrapolation extrapolationPrompt={extrapolation}></Extrapolation>
            {/* {extrapolation.extrapolation_text} By {extrapolation.user_id} */}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ExtrapolationsList;
