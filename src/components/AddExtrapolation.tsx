import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Text } from '@chakra-ui/react';
import { supabase } from '../supabaseClient';
import LineGraph from './LineGraph';

type AddExtrapolationProps = {
  session: any;
};

const AddExtrapolation: React.FC<AddExtrapolationProps> = () => {
  // const svgRef = useRef<SVGSVGElement>(null);ss
  const [points, setPoints] = useState<[number, number][]>([]);
  const graph = useRef<LineGraph | null>(null);

  // Callback ref to handle SVG initialization immediately when the element is mounted
  const setSvgRef = (node: SVGSVGElement | null) => {
    if (node && !graph.current) {
      // Check if node exists and graph is not already initialized
      graph.current = new LineGraph();
      graph.current.initialize(node, false, [], [[2024, 10]]);
      graph.current.updatePoints = () => {
        if (graph.current) {
          setPoints([...graph.current.getPoints().sort((a, b) => a[0] - b[0])]); // Update React state when D3 state changes
        }
      };
    }
  };

  useEffect(() => {
    // if (svgRef.current) {
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [user, setUser] = useState<null | { id: string }>(null);

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleExtrapolationSubmit = async () => {
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
      const user_extrapolation_id = data[0].id;

      await supabase.from('extrapolation_values').insert(
        points.map((point) => ({
          user_extrapolation_id: user_extrapolation_id,
          extrapolation_prompt_id: extrapolationPromptId,
          year: point[0],
          value: point[1],
          user_id: user.id,
        }))
      );
      if (error) throw error;
      alert('Extrapolation submitted successfully.');
    } catch (error: any) {
      // setError(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  // const addExtrapolationEntry = () => {
  //   setExtrapolations([...extrapolations, { year: '', value: '' }]);
  // };

  // const updateExtrapolationEntry = (
  //   index: number,
  //   field: keyof ExtrapolationEntry,
  //   value: string
  // ) => {
  //   const newExtrapolations = [...extrapolations];
  //   newExtrapolations[index][field] = value;
  //   setExtrapolations(newExtrapolations);
  // };

  // const removeExtrapolationEntry = (index: number) => {
  //   const newExtrapolations = [...extrapolations];
  //   newExtrapolations.splice(index, 1);
  //   setExtrapolations(newExtrapolations);
  // };

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
                  <th>Year</th>
                  <th>Value</th>
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
              onClick={() => handleExtrapolationSubmit()}
            >
              Submit Extrapolations
            </Button>
            {error && <Box color="red.500">{error}</Box>}
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
