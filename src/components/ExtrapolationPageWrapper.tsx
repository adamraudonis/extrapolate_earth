import React from 'react';
// import React, { useEffect, useState } from 'react';
// import { Box, Button, Flex, Text } from '@chakra-ui/react';
// import { supabase } from '../supabaseClient';

const ExtrapolationPageWrapper: React.FC = () => {
  // const [user, setUser] = useState<any>(null);

  // useEffect(() => {
  //   supabase.auth.onAuthStateChange((_event, session) => {
  //     setUser(session?.user ?? null);
  //   });
  // }, []);

  // const handleSignOut = async () => {
  //   await supabase.auth.signOut();
  //   setUser(null);
  // };

  return (
    <div>TODO</div>
    // <Flex
    //   justifyContent="space-between"
    //   alignItems="center"
    //   p={4}
    //   bg="blue.500"
    // >
    //   <Text fontSize="lg" fontWeight="bold">
    //     Extrapolate Earth
    //   </Text>
    //   {user ? (
    //     <Box>
    //       <Text fontSize="md">Signed in as {user.email}</Text>
    //       <Button colorScheme="blue" variant="outline" onClick={handleSignOut}>
    //         Sign out
    //       </Button>
    //     </Box>
    //   ) : (
    //     <Button colorScheme="blue" variant="solid">
    //       Sign in
    //     </Button>
    //   )}
    // </Flex>
  );
};

export default ExtrapolationPageWrapper;
