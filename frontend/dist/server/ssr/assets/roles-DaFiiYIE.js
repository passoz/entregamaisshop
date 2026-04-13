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
function getHomePathForRole(role) {
	switch (role) {
		case "admin": return "/admin";
		case "seller": return "/vendedor/dashboard";
		case "driver": return "/entregador/dashboard";
		case "customer": return "/";
	}
}
//#endregion
export { getRequiredRoleForPortal as n, normalizeRoles as r, getHomePathForRole as t };
