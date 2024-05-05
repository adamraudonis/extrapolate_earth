import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import { supabase } from '../supabaseClient';
import { CloseIcon } from '@chakra-ui/icons';
import LineGraph from './LineGraph';

interface ExtrapolationEntry {
  year: string;
  value: string;
}

type AddExtrapolationProps = {
  session: any;
};

const AddExtrapolation: React.FC<AddExtrapolationProps> = () => {
  // const svgRef = useRef<SVGSVGElement>(null);
  const [points, setPoints] = useState<[number, number][]>([]);
  const graph = useRef<LineGraph | null>(null);

  // Callback ref to handle SVG initialization immediately when the element is mounted
  const setSvgRef = (node: SVGSVGElement | null) => {
    if (node && !graph.current) {
      // Check if node exists and graph is not already initialized
      console.log('Initializing graph');
      graph.current = new LineGraph();
      graph.current.initialize(node);
      graph.current.updatePoints = () => {
        console.log('inside update points');
        if (graph.current) {
          console.log(' graph.current.getPoints()', graph.current.getPoints());
          setPoints([...graph.current.getPoints().sort((a, b) => a[0] - b[0])]); // Update React state when D3 state changes
        }
      };
    }
  };

  console.log('inside should re render', points);

  useEffect(() => {
    console.log('the points changed');
    // if (svgRef.current) {
    //   console.log('initializing graph');
    //   graph.current = new LineGraph();
    //   graph.current.initialize(svgRef.current);
    //   graph.current.update = () => {
    //     // Override update method to include state setting
    //     if (graph.current) {
    //       setPoints(graph.current.getPoints()); // Update React state when D3 state changes
    //     }
    //   };
    // }
  }, [points]);

  // TODO: Get the url param for example:
  // http://localhost:3000/add_extrapolation?id=6
  const urlParams = new URLSearchParams(window.location.search);
  const { id } = Object.fromEntries(urlParams.entries());
  const extrapolationPromptId = id;

  const [extrapolations, setExtrapolations] = useState<ExtrapolationEntry[]>([
    { year: '', value: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [user, setUser] = useState<null | { id: string }>(null);

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleExtrapolationSubmit = async () => {
    console.log('inside submit');
    if (!user) {
      setError('You must be logged in to submit a extrapolation.');
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_extrapolation')
        .insert([
          {
            user_id: user.id,
            extrapolation_prompt_id: extrapolationPromptId,
            is_active: true,
          },
        ])
        .select();
      if (error) throw error;
      console.log(data);
      const user_extrapolation_id = data[0].id;

      await supabase.from('extrapolation_values').insert(
        extrapolations.map((extrapolation) => ({
          user_extrapolation_id: user_extrapolation_id,
          extrapolation_prompt_id: extrapolationPromptId,
          year: extrapolation.year,
          value: extrapolation.value,
          user_id: user.id,
        }))
      );
      if (error) throw error;
      alert('Extrapolation submitted successfully.');
      setExtrapolations([{ year: '', value: '' }]);
    } catch (error: any) {
      setError(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  const addExtrapolationEntry = () => {
    setExtrapolations([...extrapolations, { year: '', value: '' }]);
  };

  const updateExtrapolationEntry = (
    index: number,
    field: keyof ExtrapolationEntry,
    value: string
  ) => {
    const newExtrapolations = [...extrapolations];
    newExtrapolations[index][field] = value;
    setExtrapolations(newExtrapolations);
  };

  const removeExtrapolationEntry = (index: number) => {
    const newExtrapolations = [...extrapolations];
    newExtrapolations.splice(index, 1);
    setExtrapolations(newExtrapolations);
  };

  if (!user) {
    return (
      <Box p={4}>
        <Text>You must be logged in to submit a extrapolation.</Text>
      </Box>
    );
  }

  return (
    <Box
      p={4}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box>
        <svg ref={setSvgRef}></svg>

        <div>
          <div>
            <table>
              <thead>
                <tr>
                  <th>X (Year)</th>
                  <th>Y (Value)</th>
                </tr>
              </thead>
              <tbody>
                {points.map((point, index) => (
                  <tr key={index}>
                    <td>{point[0]}</td>
                    <td>{point[1].toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <Button
              mt={4}
              colorScheme="teal"
              isLoading={loading}
              onClick={() => handleExtrapolationSubmit}
            >
              Submit Extrapolations
            </Button>
          </div>
        </div>
      </Box>

      {/* <form onSubmit={handleExtrapolationSubmit}>
        <VStack spacing={4}>
          {extrapolations.map((extrapolation, index) => (
            <HStack key={index}>
              <FormControl id={`extrapolationYear_${index}`} isRequired>
                <FormLabel>Year</FormLabel>
                <Input
                  type="number"
                  value={extrapolation.year}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateExtrapolationEntry(index, 'year', e.target.value)
                  }
                />
              </FormControl>
              <FormControl id={`extrapolationValue_${index}`} isRequired>
                <FormLabel>Value</FormLabel>
                <Input
                  type="number"
                  value={extrapolation.value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateExtrapolationEntry(index, 'value', e.target.value)
                  }
                />
              </FormControl>
              <IconButton
                aria-label="Remove extrapolation"
                icon={<CloseIcon />}
                onClick={() => removeExtrapolationEntry(index)}
              />
            </HStack>
          ))}
          <Button onClick={addExtrapolationEntry}>Add another year</Button>
        </VStack>
        {error && (
          <Box color="red.500" mt={2}>
            {error}
          </Box>
        )}
        <Button mt={4} colorScheme="teal" isLoading={loading} type="submit">
          Submit Extrapolations
        </Button>
      </form> */}
    </Box>
  );
};

export default AddExtrapolation;
