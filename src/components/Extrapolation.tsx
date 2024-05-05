import React, { useState, useEffect } from 'react';
import { Button } from '@chakra-ui/react';
import { supabase } from '../supabaseClient';
import {
  ExtrapolationPrompt,
  UserExtrapolation,
  ExtrapolationValue,
} from '../types';

type ExtrapolationProps = {
  extrapolationPrompt: ExtrapolationPrompt;
};

const Extrapolation: React.FC<ExtrapolationProps> = ({
  extrapolationPrompt,
}) => {
  const [extrapolationValues, setExtrapolationsValues] = useState<
    ExtrapolationValue[]
  >([]);
  const [userExtrapolations, setUserExtrapolations] = useState<
    UserExtrapolation[]
  >([]);
  //   const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('extrapolation_values')
        .select('*')
        .eq('extrapolation_prompt_id', extrapolationPrompt.id);
      if (error) throw error;
      setExtrapolationsValues(data);
    };
    const fetchData2 = async () => {
      const { data, error } = await supabase
        .from('user_extrapolation')
        .select('*')
        .eq('is_active', true)
        .eq('extrapolation_prompt_id', extrapolationPrompt.id);
      if (error) throw error;
      setUserExtrapolations(data);
    };

    fetchData();
    fetchData2();
  }, [extrapolationPrompt.id]);

  return (
    <div>
      <h1>Extrapolation</h1>
      <p>{extrapolationPrompt.extrapolation_text}</p>
      <h3>Values</h3>
      <ul>
        {extrapolationValues.map((extrapolationValue) => (
          <li key={extrapolationValue.id}>
            {extrapolationValue.year}: {extrapolationValue.value}
          </li>
        ))}
      </ul>
      <h3>Users</h3>
      <ul>
        {userExtrapolations.map((userExtrapolation) => (
          <li key={userExtrapolation.id}>{userExtrapolation.user_id} </li>
        ))}
      </ul>
      <Button
        colorScheme="red"
        variant="solid"
        onClick={async () => {
          const { data, error } = await supabase
            .from('extrapolation_prompt')
            .update({ is_active: false })
            .eq('id', extrapolationPrompt.id);

          if (error) {
            console.error('Error updating extrapolation:', error);
          } else {
            console.log('Extrapolation updated successfully:', data);
          }
        }}
      >
        X
      </Button>
      <Button
        colorScheme="blue"
        variant="solid"
        onClick={() => {
          window.location.href =
            '/add_extrapolation?id=' + extrapolationPrompt.id;
        }}
      >
        Make Extrapolation
      </Button>
    </div>
  );
};

export default Extrapolation;
