import React, { useState, useEffect } from 'react';
import { api, supabase } from '../../services/api';
import { Save, Copy, UserPlus, Trash2, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Settings = () => {
    const { profile, tenant } = useAuth();
    const [activeConfig, setActiveConfig] = useState({ monthly_fixed_costs: 0 });
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (profile?.role === 'owner') {
                try {
                    const configData = await api.config.get();
                    if (configData) setActiveConfig(configData);

                    // Fetch Team
                    const { data: teamData } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('tenant_id', tenant?.id);
                    setTeam(teamData || []);
                } catch (e) {
                    console.error('Error loading settings', e);
                }
            }
            setLoading(false);
        };
        fetchData();
    }, [profile, tenant]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.config.update(activeConfig);
            alert('Configuración guardada');
        } catch (e) {
            console.error(e);
            alert('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const copyInviteLink = (role) => {
        // Simple invite link with query params
        const url = `${window.location.origin}/?invite=${tenant.id}&role=${role}`;
        navigator.clipboard.writeText(url);
        alert(`Link copiado para rol: ${role}`);
    };

    if (loading) return <div className="p-8 text-center">Cargando...</div>;

    if (profile?.role !== 'owner') {
        return <div className="p-8 text-center text-gray-500">No tienes permisos para ver esta sección.</div>;
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Financial Config */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined">payments</span>
                    Configuración Financiera
                </h2>
                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Costos Fijos Mensuales</label>
                        <div className="relative">
                            <span className="absolute left-4 top-3 text-gray-400 font-bold">$</span>
                            <input
                                type="number"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-8 pr-4 focus:ring-2 focus:ring-primary/20 outline-none font-bold text-lg"
                                value={activeConfig.monthly_fixed_costs}
                                onChange={(e) => setActiveConfig({ ...activeConfig, monthly_fixed_costs: Number(e.target.value) })}
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            Incluye Renta, Luz, Gas, Sueldos fijos. Esto se usa para calcular tu meta diaria (costo / 30).
                        </p>
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-yellow-600 transition-colors flex justify-center items-center"
                    >
                        <Save size={20} className="mr-2" />
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </form>
            </div>

            {/* Team Management */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Users size={24} />
                    Gestión de Equipo
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="p-4 border border-gray-100 rounded-xl bg-gray-50">
                        <h3 className="font-bold text-gray-700 mb-2">Invitar Panadero</h3>
                        <p className="text-xs text-gray-500 mb-4 transition-colors">Acceso a Producción e Inventario.</p>
                        <button
                            onClick={() => copyInviteLink('baker')}
                            className="w-full flex items-center justify-center gap-2 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-primary hover:text-primary"
                        >
                            <Copy size={16} />
                            Copiar Link
                        </button>
                    </div>
                    <div className="p-4 border border-gray-100 rounded-xl bg-gray-50">
                        <h3 className="font-bold text-gray-700 mb-2">Invitar Vendedor</h3>
                        <p className="text-xs text-gray-500 mb-4">Acceso Solo a Pedidos y Clientes.</p>
                        <button
                            onClick={() => copyInviteLink('sales')}
                            className="w-full flex items-center justify-center gap-2 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-primary hover:text-primary"
                        >
                            <Copy size={16} />
                            Copiar Link
                        </button>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Miembros Activos ({team.length})</h3>
                    <div className="space-y-3">
                        {team.map(member => (
                            <div key={member.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                        {member.full_name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{member.full_name || 'Sin nombre'}</p>
                                        <p className="text-xs text-brand-gold capitalize font-bold">{member.role}</p>
                                    </div>
                                </div>
                                {member.role !== 'owner' && (
                                    <button className="text-red-400 hover:text-red-600 p-2">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
