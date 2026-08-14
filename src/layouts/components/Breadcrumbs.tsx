import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex items-center space-x-2 text-xs font-mono-meta text-[var(--muted-foreground)]">
      <Link
        to="/dashboard"
        className="flex items-center hover:text-[var(--gold)] transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const formattedName = name.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

        return (
          <React.Fragment key={name}>
            <ChevronRight className="h-3 w-3 text-[var(--gold)]" />
            {isLast ? (
              <span className="font-semibold text-[var(--foreground)] tracking-wider">
                {formattedName}
              </span>
            ) : (
              <Link
                to={routeTo}
                className="hover:text-[var(--gold)] transition-colors capitalize tracking-wider"
              >
                {formattedName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
