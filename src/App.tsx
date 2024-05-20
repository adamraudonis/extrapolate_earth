// import React from 'react';
// import './App.css';
// import SignUpForm from './components/SignUpForm';
// import ExtrapolationPromptForm from './components/ExtrapolationPromptForm';
// import ExtrapolationsList from './components/ExtrapolationsList';
// import Header from './components/Header';

// function App() {
//   return (
//     <div className="App">
//       <Header />
//       <SignUpForm />
//       <ExtrapolationPromptForm />
//       <ExtrapolationsList />
//     </div>
//   );
// }

// export default App;

import './index.css';

import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom'; // Navigate

import AddExtrapolation from './components/AddExtrapolation';
import Header from './components/Header';
import Home from './components/Home';
import NewExtrapolation from './components/NewExtrapolation';
import Profile from './components/Profile';
import { supabase } from './supabaseClient';

// const PrivateRoute = ({ element, session, ...rest }: any) => {
//   // redirect to home page if user is not authenticated
//   if (!session) {
//     return <Navigate to="/" />;
//   }
//   return element;
// };

export default function App() {
  const [session, setSession] = useState<any | null>(null);
  const [isDone, setIsDone] = useState<boolean | null>(null);
  // const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    // This doesn't seem to work anymore
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);

      // if (session) {
      //   const { data }: any = await supabase
      //     .from('admins')
      //     .select()
      //     .eq('id', session.user.id);
      //   setIsAdmin(data.length > 0);
      // } else {
      //   setIsAdmin(false);
      // }

      setIsDone(true);
    });

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        // NOTE: This currently hangs
        // const { user } = session || {};
        // const { email, user_metadata, id } = user || {};
        // const { name } = user_metadata || {};
        // const updates = {
        //   created_at: new Date(),
        //   email: email,
        //   name: name,
        //   user_id: id,
        // };
        // await supabase.from('profiles').upsert(updates);
      } else {
        console.log('no session');
      }

      // setIsDone(true);
      setSession(session);
    });
  }, []);

  if (!isDone) {
    // TODO: Remove this blocking loading step.
    return <h1>Loading...</h1>;
  } else {
    return (
      <>
        <Header session={session} />
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/about" element={<About />} /> */}
          {/* TODO: Actually use private route */}
          {/* <Route
          path="/new_extrapolation"
          element={
            <PrivateRoute
              session={session}
              element={<Controls session={session} />}
            />
          }
        /> */}
          {/* <Route path="/extrapolation" element={<ExtrapolationPageWrapper />} /> */}
          <Route path="/profile" element={<Profile session={session} />} />

          <Route
            path="/new_extrapolation"
            element={<NewExtrapolation session={session} />}
          />
          <Route
            path="/add_extrapolation"
            element={<AddExtrapolation session={session} />}
          />
        </Routes>
      </>
    );
  }
}
