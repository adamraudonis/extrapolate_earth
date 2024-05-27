import React, { useEffect, useState } from 'react';

import { ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Image,
  Input,
  Link,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Textarea,
} from '@chakra-ui/react';

import { getOWIDinfo } from '../services/owid_processor';
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

  // const getData = async (url: string) => {
  //   const output_data = await getXandYOwid(url);
  //   console.log(output_data);
  // };

  const createExtrapolationFromOWID = async (url: string) => {
    if (!user) {
      throw new Error('You must be logged in to submit a extrapolation.');
    }

    const owidInfo = await getOWIDinfo(url);
    const { metadata, years, values } = owidInfo;
    const extrapolation_text: string = metadata.presentation
      ? metadata.presentation.titlePublic
      : metadata.name;

    const unit: string = metadata.display
      ? metadata.display.unit
      : metadata.unit;
    let finalMin: number = 0;
    let finalMax: number = 10 * Math.max(...values);

    if (unit === 'percentage' || unit === '%') {
      finalMax = 100;
    }

    const resp = await supabase
      .from('extrapolation_prompt')
      .insert({
        user_id: user.id,
        is_owid: true,
        owid_url: url,
        owid_id: metadata.id,
        description: metadata.descriptionShort,
        extrapolation_text,
        unit,
        is_active: true,
        // TODO: Handle initial year value properly
        initial_year_value: initialYearValue,
        // TODO: Handle minimum and maximum properly
        minimum: finalMin,
        maximum: finalMax,
      })
      .select();
    if (resp.error) {
      throw new Error(resp.error.message);
    }
    const id = resp.data?.[0]?.id;

    const valuesToInsert = years.map((year, index) => {
      return {
        extrapolation_prompt_id: id,
        user_id: user.id,
        year,
        value: values[index],
      };
    });

    const resp2 = await supabase
      .from('ground_truth_values')
      .insert(valuesToInsert)
      .select();
    if (resp2.error) {
      throw new Error(resp2.error.message);
    }
    return id;
  };

  useEffect(() => {
    // DEBUG
    // console.log('INisde use effect getting data');
    // const url =
    //   'https://ourworldindata.org/grapher/solar-share-energy?tab=chart&country=~USA';

    // getData(url);
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
      <Tabs>
        <TabList>
          <Tab>Our World In Data</Tab>
          <Tab>Custom Extrapolation</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Flex
              // minWidth="max-content"
              alignItems="center"
              // borderBottom="1px solid lightgray"
              // height="40px"
            >
              <Image
                src="images/owid_logo.png"
                alt="OWID Logo"
                objectFit="contain"
                boxSize="60px"
                // width={20}
                // height={20}
                style={{
                  marginRight: '10px',
                  // marginLeft: '10px',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  // todo make new window
                  window.location.href = 'https://ourworldindata.org/';
                }}
              />
              <Heading as="h6" size="xs" fontSize={22}>
                Extrapolate Our World in Data Chart
              </Heading>
              {/* <Text
                fontSize={22}
                style={
                  {
                    // cursor: 'pointer',
                    //fontFamily: 'Gotham Light',
                    // color: colorMode === 'light' ? '#53585F' : 'white',
                  }
                }
                onClick={() => {
                  window.location.href = '/';
                }}
              >
                Extrapolate Our World in Data Chart
              </Text> */}
            </Flex>
            <Link href="https://ourworldindata.org/charts" isExternal>
              View their available data <ExternalLinkIcon mx="2px" />
            </Link>{' '}
            <FormControl id={'owid_url'}>
              <FormLabel>Paste Our World In Data URL Here</FormLabel>
              <Input
                type="string"
                placeholder="https://ourworldindata.org/grapher/solar-share-energy?tab=chart&country=~USA"
                onChange={async (e) => {
                  console.log('inside on change');
                  try {
                    const id = await createExtrapolationFromOWID(
                      e.target.value
                    );
                    window.location.href = `/add_extrapolation?id=${id}`;
                  } catch (error: any) {
                    setError(error.message);
                  }
                }}
              />
            </FormControl>
            <br />
            Pick a chart with a single value overtime. For example:
            <iframe
              title="Our World In Data Chart"
              src="https://ourworldindata.org/grapher/share-electricity-solar?tab=chart&country=~USA"
              loading="lazy"
              style={{ width: '100%', height: '600px', border: '0px none' }}
              allow="web-share; clipboard-write"
            ></iframe>
          </TabPanel>
          <TabPanel>
            <Heading as="h2" size="md">
              Extrapolate Custom Data{' '}
            </Heading>
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
                  onChange={(e) =>
                    setInitialYearValue(parseFloat(e.target.value))
                  }
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
              <Heading as="h6" size="xs">
                Historical Data (Optional)
              </Heading>
              or Upload Your Own Data
              {/* <FormControl id={'upload_data'}>
          <FormLabel>Upload Your Own Data</FormLabel>
          <Input type="file" accept=".csv" onChange={handleFileUpload} />
        </FormControl> */}
              <Button mt={4} isLoading={loading} type="submit">
                Submit
              </Button>
            </form>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {error && (
        <Box color="red.500" mt={2}>
          {error}
        </Box>
      )}
    </Box>
  );
};

export default NewExtrapolation;
