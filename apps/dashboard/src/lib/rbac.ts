export const RBAC = {
  "roles": {
    "super_admin": {
      "id": "super_admin",
      "name": "Super Admin",
      "description": "Single super admin account with complete control",
      "permissions": {
        "account": {
          "can_be_deleted": false,
          "can_be_blocked": false,
          "can_change_username": false,
          "can_edit_own_profile": true,
          "can_edit_own_fields": ["name", "email", "phone", "password"]
        },
        "users": {
          "can_create_admin": true,
          "can_delete_admin": true,
          "can_block_admin": true,
          "can_edit_admin": true,
          "can_edit_admin_fields": ["name", "email", "phone"],
          "can_create_supervisor": true,
          "can_delete_supervisor": true,
          "can_block_supervisor": true,
          "can_edit_supervisor": true,
          "can_edit_supervisor_fields": ["name", "email", "phone"],
          "can_create_standard": true,
          "can_delete_standard": true,
          "can_block_standard": true,
          "can_edit_standard": true,
          "can_edit_standard_fields": ["name", "email", "phone"]
        },
        "data": {
          "can_view_financials": true,
          "can_edit_financials": true,
          "can_view_customer_data": true,
          "can_edit_customer_data": true,
          "can_view_all_users": true
        },
        "app": {
          "has_complete_control": true
        }
      },
      "ui_restrictions": {
        "hide_delete_button": true,
        "disable_username_field": true,
        "is_single_instance": true
      }
    },

    "admin": {
      "id": "admin",
      "name": "Admin",
      "description": "Standard admin accounts (multiple allowed)",
      "permissions": {
        "account": {
          "can_be_deleted": true,
          "can_be_blocked": true,
          "can_change_username": false,
          "can_edit_own_profile": true,
          "can_edit_own_fields": ["name", "email", "phone", "password"]
        },
        "users": {
          "can_create_admin": false,
          "can_delete_admin": false,
          "can_block_admin": false,
          "can_edit_admin": false,
          "can_create_supervisor": true,
          "can_delete_supervisor": true,
          "can_block_supervisor": true,
          "can_edit_supervisor": true,
          "can_edit_supervisor_fields": ["name", "email", "phone"],
          "can_create_standard": true,
          "can_delete_standard": true,
          "can_block_standard": true,
          "can_edit_standard": true,
          "can_edit_standard_fields": ["name", "email", "phone"]
        },
        "data": {
          "can_view_financials": true,
          "can_edit_financials": true,
          "can_view_customer_data": true,
          "can_edit_customer_data": true,
          "can_view_all_users": true
        },
        "app": {
          "has_complete_control": false
        }
      },
      "ui_restrictions": {
        "hide_delete_button": false,
        "disable_username_field": true
      }
    },

    "supervisor": {
      "id": "supervisor",
      "name": "Supervisor",
      "description": "Can view everything, edit limited accounts, read-only financials",
      "permissions": {
        "account": {
          "can_be_deleted": true,
          "can_be_blocked": true,
          "can_change_username": false,
          "can_edit_own_profile": true,
          "can_edit_own_fields": ["name", "email", "phone", "password"]
        },
        "users": {
          "can_create_admin": false,
          "can_delete_admin": false,
          "can_block_admin": false,
          "can_edit_admin": false,
          "can_create_supervisor": false,
          "can_delete_supervisor": false,
          "can_block_supervisor": false,
          "can_edit_supervisor": false,
          "can_create_standard": false,
          "can_delete_standard": false,
          "can_block_standard": true,
          "can_edit_standard": true,
          "can_edit_standard_fields": ["name", "email", "phone"]
        },
        "data": {
          "can_view_financials": true,
          "can_edit_financials": false,
          "can_view_customer_data": true,
          "can_edit_customer_data": true,
          "can_view_all_users": true
        },
        "app": {
          "has_complete_control": false
        }
      },
      "ui_restrictions": {
        "hide_delete_button": false,
        "disable_username_field": true
      }
    },

    "standard_user": {
      "id": "standard_user",
      "name": "Standard User",
      "description": "Standard user with limited access",
      "permissions": {
        "account": {
          "can_be_deleted": true,
          "can_be_blocked": true,
          "can_change_username": false,
          "can_edit_own_profile": true,
          "can_edit_own_fields": ["name", "email", "phone", "password"]
        },
        "users": {
          "can_create_admin": false,
          "can_delete_admin": false,
          "can_block_admin": false,
          "can_edit_admin": false,
          "can_create_supervisor": false,
          "can_delete_supervisor": false,
          "can_block_supervisor": false,
          "can_edit_supervisor": false,
          "can_create_standard": false,
          "can_delete_standard": false,
          "can_block_standard": false,
          "can_edit_standard": false
        },
        "data": {
          "can_view_financials": false,
          "can_edit_financials": false,
          "can_view_customer_data": true,
          "can_edit_customer_data": true,
          "can_view_all_users": false
        },
        "app": {
          "has_complete_control": false
        }
      },
      "ui_restrictions": {
        "hide_delete_button": false,
        "disable_username_field": true
      }
    }
  },

  "universal_rules": {
    "all_users": {
      "can_reset_password_via_email": true,
      "can_update_email": true,
      "can_change_username": false,
      "can_access_customer_data": true
    },
    "super_admin_constraints": {
      "single_instance_only": true,
      "username_locked": "Admin",
      "cannot_be_deleted_by_anyone": true,
      "cannot_be_blocked_by_anyone": true
    }
  }
};
