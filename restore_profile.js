// ==========================================
// RESTAURAR PERFIL DE USUARIO (OFFLINE)
// ==========================================
// Copia y pega esto en la consola (F12) para poder entrar

const dummyProfile = {
    id: "offline-user-id",
    email: "usuario@offline.com",
    full_name: "Usuario Modo Offline",
    tenant_id: "offline-tenant-id",
    tenant: {
        id: "offline-tenant-id",
        name: "Mi Negocio (Offline)",
        slug: "mi-negocio",
        plan_status: "active",
        trial_ends_at: "2030-01-01T00:00:00.000Z" // Suscripción válida por años
    }
};

localStorage.setItem('miga_user_profile', JSON.stringify(dummyProfile));

console.log("✅ Perfil restaurado. Recargando...");
setTimeout(() => location.reload(), 1000);
