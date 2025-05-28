import React from 'react';

const Tag = ({ name, color, onClick, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${className}`}
      style={{ backgroundColor: `${color}20`, color: color }}
      onClick={onClick}
    >
      {name}
    </span>
  );
};

export default Tag; 