import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  // Input,
  Textarea,
  // Text,
  // VStack,
  // HStack,
  // IconButton,
} from '@chakra-ui/react';
import { supabase } from '../supabaseClient';
// import { CloseIcon } from '@chakra-ui/icons';

// interface ExtrapolationEntry {
//   year: string;
//   percentage: string;
// }

type NewExtrapolationProps = {
  session: any;
};

const NewExtrapolation: React.FC<NewExtrapolationProps> = () => {
  // const [extrapolations, setExtrapolations] = useState<ExtrapolationEntry[]>([
  //   { year: '', percentage: '' },
  // ]);
  const [extrapolation_text, setExtrapolationText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [user, setUser] = useState<null | { id: string }>(null);

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleExtrapolationSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to submit a extrapolation.');
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.from('extrapolation_prompt').insert({
        user_id: user.id,
        extrapolation_text: extrapolation_text,
        unit: 'none',
        is_active: true,
      });

      if (error) throw error;
      console.log('Extrapolation submitted successfully.');
      setExtrapolationText(extrapolation_text);
    } catch (error: any) {
      setError(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
    // TODO: Go back to the extrapolations list
  };

  // TODO: Re-enable auth
  // if (!user) {
  //   return (
  //     <Box p={4}>
  //       <Text>You must be logged in to submit a extrapolation.</Text>
  //     </Box>
  //   );
  // }

  return (
    <Box p={4}>
      <form onSubmit={handleExtrapolationSubmit}>
        <FormControl id={'extrapolation_text'} isRequired>
          <FormLabel>Extrapolation Prompt</FormLabel>
          <Textarea
            value={extrapolation_text}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setExtrapolationText(e.target.value)
            }
          />
        </FormControl>
        {error && (
          <Box color="red.500" mt={2}>
            {error}
          </Box>
        )}
        <Button mt={4} colorScheme="teal" isLoading={loading} type="submit">
          Submit
        </Button>
      </form>
    </Box>
  );
};

export default NewExtrapolation;
