/**
 * WorkIn&Out — Authentication
 * window.Auth
 *
 * All data stored in localStorage (client-side demo).
 * Passwords are "hashed" with a simple deterministic
 * function — NOT suitable for production.
 */
(function () {
  'use strict';

  const KEYS = {
    USERS:   'workinout_users',
    SESSION: 'workinout_session',
  };

  /* ── Naïve hash (demo only) ──────────────── */
  function _simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return 'h' + Math.abs(hash).toString(16).padStart(8, '0');
  }

  /* ── Storage helpers ─────────────────────── */
  function _getUsers()       { return Utils.getFromStorage(KEYS.USERS) || {};        }
  function _saveUsers(users) { Utils.saveToStorage(KEYS.USERS, users);               }
  function _getSession()     { return Utils.getFromStorage(KEYS.SESSION);            }
  function _saveSession(s)   { Utils.saveToStorage(KEYS.SESSION, s);                 }
  function _clearSession()   { Utils.removeFromStorage(KEYS.SESSION);                }

  /* ── Validation ──────────────────────────── */
  function _validate(userData, isRegister = true) {
    const errors = [];
    if (!userData.name  || userData.name.trim().length < 2)
      errors.push('Name must be at least 2 characters.');
    if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email))
      errors.push('A valid email is required.');
    if (isRegister) {
      if (!userData.password || userData.password.length < 6)
        errors.push('Password must be at least 6 characters.');
      if (!userData.age || isNaN(userData.age) || userData.age < 10 || userData.age > 120)
        errors.push('Age must be between 10 and 120.');
      if (!userData.gender || !['male', 'female', 'other'].includes(userData.gender))
        errors.push('Please select a gender.');
      if (!userData.height || isNaN(userData.height) || userData.height < 50)
        errors.push('Please enter a valid height (cm).');
      if (!userData.weight || isNaN(userData.weight) || userData.weight < 10)
        errors.push('Please enter a valid weight (kg).');
    }
    return errors;
  }

  /* ── Register ────────────────────────────── */
  function register(userData) {
    const errors = _validate(userData, true);
    if (errors.length) return { success: false, errors };

    const users = _getUsers();
    const emailKey = userData.email.toLowerCase().trim();

    if (users[emailKey]) {
      return { success: false, errors: ['An account with this email already exists.'] };
    }

    const user = {
      id:        Utils.generateId(),
      name:      userData.name.trim(),
      email:     emailKey,
      password:  _simpleHash(userData.password),
      age:       Number(userData.age),
      gender:    userData.gender,
      height:    Number(userData.height),
      weight:    Number(userData.weight),
      bodyType:  userData.bodyType || 'mesomorph',
      goals:     userData.goals   || ['general_fitness'],
      activityLevel: userData.activityLevel || 'moderate',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users[emailKey] = user;
    _saveUsers(users);

    // Auto-login
    const session = { userId: user.id, email: emailKey, loginAt: new Date().toISOString() };
    _saveSession(session);

    return { success: true, user: _sanitise(user) };
  }

  /* ── Login ───────────────────────────────── */
  function login(email, password) {
    if (!email || !password) {
      return { success: false, errors: ['Email and password are required.'] };
    }

    const emailKey = email.toLowerCase().trim();
    const users    = _getUsers();
    const user     = users[emailKey];

    if (!user) {
      return { success: false, errors: ['No account found with this email.'] };
    }

    if (user.password !== _simpleHash(password)) {
      return { success: false, errors: ['Incorrect password.'] };
    }

    const session = { userId: user.id, email: emailKey, loginAt: new Date().toISOString() };
    _saveSession(session);

    return { success: true, user: _sanitise(user) };
  }

  /* ── Logout ──────────────────────────────── */
  function logout() {
    _clearSession();
    window.location.href = 'index.html';
  }

  /* ── Get current user ────────────────────── */
  function getCurrentUser() {
    const session = _getSession();
    if (!session) return null;

    const users = _getUsers();
    const user  = users[session.email];
    return user ? _sanitise(user) : null;
  }

  /* ── Get raw user (with password hash, internal use) ── */
  function _getRawUser(email) {
    return _getUsers()[email.toLowerCase().trim()] || null;
  }

  /* ── Update profile ──────────────────────── */
  function updateProfile(updates) {
    const session = _getSession();
    if (!session) return { success: false, errors: ['Not logged in.'] };

    const users = _getUsers();
    const user  = users[session.email];
    if (!user)  return { success: false, errors: ['User not found.'] };

    // Allowed fields to update
    const allowed = ['name','age','gender','height','weight','bodyType','goals','activityLevel'];
    allowed.forEach(field => {
      if (updates[field] !== undefined) user[field] = updates[field];
    });

    // Password change
    if (updates.newPassword) {
      if (!updates.currentPassword) {
        return { success: false, errors: ['Current password is required to change password.'] };
      }
      if (user.password !== _simpleHash(updates.currentPassword)) {
        return { success: false, errors: ['Current password is incorrect.'] };
      }
      if (updates.newPassword.length < 6) {
        return { success: false, errors: ['New password must be at least 6 characters.'] };
      }
      user.password = _simpleHash(updates.newPassword);
    }

    user.updatedAt = new Date().toISOString();
    users[session.email] = user;
    _saveUsers(users);

    return { success: true, user: _sanitise(user) };
  }

  /* ── isLoggedIn ──────────────────────────── */
  function isLoggedIn() {
    const session = _getSession();
    if (!session) return false;
    const users = _getUsers();
    return Boolean(users[session.email]);
  }

  /* ── requireAuth ─────────────────────────── */
  function requireAuth(redirectTo = 'index.html') {
    if (!isLoggedIn()) {
      window.location.href = redirectTo;
      return false;
    }
    return true;
  }

  /* ── Remove password from returned object ── */
  function _sanitise(user) {
    const { password, ...safe } = user; // eslint-disable-line no-unused-vars
    return safe;
  }

  /* ── Export ──────────────────────────────── */
  window.Auth = {
    register,
    login,
    logout,
    getCurrentUser,
    updateProfile,
    isLoggedIn,
    requireAuth,
  };
})();
