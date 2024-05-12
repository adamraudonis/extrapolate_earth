import React from 'react';
import { Box, Button } from '@chakra-ui/react';
import ExtrapolationsList from './ExtrapolationsList';
import SignUpForm from './SignUpForm';
import OAuth from './OAuth';

type HomeProps = {
  session: any;
};

const Home: React.FC<HomeProps> = ({ session }) => {
  return (
    <Box>
      {/* TODO: Move header to app.tsx */}

      {/* <p>Make predictions about the long term trends facing humanity</p> */}
      <SignUpForm />
      <OAuth session={session} />
      <ExtrapolationsList />
      <Button
        colorScheme="blue"
        variant="solid"
        onClick={() => {
          window.location.href = '/new_extrapolation';
        }}
      >
        New Extrapolation Prompt
      </Button>
    </Box>
  );
};

export default Home;
