import { useState } from 'react';

import {
  Button,
  Container,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Input,
  Link,
  ModalContent,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';

import { signIn, signUp, supabase } from '../supabaseClient';
import { GoogleIcon } from './ProviderIcons';

export const SignUpOrLoginWithEmailOrGoogle = ({
  isLogInProp,
  setIsOpen,
}: {
  isLogInProp: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast();
  const [isLogIn, setIsLogIn] = useState(isLogInProp);

  return (
    <ModalContent>
      <Container maxW="md" py={{ base: '12', md: '24' }}>
        <Stack spacing="8">
          <Stack spacing="6">
            <img
              src="logo192.png"
              alt="Logo"
              width={48}
              height={48}
              style={{ marginLeft: 'auto', marginRight: 'auto' }}
            />
            <Stack spacing={{ base: '2', md: '3' }} textAlign="center">
              <Heading size={{ base: 'xs', md: 'sm' }}>
                {isLogIn ? 'Log in to your account' : 'Create an account'}
              </Heading>
              <Text color="fg.muted">Extrapolate the future today</Text>
            </Stack>
          </Stack>

          {isLogIn ? (
            <>
              <Stack spacing="6">
                <Stack spacing="5">
                  <FormControl>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <Input
                      id="email"
                      placeholder="Enter your email"
                      type="email"
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <Input
                      id="password"
                      placeholder="********"
                      type="password"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </FormControl>
                </Stack>
                <HStack justify="space-between">
                  {/* <Checkbox defaultChecked>Remember me</Checkbox> */}
                  <Button
                    variant="text"
                    size="sm"
                    onClick={async () => {
                      const { error } =
                        await supabase.auth.resetPasswordForEmail(email, {
                          redirectTo: 'https://extrapolate.earth/',
                        });
                      if (error) {
                        toast({
                          title: 'Error',
                          description: error.message,
                          status: 'error',
                          duration: 5000,
                          isClosable: true,
                        });
                      }
                    }}
                  >
                    Forgot password
                  </Button>
                </HStack>
                <Stack spacing="4">
                  <Button
                    onClick={async () => {
                      try {
                        await signIn(email, password);
                        setIsOpen(false);
                        toast({
                          title: 'Logged In',
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
                    }}
                  >
                    Sign in
                  </Button>
                  <Button
                    variant="secondary"
                    leftIcon={<GoogleIcon />}
                    onClick={async () => {
                      const { error }: any =
                        await supabase.auth.signInWithOAuth({
                          provider: 'google',
                        });
                      console.log(error);
                      if (error) {
                        toast({
                          title: 'Error',
                          description: error.message,
                          status: 'error',
                          duration: 5000,
                          isClosable: true,
                        });
                      } else {
                        setIsOpen(false);
                        toast({
                          title: 'Logged In',
                          status: 'success',
                          duration: 1000,
                          isClosable: true,
                        });
                      }
                    }}
                  >
                    Sign in with Google
                  </Button>
                </Stack>
              </Stack>
              <Text textStyle="sm" color="fg.muted">
                Don't have an account?{' '}
                <Link
                  onClick={() => {
                    setIsLogIn(false);
                  }}
                >
                  {' '}
                  Sign up
                </Link>
              </Text>
            </>
          ) : (
            <>
              <Stack spacing="6">
                <Stack spacing="5">
                  {/* <FormControl isRequired>
              <FormLabel htmlFor="name">Name</FormLabel>
              <Input id="name" type="text" />
            </FormControl> */}
                  <FormControl isRequired>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <Input
                      id="email"
                      type="email"
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <Input
                      id="password"
                      type="password"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <FormHelperText color="fg.muted">
                      At least 8 characters long
                    </FormHelperText>
                  </FormControl>
                </Stack>
                <Stack spacing="4">
                  <Button
                    onClick={async () => {
                      try {
                        await signUp(email, password);
                        setIsOpen(false);
                        toast({
                          title: 'Account created',
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
                    }}
                  >
                    Create account
                  </Button>
                  <Button
                    variant="secondary"
                    leftIcon={<GoogleIcon />}
                    onClick={async () => {
                      const { error }: any =
                        await supabase.auth.signInWithOAuth({
                          provider: 'google',
                        });
                      console.log(error);
                      if (error) {
                        toast({
                          title: 'Error',
                          description: error.message,
                          status: 'error',
                          duration: 5000,
                          isClosable: true,
                        });
                      } else {
                        setIsOpen(false);
                        toast({
                          title: 'Logged In',
                          status: 'success',
                          duration: 1000,
                          isClosable: true,
                        });
                      }
                    }}
                  >
                    Sign up with Google
                  </Button>
                </Stack>
              </Stack>
              <Text textStyle="sm" color="fg.muted" textAlign="center">
                Already have an account?{' '}
                <Link
                  onClick={() => {
                    setIsLogIn(true);
                  }}
                >
                  Log in
                </Link>
              </Text>
            </>
          )}
        </Stack>
      </Container>
    </ModalContent>
  );
};
