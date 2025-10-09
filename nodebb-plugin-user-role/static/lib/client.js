'use strict';

/* globals $, app, ajaxify */

define('forum/standup-role', ['hooks'], (hooks) => {
  const ROLE_OPTIONS = [
    { value: 'comedian', text: 'Comedian' },
    { value: 'promoter', text: 'Promoter' },
    { value: 'venue', text: 'Venue' },
  ];

  const RoleUI = {};

  RoleUI.init = function init() {
    hooks.on('action:ajaxify.end', onAjaxifyEnd);
    hooks.on('action:posts.loaded', RoleUI.decorateRoleBadges);
    hooks.on('action:chat.loaded', RoleUI.decorateRoleBadges);
    RoleUI.decorateRoleBadges();
  };

  function onAjaxifyEnd(data) {
    if (data && data.url && data.url.indexOf('register') === 0) {
      RoleUI.ensureRegistrationField();
    }
    RoleUI.decorateRoleBadges();
  }

  RoleUI.ensureRegistrationField = function ensureRegistrationField() {
    const form = document.querySelector('#register-form, form[action="/register"]');
    if (!form) {
      return;
    }

    let field = form.querySelector('[name="standup-role"]');
    if (!field) {
      field = document.createElement('select');
      field.name = 'standup-role';
      field.required = true;
      field.classList.add('form-control');

      const wrapper = document.createElement('div');
      wrapper.classList.add('form-group');

      const label = document.createElement('label');
      label.setAttribute('for', 'standup-role');
      label.textContent = 'Account Type';

      const help = document.createElement('small');
      help.classList.add('form-text', 'text-muted');
      help.textContent = 'Choose the option that best fits how you participate.';

      wrapper.appendChild(label);
      wrapper.appendChild(field);
      wrapper.appendChild(help);
      const submitRow = form.querySelector('.form-group:last-of-type, button[type="submit"]');
      if (submitRow && submitRow.parentNode) {
        submitRow.parentNode.insertBefore(wrapper, submitRow);
      } else {
        form.appendChild(wrapper);
      }
    }

    if (!field.querySelector('option[value=""]')) {
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = 'Select your role';
      placeholder.disabled = true;
      placeholder.selected = true;
      field.appendChild(placeholder);
    }

    ROLE_OPTIONS.forEach((option) => {
      if (!field.querySelector(`option[value="${option.value}"]`)) {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.textContent = option.text;
        field.appendChild(opt);
      }
    });
  };

  RoleUI.decorateRoleBadges = function decorateRoleBadges() {
    document.querySelectorAll('.standup-role-badge').forEach((badge) => {
      if (!badge.querySelector('.standup-role-text')) {
        return;
      }
      badge.setAttribute('role', 'text');
    });

    $('[component="post"]').each((_, postEl) => {
      const $post = $(postEl);
      const badge = $post.find('.standup-role-badge');
      if (!badge.length) {
        return;
      }
      const roleMatch = /standup-role-(\w+)/.exec(badge.attr('class'));
      if (roleMatch) {
        $post.attr('data-standup-role', roleMatch[1]);
      }
    });
  };

  RoleUI.init();

  return RoleUI;
});
