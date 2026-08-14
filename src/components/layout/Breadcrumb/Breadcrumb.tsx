import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import './Breadcrumb.css';
import { ROUTES_CONFIG } from '../../../config/routes.config';

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const getBreadcrumbLabel = (path: string): string => {
    const fullPath = `/${pathnames.slice(0, pathnames.indexOf(path) + 1).join('/')}`;
    const matchedRoute = Object.values(ROUTES_CONFIG).find((r) => r.path === fullPath);
    if (matchedRoute) return matchedRoute.breadcrumbLabel;
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <nav className="breadcrumb-nav" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        <li className="breadcrumb-item">
          <Link to="/dashboard/overview" className="breadcrumb-link home-icon">
            <Home size={14} />
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const label = getBreadcrumbLabel(value);

          return (
            <li key={to} className="breadcrumb-item">
              <ChevronRight size={14} className="breadcrumb-separator" />
              {isLast ? (
                <span className="breadcrumb-current">{label}</span>
              ) : (
                <Link to={to} className="breadcrumb-link">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
