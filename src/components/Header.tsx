import React, { useEffect, useState } from 'react';
import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { supabase } from '../supabaseClient';
import '../index.css';
// import { CgProfile } from "react-icons/cg";
import { FaUser } from 'react-icons/fa';

const Header: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  // const handleSignOut = async () => {
  //   await supabase.auth.signOut();
  //   setUser(null);
  // };

  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      p={4}
      bg="blue.500"
      borderBottom="1px solid lightgray"
      fontFamily="Gotham Light"
      color="#53585F"
      height="32px"
    >
      <Flex alignItems="center">
        <img
          src="logo192.png"
          alt="Logo"
          width={20}
          height={20}
          style={{ marginRight: '10px', marginLeft: '10px', cursor: 'pointer' }}
          onClick={() => {
            console.log('clicked');
            window.location.href = '/';
          }}
        />
        <Text
          fontSize={22}
          style={{ cursor: 'pointer' }}
          onClick={() => {
            console.log('clicked');
            window.location.href = '/';
          }}
        >
          Extrapolate Earth
        </Text>
      </Flex>
      {user ? (
        <Box>
          <div
            style={{
              color: 'darkgrey',
              border: '1px solid grey',
              borderRadius: '4px',
              padding: '4px',
              paddingBottom: '2px',
              marginRight: '10px',
            }}
          >
            <FaUser />
          </div>
        </Box>
      ) : (
        <Button colorScheme="blue" variant="solid">
          Sign in
        </Button>
      )}
    </Flex>
  );
};

export default Header;
