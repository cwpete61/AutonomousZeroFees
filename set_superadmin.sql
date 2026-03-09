
INSERT INTO core."User" (id, email, username, "fullName", "passwordHash", role, status, "createdAt", "updatedAt")
VALUES (
    'u1',
    'owner@agency.com',
    'superadmin',
    'Super Admin',
    '$2b$10$hlb.Cape25Ro6qICamqENuZl/Bf27S/SKbmjItYFa81PY2xXcl9u6',
    'SUPER_ADMIN',
    'ACTIVE',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET 
    email=EXCLUDED.email, 
    username=EXCLUDED.username, 
    "fullName"=EXCLUDED."fullName", 
    "passwordHash"=EXCLUDED."passwordHash", 
    role=EXCLUDED.role;
