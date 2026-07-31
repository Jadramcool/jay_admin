const SYSTEM_ADMIN_ROLE_CODE = 'admin'

export function isSystemAdminRole(role: Pick<System.Role, 'code'>) {
  return role.code.trim().toLocaleLowerCase() === SYSTEM_ADMIN_ROLE_CODE
}
