export function isSystemAdminRole(role: Pick<System.Role, 'isSystem'>) {
  return role.isSystem === true
}
