import React, { useState, useEffect } from 'react';
import { Box, Button, FormControl, FormLabel, Input } from '@chakra-ui/react';
import { supabase, signUp, signIn } from '../supabaseClient';

const SignUpForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await signUp(email, password);
      if (error) throw error;
      alert(
        'Sign up successful. Please check your email for a confirmation link.'
      );
    } catch (error: any) {
      setError(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await signIn(email, password);
      if (error) throw error;
    } catch (error: any) {
      setError(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
  };

  const func = isSignUp ? handleSignUp : handleSignIn;

  if (user) {
    return null;
  }

  return (
    <Box p={4}>
      <form onSubmit={func}>
        <FormControl id="email" isRequired>
          <FormLabel>Email address</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
          />
        </FormControl>
        <FormControl id="password" isRequired mt={4}>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
          />
        </FormControl>
        {error && (
          <Box color="red.500" mt={2}>
            {error}
          </Box>
        )}
        <Button mt={4} colorScheme="teal" isLoading={loading} type="submit">
          {isSignUp ? 'Sign Up' : 'Log In'}
        </Button>
        <Box mt={4}>
          <Button color="teal.500" variant="link" onClick={toggleForm}>
            {isSignUp
              ? 'Already have an account? Log In'
              : 'Need an account? Sign Up'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default SignUpForm;
