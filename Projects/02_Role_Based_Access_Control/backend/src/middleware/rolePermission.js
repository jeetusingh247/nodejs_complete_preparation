import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";

/**
 * requireRole: check if user has at least one of required roles by name
 * usage: requireRole("Admin"), or requireRole("Admin","Manager")
 */

export const requireRole = (...roleNames) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const user = await User.findById(userId).populate("roles");
      if (!user) return res.status(404).json({ message: "User not found" });

      const userRoleNames = user.roles.map(r => r.name);
      const ok = roleNames.some(rn => userRoleNames.includes(rn));
      if (!ok) return res.status(403).json({ message: "Forbidden - role required" });

      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * requirePermission: check user roles' permissions include the permissionName
 * usage: requirePermission("create:product")
 */

export const requirePermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const user = await User.findById(userId).populate({ path: "roles", populate: { path: "permissions" } });
      if (!user) return res.status(404).json({ message: "User not found" });

      const perms = new Set();
      user.roles.forEach(r => (r.permissions || []).forEach(p => perms.add(p.name)));
      if (!perms.has(permissionName)) return res.status(403).json({ message: "Forbidden - permission required" });

      next();
    } catch (err) {
      next(err);
    }
  };
};
