import React, { useEffect, useRef, useState } from 'react';

import { Button } from '@chakra-ui/react';

import { supabase } from '../supabaseClient';
import { ExtrapolationPrompt, ExtrapolationValue, PointGroup } from '../types';
import LineGraph from './LineGraph';

// import { v4 as uuidv4 } from 'uuid';

// type UserExtrapolation = {
//   id: string;
//   user_id: string;
//   created_at: string;
//   extrapolation_values: ExtrapolationValue[];
// };

type UserExtrapolationResponse = {
  id: string;
  user_id: string;
  created_at: string;
  extrapolation_prompt: {
    minimum: number;
    maximum: number;
  };
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
    UserExtrapolationResponse[]
  >([]);
  //   const [error, setError] = useState('');
  const graph = useRef<LineGraph | null>(null);

  const setSvgRef = (node: SVGSVGElement | null) => {
    if (node && !graph.current) {
      // Check if node exists and graph is not already initialized
      graph.current = new LineGraph(false, 400, 300);
      graph.current.initialize(node, true);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('user_extrapolation')
        .select(
          'id, user_id, created_at, extrapolation_prompt( minimum, maximum ), extrapolation_values (year, value)'
        )
        .eq('is_active', true)
        .eq('extrapolation_prompt_id', extrapolationPrompt.id);

      if (error) throw error;

      // I wonder if there is a bug with supabase for types here as
      // the data returned is like:
      // [
      //   {
      //     created_at: "2024-05-19T06:29:41.488927+00:00"
      //     extrapolation_prompt:{maximum: 10000, minimum: 0}
      //     extrapolation_values:  [{…}, {…}, {…}, {…}, {…}]
      //     id: 0
      //     user_id: "..."
      //   }
      // ]
      // However it seems to want an array of extrapolation_prompt

      // @ts-ignore
      setUserExtrapolations(data as UserExtrapolationResponse[]);
      const pointGroups: PointGroup[] = data.map((d) => {
        return {
          // id: uuidv4(),
          color: '#5FCBFD',
          points: d.extrapolation_values.map((x) => {
            return [x.year, x.value];
          }),
        };
      });

      // TODO eventually get min/max from point groups instead of extrapolation prompt
      graph.current?.updateMinMax(
        // @ts-ignore
        data[0].extrapolation_prompt.minimum,
        // @ts-ignore
        data[0].extrapolation_prompt.maximum
      );

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
          const { error } = await supabase
            .from('extrapolation_prompt')
            .update({ is_active: false })
            .eq('id', extrapolationPrompt.id);

          if (error) {
            console.error('Error updating extrapolation:', error);
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
