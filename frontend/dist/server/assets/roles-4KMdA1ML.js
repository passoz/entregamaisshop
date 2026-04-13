//#region src/lib/auth/roles.ts
var ROLE_ALIASES = {
	admin: "admin",
	customer: "customer",
	seller: "seller",
	vendedor: "seller",
	driver: "driver",
	entregador: "driver"
};
var PORTAL_TO_CANONICAL_ROLE = {
	admin: "admin",
	customer: "customer",
	vendedor: "seller",
	entregador: "driver"
};
function normalizeRole(role) {
	if (!role) return null;
	return ROLE_ALIASES[role.toLowerCase()] ?? null;
}
function normalizeRoles(roles = []) {
	return Array.from(new Set(roles.map((role) => normalizeRole(role)).filter((role) => role !== null)));
}
function getRequiredRoleForPortal(role) {
	if (!role) return null;
	return PORTAL_TO_CANONICAL_ROLE[role] ?? normalizeRole(role);
}
function userCanAccessPortal(userRoles = [], portalRole) {
	const requiredRole = getRequiredRoleForPortal(portalRole);
	if (!requiredRole) return false;
	return normalizeRoles(userRoles).includes(requiredRole);
}
//#endregion
export { normalizeRoles as n, userCanAccessPortal as r, getRequiredRoleForPortal as t };
