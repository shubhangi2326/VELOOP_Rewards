import React from 'react';

const ThemedLoader = ({ fullScreen }) => (
  <div className={fullScreen ? 'themed-loader-fullscreen' : 'themed-loader'}>
    <div className="themed-loader-spinner" />
  </div>
);

export default ThemedLoader;
