import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
} from '@chakra-ui/react';
import { supabase } from '../supabaseClient';

type NewExtrapolationProps = {
  session: any;
};

const NewExtrapolation: React.FC<NewExtrapolationProps> = () => {
  const [extrapolation_text, setExtrapolationText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState('');
  const [initialYearValue, setInitialYearValue] = useState(0);
  const [minimum, setMinimum] = useState(0);
  const [maximum, setMaximum] = useState(0);

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
      const { data, error } = await supabase
        .from('extrapolation_prompt')
        .insert({
          user_id: user.id,
          extrapolation_text,
          unit,
          is_active: true,
          initial_year_value: initialYearValue,
          minimum,
          maximum,
        })
        .select();
      if (error) {
        throw new Error(error.message);
      }
      const id = data?.[0]?.id;
      window.location.href = `/add_extrapolation?id=${id}`;
    } catch (error: any) {
      setError(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={4} mx="auto" width={500}>
      <form onSubmit={handleExtrapolationSubmit}>
        <FormControl id={'extrapolation_text'} isRequired>
          <FormLabel>Extrapolation Prompt</FormLabel>
          <Textarea
            placeholder="The number of humanoid robots manufactured per year globally"
            value={extrapolation_text}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setExtrapolationText(e.target.value)
            }
          />
        </FormControl>

        <FormControl id={'unit'} isRequired>
          <FormLabel>Y-Axis Unit</FormLabel>
          <Input
            type="string"
            placeholder="Number of Robots"
            onChange={(e) => setUnit(e.target.value)}
          />
        </FormControl>

        <FormControl id={'initial_year_value'} isRequired>
          <FormLabel>Current Year's Value</FormLabel>
          <Input
            type="number"
            placeholder="100"
            onChange={(e) => setInitialYearValue(parseFloat(e.target.value))}
          />
        </FormControl>

        <FormControl id={'minimum'}>
          <FormLabel>Minimum</FormLabel>
          <Input
            type="number"
            placeholder="0"
            onChange={(e) => setMinimum(parseFloat(e.target.value))}
          />
        </FormControl>

        <FormControl id={'maximum'}>
          <FormLabel>Maximum</FormLabel>
          <Input
            type="number"
            placeholder="1000000"
            onChange={(e) => setMaximum(parseFloat(e.target.value))}
          />
        </FormControl>

        {error && (
          <Box color="red.500" mt={2}>
            {error}
          </Box>
        )}
        <Button mt={4} isLoading={loading} type="submit">
          Submit
        </Button>
      </form>
    </Box>
  );
};

export default NewExtrapolation;
