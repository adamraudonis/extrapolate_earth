import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  Menu,
  MenuItem,
  MenuButton,
  IconButton,
  MenuList,
  Modal,
  ModalOverlay,
  Spacer,
  Image,
} from '@chakra-ui/react';

import { supabase } from '../supabaseClient';
import '../index.css';
// import { CgProfile } from "react-icons/cg";
import { FaUser } from 'react-icons/fa';
import { SignUpOrLoginWithEmailOrGoogle } from './SignUpOrLoginWithEmailOrGoogle';

type HeaderProps = {
  session: any;
};

const Header: React.FC<HeaderProps> = ({ session }) => {
  // const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLogIn, setIsLogIn] = useState(true);

  // const [signUpisOpen, setSignUpisOpen] = useState(false);

  // useEffect(() => {
  //   supabase.auth.onAuthStateChange((_event, session) => {
  //     setUser(session?.user ?? null);
  //   });
  // }, []);

  // const handleSignOut = async () => {
  //   await supabase.auth.signOut();
  //   setUser(null);
  // };

  // <Flex
  //   // justifyContent="space-between"
  //   // alignItems="center"
  //   p={4}
  //   // bg="blue.500"
  //   borderBottom="1px solid lightgray"
  //   height="40px"
  //   alignItems="center"
  // >
  return (
    <Flex
      minWidth="max-content"
      alignItems="center"
      borderBottom="1px solid lightgray"
    >
      <Image
        src="logo192.png"
        alt="Logo"
        boxSize="20px"
        // width={20}
        // height={20}
        style={{ marginRight: '10px', marginLeft: '10px', cursor: 'pointer' }}
        onClick={() => {
          window.location.href = '/';
        }}
      />
      <Box>
        <Text
          fontSize={22}
          style={{
            cursor: 'pointer',
            fontFamily: 'Gotham Light',
            color: '#53585F',
            // display: 'flex',
            // alignItems: 'center',
            // justifyContent: 'center',
          }}
          onClick={() => {
            window.location.href = '/';
          }}
        >
          Extrapolate Earth
        </Text>
      </Box>
      <Spacer />
      {session?.user ? (
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<FaUser />}
            variant="outline"
            size="xsm"
            style={{ marginLeft: '10px', marginRight: '10px', padding: '4px' }}
          />
          <MenuList>
            <MenuItem
              onClick={async () => {
                await supabase.auth.signOut();
              }}
            >
              Sign Out
            </MenuItem>
          </MenuList>
        </Menu>
      ) : (
        <>
          <Button
            variant="outline"
            size="xsm"
            onClick={async () => {
              setIsLogIn(true);
              setIsOpen(true);
            }}
            style={{
              marginRight: '10px',
              paddingTop: '2px',
              paddingBottom: '2px',
              fontSize: '13px',

              paddingLeft: '10px',
              paddingRight: '10px',
            }}
          >
            Sign In
          </Button>
          <Button
            variant="outline"
            size="xsm"
            onClick={async () => {
              setIsLogIn(false);
              setIsOpen(true);
            }}
            style={{
              marginRight: '10px',
              paddingTop: '2px',
              paddingBottom: '2px',
              fontSize: '13px',
              paddingLeft: '10px',
              paddingRight: '10px',
            }}
          >
            Sign Up
          </Button>
        </>
      )}

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      >
        <ModalOverlay />
        <SignUpOrLoginWithEmailOrGoogle isLogInProp={isLogIn} />
      </Modal>
    </Flex>
  );
};

export default Header;
