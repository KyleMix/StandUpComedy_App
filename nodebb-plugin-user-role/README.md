# StandUp Comedy Role Manager (NodeBB Plugin)

This plugin adds comedian, promoter, and venue profile types to a NodeBB forum and automatically assigns new registrants to the correct role group.

## Features

- Adds an "Account Type" dropdown to the registration form (with a client-side fallback if the template is customised).
- Persists each user's role as a user field (`standup:role`) and joins them to a dedicated group.
- Ensures the role group exposes a colourful badge and title that appears on posts and profile pages.
- Injects role details into the user JSON payload so themes and other plugins can consume them.
- Provides lightweight CSS utilities to highlight posts by promoters and venues within gig listings.

## Installation

1. Copy this plugin folder into your NodeBB `node_modules` directory or publish it to npm under `nodebb-plugin-user-role`.
2. Add the plugin to the `package.json` for your NodeBB installation and run `npm install` (or `./nodebb setup` for a fresh install).
3. Activate the plugin from the **Admin Control Panel → Extend → Plugins** section and reboot NodeBB.

The plugin automatically creates three groups if they do not already exist:

| Role Key | Group Name           | Badge Text |
|----------|---------------------|------------|
| comedian | `standup-comedians` | Comedian   |
| promoter | `standup-promoters` | Promoter   |
| venue    | `standup-venues`    | Venue      |

## Configuration

- Visit **Admin → Manage → Groups** to customise the badge colours or icons created by the plugin.
- To change the order of role options, adjust the `ROLE_CONFIG` constant in `library.js`.
- If you want role selection to be optional, edit `plugin.validateRoleSelection` in `library.js` to remove the validation error.

## Theming Notes

The plugin outputs a `.standup-role-badge` element inside post author cards. You can override the default styling by adding custom CSS to your active NodeBB theme or by editing `static/style/role-badges.less` inside this plugin and rebuilding NodeBB assets.

## Development

- Run `./nodebb dev` to start NodeBB in development mode.
- Use `./nodebb build` after enabling the plugin to rebuild the client bundle and apply CSS changes.

## License

MIT
