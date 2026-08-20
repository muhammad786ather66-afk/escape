import React from 'react';
import { AutoRunnerGame } from './components/AutoRunnerGame';

export function App() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-950">
      <AutoRunnerGame initialLevel={1} />
    </div>
  );
}

export default App;
