# NodeBB Integration Guide for Stand-Up Comedy Community

This document summarises how to deploy NodeBB alongside the existing web application, enable the custom user-role plugin, and configure categories, permissions, and supporting features.

## 1. Prerequisites

- **Node.js** v18 LTS (recommended by NodeBB 3.x)
- **MongoDB** 5.x or later (Redis/PostgreSQL also work; adjust config as needed)
- Build tools: `git`, `python3`, `make`, and a C/C++ toolchain
- Optional: `pm2` or `forever` for process management, and `nginx` for TLS termination

## 2. Install NodeBB

```bash
# Fetch NodeBB
git clone https://github.com/NodeBB/NodeBB.git ~/standup-forum
cd ~/standup-forum

# Install dependencies (MongoDB example)
npm install

# Run initial setup (creates config.json)
./nodebb setup
```

During setup, answer the prompts using your MongoDB connection string. Example `config.json` snippet for a local instance:

```json
{
  "url": "https://comedy.example.com",
  "secret": "<generated-secret>",
  "database": "mongo",
  "mongo": {
    "host": "127.0.0.1",
    "port": 27017,
    "username": "nodebb",
    "password": "<password>",
    "database": "standup_forum"
  }
}
```

Start NodeBB in dev mode to verify the forum works:

```bash
./nodebb dev
```

## 3. Install the Custom Role Plugin

1. Copy the `nodebb-plugin-user-role` directory from this repository into `~/standup-forum/node_modules/`.
2. Add the plugin to NodeBB's `package.json` dependencies or run `npm install /path/to/nodebb-plugin-user-role`.
3. From the NodeBB root, rebuild assets:
   ```bash
   ./nodebb build
   ./nodebb restart
   ```
4. In the ACP, enable **StandUp Comedy Role Manager**.

Upon activation, the plugin creates/updates three groups and augments the registration form with an **Account Type** selector.

## 4. Configure Categories & Permissions

1. Log into the ACP as an administrator.
2. Navigate to **Manage → Categories** and create the following (or import the JSON below using your preferred automation):
   - 🎟️ **Gig Listings** — restrict topic creation to `standup-promoters` and `standup-venues`.
   - 💬 **General Discussion** — open to all registered members.
   - 📣 **Promotions & Events** — open to all registered members.
3. In **Privileges** for **Gig Listings**:
   - Allow *Find, Read, Reply* for `registered-users`, `standup-comedians`, `standup-promoters`, `standup-venues`.
   - Allow *Create Topics* only for `standup-promoters` and `standup-venues`.
   - Grant moderators/administrators full rights.
4. Set a **Topic Template** for Gig Listings (Admin → Categories → Edit → Settings):
   ```markdown
   **Date:**
   **Location:**
   **Pay/Compensation:**
   **Description:**
   **How to Apply:**
   ```

For automation, you can consume `nodebb-config/categories.json` together with the NodeBB Write API. Example script:

```bash
NODEBB_BASE_URL="https://comedy.example.com" \
NODEBB_WRITE_TOKEN="<token with categories privilege>" \
node scripts/nodebb/apply-category-config.mjs nodebb-config/categories.json
```

(Implement the `apply-category-config.mjs` script by posting to `/api/v3/categories` and `/api/v3/categories/{cid}/privileges`. Token scopes: `categories:write`, `privileges:write`.)

## 5. Calendar / Events Integration

- Install `nodebb-plugin-calendar` from the ACP and enable it.
- In the calendar plugin settings, link the **Gig Listings** category to the calendar and map the topic template fields (date, location).
- Optionally, enable `.ics` feeds so comedians can subscribe to gig updates.

## 6. Notifications & Messaging

- Ensure the core plugins **Mentions**, **Notifications**, and **Chat** are active (ACP → Extend → Plugins).
- In **Settings → User → Chat**, allow registered users to start chats.
- Configure an email transport (ACP → Settings → Email) so offline mentions trigger email alerts. For example, using SMTP:
  ```json
  {
    "service": "SendGrid",
    "username": "apikey",
    "password": "<sendgrid-token>",
    "from": "no-reply@comedy.example.com"
  }
  ```

## 7. Branding & Theme Tweaks

- Upload a custom logo via ACP → Appearance → Customise.
- Enable **Persona** or another modern theme, then add the CSS from `nodebb-plugin-user-role/static/style/role-badges.less` to the *Custom CSS* panel for quick overrides.
- For deeper theming, clone Persona and adjust colours/assets to match your comedy branding.

## 8. Testing User Flows

1. Register three accounts (one per role) and confirm the correct badge appears on profiles and posts.
2. With a comedian account, attempt to create a topic in **Gig Listings** — the UI should hide the button and the API should return `403`.
3. As a promoter, post a gig using the template and verify that replies from comedians are permitted.
4. Mention another user (`@username`) and confirm notifications/emails arrive.
5. Start a direct chat between a comedian and promoter.
6. Check the calendar view to confirm gig posts surface with the configured date.

## 9. Deployment Notes

- Use `./nodebb stop` / `./nodebb start` or `pm2 start ./nodebb -- start` for process management.
- Place NodeBB behind `nginx` with HTTPS enabled (Let's Encrypt via `certbot`).
- Back up MongoDB regularly (`mongodump --db standup_forum`).
- Document admin credentials and share these instructions with the hosting provider.

## 10. Troubleshooting

- If the registration dropdown is missing, rebuild assets (`./nodebb build`) and clear the browser cache. The plugin also injects the field client-side as a fallback.
- Use the ACP log viewer (**Advanced → Logs**) to review plugin messages (`[standup-role] ...`).
- Run `./nodebb plugins` to verify the plugin is active.

