import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@chakra-ui/react';
import { supabase } from '../supabaseClient';
import { ExtrapolationPrompt, ExtrapolationValue, PointGroup } from '../types';
import LineGraph from './LineGraph';
// import { v4 as uuidv4 } from 'uuid';

type UserExtrapolation = {
  id: string;
  user_id: string;
  created_at: string;
  extrapolation_values: ExtrapolationValue[];
};

type ExtrapolationProps = {
  extrapolationPrompt: ExtrapolationPrompt;
};

const Extrapolation: React.FC<ExtrapolationProps> = ({
  extrapolationPrompt,
}) => {
  // const [extrapolationValues, setExtrapolationsValues] = useState<
  //   ExtrapolationValue[]
  // >([]);
  const [userExtrapolations, setUserExtrapolations] = useState<
    UserExtrapolation[]
  >([]);
  //   const [error, setError] = useState('');
  const graph = useRef<LineGraph | null>(null);

  const setSvgRef = (node: SVGSVGElement | null) => {
    if (node && !graph.current) {
      // Check if node exists and graph is not already initialized
      graph.current = new LineGraph();
      graph.current.initialize(node, true);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('user_extrapolation')
        .select('id, user_id, created_at, extrapolation_values (year, value)')
        .eq('is_active', true)
        .eq('extrapolation_prompt_id', extrapolationPrompt.id);
      if (error) throw error;
      setUserExtrapolations(data as UserExtrapolation[]);
      const pointGroups: PointGroup[] = data.map((d) => {
        return {
          // id: uuidv4(),
          color: 'red',
          points: d.extrapolation_values.map((x) => {
            return [x.year, x.value];
          }),
        };
      });
      console.log(pointGroups);
      graph.current?.updatePointGroups(pointGroups);
    };
    fetchData();
  }, [extrapolationPrompt.id]);

  return (
    <div>
      <h3> {extrapolationPrompt.extrapolation_text} </h3>
      <svg ref={setSvgRef}></svg>
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
        Add Extrapolation
      </Button>
    </div>
  );
};

export default Extrapolation;
