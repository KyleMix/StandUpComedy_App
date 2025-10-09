'use strict';

const Groups = require.main.require('./src/groups');
const User = require.main.require('./src/user');
const utils = require.main.require('./src/utils');
const winston = require.main.require('winston');

const plugin = {};

const ROLE_CONFIG = {
  comedian: {
    key: 'comedian',
    groupName: 'standup-comedians',
    label: 'Comedian',
    userTitle: 'Comedian',
    icon: 'fa-microphone-lines',
    badgeColor: '#f97316',
  },
  promoter: {
    key: 'promoter',
    groupName: 'standup-promoters',
    label: 'Promoter',
    userTitle: 'Promoter',
    icon: 'fa-bullhorn',
    badgeColor: '#6366f1',
  },
  venue: {
    key: 'venue',
    groupName: 'standup-venues',
    label: 'Venue',
    userTitle: 'Venue Manager',
    icon: 'fa-building',
    badgeColor: '#22c55e',
  },
};

plugin.init = async function init() {
  await plugin.ensureRoleGroups();
};

plugin.ensureRoleGroups = async function ensureRoleGroups() {
  const roles = Object.values(ROLE_CONFIG);
  for (const role of roles) {
    try {
      /* eslint-disable no-await-in-loop */
      const exists = await Groups.exists(role.groupName);
      if (!exists) {
        await Groups.create({
          name: role.groupName,
          userTitle: role.userTitle,
          hidden: 0,
          private: 0,
          userTitleEnabled: 1,
          disableJoinRequests: 1,
        });
        winston.verbose(`[standup-role] Created group ${role.groupName}`);
      }

      await Groups.update(role.groupName, {
        userTitle: role.userTitle,
        userTitleEnabled: true,
        hidden: false,
        private: false,
        disableJoinRequests: true,
        icon: role.icon,
        labelColor: role.badgeColor,
        textColor: '#ffffff',
      });
    } catch (err) {
      winston.error(`[standup-role] Failed ensuring group ${role.groupName}: ${err.message}`);
    }
  }
};

plugin.addRoleField = async function addRoleField(data) {
  const options = Object.values(ROLE_CONFIG).map((role) => ({
    value: role.key,
    text: role.label,
  }));

  data.fields = data.fields || [];
  data.fields.push({
    label: 'Account Type',
    name: 'standup-role',
    type: 'select',
    required: true,
    options,
    help: 'Choose the profile type that best matches how you participate in the community.',
  });

  return data;
};

plugin.validateRoleSelection = async function validateRoleSelection(data) {
  const roleKey = data.formData['standup-role'];
  if (!ROLE_CONFIG[roleKey]) {
    throw new Error('Please select a valid account type.');
  }

  return data;
};

plugin.onUserCreate = async function onUserCreate(data) {
  const roleKey = data.data && data.data['standup-role'];
  const role = ROLE_CONFIG[roleKey];
  if (!role) {
    return;
  }

  const uid = data.user && data.user.uid;
  if (!uid) {
    return;
  }

  await User.setUserField(uid, 'standup:role', role.key);
  try {
    await Groups.join(role.groupName, uid);
    // Ensure the user's visible title reflects their role group without clobbering manual preferences.
    const currentTitleRaw = await User.getUserField(uid, 'groupTitle');
    let titleGroups = [];
    if (currentTitleRaw) {
      try {
        titleGroups = JSON.parse(currentTitleRaw);
      } catch (parseErr) {
        titleGroups = [];
      }
    }

    if (!Array.isArray(titleGroups)) {
      titleGroups = [];
    }

    if (!titleGroups.includes(role.groupName)) {
      titleGroups.push(role.groupName);
    }

    await User.setUserField(uid, 'groupTitle', JSON.stringify(titleGroups));
  } catch (err) {
    winston.error(`[standup-role] Unable to assign ${role.groupName} to uid ${uid}: ${err.message}`);
  }
};

plugin.exposeRoleField = async function exposeRoleField(hookData) {
  hookData.users = hookData.users || [];
  hookData.users.forEach((user) => {
    const roleKey = plugin.getRoleFromUser(user);
    if (!roleKey) {
      return;
    }

    const role = ROLE_CONFIG[roleKey];
    user.standupRole = role.key;
    user.standupRoleLabel = role.label;
    user.standupRoleIcon = role.icon;
  });

  return hookData;
};

plugin.addProfileField = async function addProfileField(hookData) {
  const roleKey = plugin.getRoleFromUser(hookData.user);
  if (!roleKey) {
    return hookData;
  }

  const role = ROLE_CONFIG[roleKey];
  hookData.fields = hookData.fields || [];
  hookData.fields.push({
    title: 'Account Type',
    value: role.label,
    className: `standup-role-field standup-role-${role.key}`,
    icon: role.icon,
  });

  return hookData;
};

plugin.appendPostBadge = async function appendPostBadge(hookData) {
  const roleKey = plugin.getRoleFromUser(hookData.user);
  if (!roleKey) {
    return hookData;
  }

  const role = ROLE_CONFIG[roleKey];
  const escaped = utils.escapeHTML(role.label);
  hookData.custom_profile_info = hookData.custom_profile_info || [];
  hookData.custom_profile_info.push({
    content: `<span class="standup-role-badge standup-role-${role.key}"><i class="fa ${role.icon}" aria-hidden="true"></i><span class="standup-role-text">${escaped}</span></span>`,
  });

  return hookData;
};

plugin.getRoleFromUser = function getRoleFromUser(user) {
  if (!user) {
    return null;
  }

  return user['standup:role'] || user.standupRole || null;
};

module.exports = plugin;
