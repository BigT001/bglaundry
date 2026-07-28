export const ADMIN_PERMISSIONS = [
  { key: 'dashboard.view', label: 'Workspace overview', description: 'View the role-based staff workspace, never the Super Admin dashboard.' },
  { key: 'orders.manage', label: 'Manage orders', description: 'View and update customer orders.' },
  { key: 'invoices.manage', label: 'Manage invoices', description: 'Create, update, download, and share invoices.' },
  { key: 'customers.view', label: 'View customers', description: 'View customer profiles and order history.' },
  { key: 'riders.manage', label: 'Manage riders', description: 'Create, edit, and manage rider accounts.' },
  { key: 'pricing.manage', label: 'Manage pricing', description: 'Create and update services and prices.' },
  { key: 'staff.manage', label: 'Manage staff', description: 'Create staff accounts and assign permissions.' },
] as const;

export type AdminPermission = typeof ADMIN_PERMISSIONS[number]['key'];

export const FULL_ACCESS_ROLES = ['ADMIN', 'SUPER_ADMIN', 'DEVELOPER', 'MANAGER'] as const;
export const STAFF_ROLES = [...FULL_ACCESS_ROLES, 'CASHIER', 'RECEPTION'] as const;

export function hasAdminPermission(
  user: { role?: string; permissions?: string[] } | null | undefined,
  permission: AdminPermission,
) {
  return Boolean(
    user &&
    (FULL_ACCESS_ROLES.includes(user.role as typeof FULL_ACCESS_ROLES[number]) ||
      user.permissions?.includes(permission)),
  );
}

export function isSuperAdmin(user: { role?: string } | null | undefined) {
  return Boolean(user && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN'));
}

export function roleLabel(role?: string) {
  return (role || 'STAFF').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, character => character.toUpperCase());
}
