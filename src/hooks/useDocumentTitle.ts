import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getRouteMetadata } from '../config/routes.config';
import { ENV } from '../constants/env.constants';

export const useDocumentTitle = (): void => {
  const location = useLocation();

  useEffect(() => {
    const routeMeta = getRouteMetadata(location.pathname);
    const title = routeMeta ? `${routeMeta.title} | ${ENV.APP_NAME}` : ENV.APP_NAME;
    document.title = title;
  }, [location.pathname]);
};
