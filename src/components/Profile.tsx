import React, { useEffect, useState } from 'react';

import { Box, Heading } from '@chakra-ui/react';

import { supabase } from '../supabaseClient';
import { ExtrapolationPrompt } from '../types';
import ExtrapolationsList from './ExtrapolationsList';

type ProfileProps = {
  session: any;
};

const Profile: React.FC<ProfileProps> = ({ session }) => {
  const [extrapolations, setExtrapolations] = useState<ExtrapolationPrompt[]>(
    []
  );

  useEffect(() => {
    if (!session.user) return;
    const fetchExtrapolations = async () => {
      try {
        const { data, error } = await supabase
          .from('extrapolation_prompt')
          .select('*')
          .eq('is_active', true)
          .eq('user_id', session.user.id);

        if (error) throw error;

        setExtrapolations(data);
      } catch (error) {
        console.error('Error fetching extrapolations:', error);
      }
    };

    fetchExtrapolations();
  }, [session.user]);

  return (
    <Box>
      <Heading as="h6" size="xs">
        My Extrapolations
      </Heading>
      <ExtrapolationsList extrapolations={extrapolations} />
    </Box>
  );
};

export default Profile;
