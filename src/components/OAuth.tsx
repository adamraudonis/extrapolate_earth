import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import './OAuth.css';

type OAuthProps = {
  session: any;
};

const OAuth: React.FC<OAuthProps> = ({ session }) => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: any) => {
    e.preventDefault();

    try {
      setLoading(true);

      const { error }: any = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) throw error;
    } catch (error: any) {
      console.log(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    await supabase.auth.signOut();
  };
  //   const userWelcome = session ? (
  //     <div className="subtitle">Welcome {session.user.user_metadata.name}!</div>
  //   ) : null;
  const signIn = loading ? (
    <>'Logging In...'</>
  ) : (
    <button
      type="button"
      onClick={handleLogin}
      className="login-with-google-btn"
    >
      Sign in with Google
    </button>
  );

  return session ? (
    <div>
      <br />
      <button className="logoutButton" onClick={signOutUser}>
        Logout
      </button>
    </div>
  ) : (
    signIn
  );
};

export default OAuth;
