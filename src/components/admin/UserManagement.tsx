import React from 'react';

interface UserRole {
  role: 'admin' | 'moderator' | 'creator' | 'user';
}

interface UserManagementProps {
  userRole: UserRole;
}

export const UserManagement: React.FC<UserManagementProps> = ({ userRole }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">User Management</h2>
        <p className="text-muted-foreground">
          Manage users, roles, and permissions across the platform
        </p>
      </div>

      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
          <p>User management features are being developed.</p>
        </div>
      </div>
    </div>
  );
};