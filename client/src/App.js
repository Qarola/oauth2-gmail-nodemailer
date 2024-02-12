import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Form from './Components/Form.jsx'; 
import { FormProvider } from './context/FormContext.js';
import "./stylesheets/App.scss";


const App = () => {
  return (
    <div className="app">
      <FormProvider>
      <Router>
        <Routes>
        <Route path="/" element={<Form />} />
        </Routes>
      </Router>
      </FormProvider>
      
    </div>
  );
};

export default App;