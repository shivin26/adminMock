import React from 'react';
import { UserDetailsCRMModal, type UserDetailsCRMModalProps } from '../users/UserDetailsCRMModal';

export const UserProfileDetailsModal: React.FC<UserDetailsCRMModalProps> = (props) => {
  return <UserDetailsCRMModal {...props} />;
};
