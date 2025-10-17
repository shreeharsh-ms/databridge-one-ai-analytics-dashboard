import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MongoDBConnection from './pages/MangoDB/MongoDBConnection';
import MongoDBConnections from './pages/MangoDB/MongoDBConnections';
import TestConnection from './pages/MangoDB/TestConnection';
import PostgreSQLConnection from './pages/PostgreSQL/PostgreSQLConnection';
import TestPostgreSQLConnection from './pages/PostgreSQL/TestPostgreSQLConnection';
import OracleConnection from './pages/OracleConnection/OracleConnection';
import MySQLConnections from './pages/Mysql/MySQLConnections';
import TestOracleConnection from './pages/OracleConnection/TestOracleConnection';
import DataConnectionsOverview from './pages/DataBasesOverView/DataConnectionsOverview';
import PostgreSQLConnections from './pages/PostgreSQL/PostgreSQLConnections';
import OracleConnections from './pages/OracleConnection/OracleConnections';
import FileSourcesConnections from './pages/FileStorage/FileSourcesConnections';
import ApiEndpointsConnections from './pages/ApiEndpointsConnections/ApiEndpointsConnections';
import ApiEndpointConfiguration from './pages/ApiEndpointsConnections/ApiEndpointConfiguration';
import FileSourcesConfig from './pages/FileStorage/FileSourcesConfig';
import TestFileSource from './pages/FileStorage/TestFileSource';
import TestApiConnection from './pages/ApiEndpointsConnections/TestApiConnection';
import MySQLConfiguration from './pages/Mysql/MySQLConfiguration';
import TestMySQLConnection from './pages/Mysql/TestMySQL';
import DataExplore from './pages/DataExplore/DataExplore.JSX';
import DataManipulation from './pages/DataManipulation/DataManipulation';
import TestingPage from './pages/Testing/TestingPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/testing" replace />} />
          <Route path="/testing" element={<TestingPage />} />
          <Route path="/connections" element={<DataConnectionsOverview />} />
          <Route path="/configure-mongodb" element={<MongoDBConnection />} />
          <Route path="/test-mongodb" element={<TestConnection />} />
          <Route path="/configure-postgresql" element={<PostgreSQLConnection />} />
          <Route path="/test-postgresql" element={<TestPostgreSQLConnection />} />
          <Route path="/configure-oracle" element={<OracleConnection />} />
          <Route path="/test-oracle" element={<TestOracleConnection />} />
          <Route path="/connections/mongodb" element={<MongoDBConnections />} />
          <Route path="/connections/postgresql" element={<PostgreSQLConnections />} />
          <Route path="/connections/oracle" element={<OracleConnections />} />
            <Route path="/connections/mysql" element={<MySQLConnections />} />
            <Route path="/connections/filesources" element={<FileSourcesConnections />} />
            <Route path="/connections/apiendpoints" element={<ApiEndpointsConnections />} />
            <Route path="/configure-apiendpoint" element={<ApiEndpointConfiguration />} />
            <Route path="/configure-filesources" element={<FileSourcesConfig />} />
            <Route path="/test-filesource" element={<TestFileSource />} />
            <Route path="/test-apiconnection" element={<TestApiConnection />} />
            <Route path="/configure-mysql" element={<MySQLConfiguration />} />
            <Route path="/test-mysql" element={<TestMySQLConnection />} />
            <Route path="/data-explore" element={<DataExplore />} />
            <Route path="/data-manipulation" element={<DataManipulation />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;