import React, { useEffect, useState } from 'react';

import { Box } from '@chakra-ui/react';

import { supabase } from '../supabaseClient';
import { ExtrapolationPrompt } from '../types';
import ExtrapolationsList from './ExtrapolationsList';

const Home: React.FC = () => {
  const [extrapolations, setExtrapolations] = useState<ExtrapolationPrompt[]>(
    []
  );

  useEffect(() => {
    const fetchExtrapolations = async () => {
      try {
        const { data, error } = await supabase
          .from('extrapolation_prompt')
          .select('*')
          .eq('is_active', true);

        if (error) throw error;

        setExtrapolations(data);
      } catch (error) {
        console.error('Error fetching extrapolations:', error);
      }
    };

    fetchExtrapolations();
  }, []);

  return (
    <Box>
      <ExtrapolationsList extrapolations={extrapolations} />
    </Box>
  );
};

export default Home;
