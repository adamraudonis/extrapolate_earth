import React, { useState, useEffect } from 'react';
import { Box, List, ListItem } from '@chakra-ui/react';
import { supabase } from '../supabaseClient';
import Extrapolation from './Extrapolation';
import { ExtrapolationPrompt } from '../types';

const ExtrapolationsList: React.FC = () => {
  const [extrapolations, setExtrapolations] = useState<ExtrapolationPrompt[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExtrapolations = async () => {
      try {
        const { data, error } = await supabase
          .from('extrapolation_prompt')
          .select('*')
          .eq('is_active', true);

        if (error) throw error;

        setExtrapolations(data);
      } catch (error: any) {
        setError(error.error_description || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExtrapolations();
  }, []);

  if (loading) return <Box>Loading...</Box>;
  if (error) return <Box>Error: {error}</Box>;

  if (extrapolations.length === 0) return <Box>No extrapolations found.</Box>;

  return (
    <Box>
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
