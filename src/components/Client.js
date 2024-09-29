// src/components/Client.js

import React from 'react';

const Client = ({ username }) => {
  return (
    <div className="flex items-center mb-4">
      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
        <span className="text-xl font-bold uppercase">
          {username.charAt(0)}
        </span>
      </div>
      <span className="ml-3 text-white">{username}</span>
    </div>
  );
};

export default Client;









