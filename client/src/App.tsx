import React from 'react';
import Chat from './Chat'; // Assuming this is the path to your Chat component
import { CssBaseline } from '@mui/material'; // Importing CssBaseline from Material-UI

function App() {
  return (
    <>
      <CssBaseline /> {/* Applies global CSS reset */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(to right, #131313, #212121)', minHeight: '100vh', padding: '20px' }}>
        <Chat /> {/* Renders the Chat component */}
      </div>
    </>
  );
}

export default App;