import React, { useEffect, useRef, useState } from 'react';

import { Box, Button, Text, useColorMode, useToast } from '@chakra-ui/react';

import { supabase } from '../supabaseClient';
import LineGraph from './LineGraph';

type AddExtrapolationProps = {
  session: any;
};

const AddExtrapolation: React.FC<AddExtrapolationProps> = ({ session }) => {
  // const svgRef = useRef<SVGSVGElement>(null);ss
  const [points, setPoints] = useState<[number, number][]>([]);
  const graph = useRef<LineGraph | null>(null);
  const [extrapolationPrompt, setExtrapolationPrompt] = useState<any>(null);

  const toast = useToast();
  const { colorMode } = useColorMode();

  // Callback ref to handle SVG initialization immediately when the element is mounted
  const setSvgRef = async (node: SVGSVGElement | null) => {
    if (extrapolationPrompt && node && !graph.current) {
      graph.current = new LineGraph(colorMode, true, 800, 600);
      const currentYear = new Date().getFullYear();

      let historicalData: [number, number][] = [
        [currentYear, extrapolationPrompt.initialYearValue],
      ];
      console.log('extrapolationPrompt', extrapolationPrompt);
      if (extrapolationPrompt.ground_truth_values) {
        historicalData = extrapolationPrompt.ground_truth_values.map(
          (item: any) => [item.year, item.value]
        );

        historicalData.sort((a, b) => a[0] - b[0]);
      }

      graph.current.initialize(node, false, [], [], historicalData);
      graph.current.updateMinMax(
        extrapolationPrompt.minimum,
        extrapolationPrompt.maximum
      );
      graph.current.updatePoints = () => {
        if (graph.current) {
          setPoints([...graph.current.getPoints().sort((a, b) => a[0] - b[0])]); // Update React state when D3 state changes
        }
      };
      graph.current.updateGraph();
    }
  };

  useEffect(() => {
    // http://localhost:3000/add_extrapolation?id=6
    const urlParams = new URLSearchParams(window.location.search);
    const { id } = Object.fromEntries(urlParams.entries());
    const fetchExtraPolationPrompt = async (extrapolationPromptId: number) => {
      const { data, error } = await supabase
        .from('extrapolation_prompt')
        .select('*, ground_truth_values (year, value)')
        .eq('id', extrapolationPromptId);
      console.log('the data');
      console.log(data);
      if (error) throw error;

      setExtrapolationPrompt(data[0]);
    };
    fetchExtraPolationPrompt(parseInt(id));
  }, []);

  const handleExtrapolationSubmit = async () => {
    try {
      if (!extrapolationPrompt) {
        throw new Error('Extrapolation prompt not found.');
      }
      if (!session.user) {
        throw new Error('You must be logged in to submit a extrapolation.');
      }
      const { data, error } = await supabase
        .from('user_extrapolation')
        .insert([
          {
            user_id: session.user.id,
            extrapolation_prompt_id: extrapolationPrompt.id,
            is_active: true,
          },
        ])
        .select();
      if (error) throw error;
      const user_extrapolation_id = data[0].id;

      await supabase.from('extrapolation_values').insert(
        points.map((point) => ({
          user_extrapolation_id: user_extrapolation_id,
          extrapolation_prompt_id: extrapolationPrompt.id,
          year: point[0],
          value: point[1],
          user_id: session.user.id,
        }))
      );
      if (error) throw error;
      toast({
        title: 'Extrapolation submitted successfully!',
        description: '',
        status: 'success',
        duration: 1000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const description =
    extrapolationPrompt && extrapolationPrompt.description ? (
      <Text>{extrapolationPrompt.description}</Text>
    ) : null;

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
        <Text>{extrapolationPrompt?.extrapolation_text}</Text>
        {description}
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
              onClick={() => handleExtrapolationSubmit()}
            >
              Submit Extrapolations
            </Button>
            {/* {error && <Box color="red.500">{error}</Box>} */}
          </div>
        </div>
      </Box>
    </Box>
  );
};

export default AddExtrapolation;
