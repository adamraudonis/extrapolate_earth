import '../index.css';

import React, { useState } from 'react';
// import { CgProfile } from "react-icons/cg";
import { FaUser } from 'react-icons/fa';

import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalOverlay,
  Spacer,
  Text,
  useColorMode,
} from '@chakra-ui/react';

import { supabase } from '../supabaseClient';
import { SignUpOrLoginWithEmailOrGoogle } from './SignUpOrLoginWithEmailOrGoogle';

type HeaderProps = {
  session: any;
};

const Header: React.FC<HeaderProps> = ({ session }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogIn, setIsLogIn] = useState(true);
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex
      minWidth="max-content"
      alignItems="center"
      borderBottom="1px solid lightgray"
      height="40px"
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
            color: colorMode === 'light' ? '#53585F' : 'white',
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
        <>
          <Button
            colorScheme="blue"
            size="xsm"
            variant="outline"
            style={{
              padding: '3px',
              paddingRight: '9px',
              paddingLeft: '9px',
            }}
            onClick={() => {
              window.location.href = '/new_extrapolation';
            }}
          >
            New Extrapolation
          </Button>

          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<FaUser />}
              variant="outline"
              size="xsm"
              style={{
                marginLeft: '10px',
                marginRight: '10px',
                padding: '4px',
              }}
            />
            <MenuList>
              <MenuItem
                onClick={async () => {
                  window.location.href = '/profile';
                }}
              >
                Profile
              </MenuItem>
              <MenuItem
                onClick={async () => {
                  await supabase.auth.signOut();
                  // Note: We can't do a toast with a redirect
                  // because the toast will disappear before the redirect happens
                  window.location.href = '/';
                }}
              >
                Sign Out
              </MenuItem>
            </MenuList>
          </Menu>
        </>
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
      <IconButton
        aria-label="Toggle dark mode"
        icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
        onClick={toggleColorMode}
        size="xsm"
        style={{
          marginRight: '10px',
          padding: '4px',
        }}
      />
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      >
        <ModalOverlay />
        <SignUpOrLoginWithEmailOrGoogle
          isLogInProp={isLogIn}
          setIsOpen={setIsOpen}
        />
      </Modal>
    </Flex>
  );
};

export default Header;
