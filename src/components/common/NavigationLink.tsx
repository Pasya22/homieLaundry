// src/components/common/NavigationLink.tsx
import React from 'react';
import { Link, type LinkProps } from 'react-router-dom';

interface NavigationLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
}

const NavigationLink: React.FC<NavigationLinkProps> = ({ children, className = '', ...props }) => {
  return (
    <Link
      {...props}
      className={`transition duration-200 hover:opacity-80 ${className}`}
    >
      {children}
    </Link>
  );
};

export default NavigationLink;