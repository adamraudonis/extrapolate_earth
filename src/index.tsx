import './index.css';

// import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { theme } from '@chakra-ui/pro-theme';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

import App from './App';
import reportWebVitals from './reportWebVitals';

const proTheme = extendTheme(theme);
const extendedConfig = {
  colors: { ...proTheme.colors, brand: proTheme.colors.blue },
};
const myTheme = extendTheme(extendedConfig, proTheme);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // Turning off react strict mode to not
  // get useEffect being called twice
  // <React.StrictMode>
  <BrowserRouter>
    <ChakraProvider theme={myTheme}>
      <App />
    </ChakraProvider>
  </BrowserRouter>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
