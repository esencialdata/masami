import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, X, AlertTriangle, CheckCircle, FileSpreadsheet } from 'lucide-react';
import { api, supabase } from '../../services/api';

/**
 * Basic CSV Importer for Clients
 * Expected Format: Name, Phone (optional), Address (optional), Zone (optional)
 */
const ImportClientsModal = ({ isOpen, onClose, onImportComplete }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [successCount, setSuccessCount] = useState(0);

    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseFile(selectedFile);
        }
    };

    const parseFile = (file) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            encoding: "UTF-8",
            complete: (results) => {
                // Basic Validation: Check if 'Nombre' column exists (case insensitive)
                const firstRow = results.data[0];
                const normalizedKeys = Object.keys(firstRow).map(k => k.trim().toLowerCase());

                if (!normalizedKeys.includes('nombre') && !normalizedKeys.includes('name')) {
                    setError("El archivo debe tener una columna llamada 'Nombre' o 'Name'.");
                    setPreview([]);
                    return;
                }

                setError(null);
                setPreview(results.data.slice(0, 5)); // Show first 5 rows
            },
            error: (err) => {
                setError("Error al leer el archivo CSV: " + err.message);
            }
        });
    };

    const normalizeKey = (obj, keyName) => {
        // Helper to find value regardless of case
        const key = Object.keys(obj).find(k => k.toLowerCase().includes(keyName));
        return key ? obj[key] : '';
    };

    const processImport = async () => {
        setUploading(true);
        setProgress(0);
        setSuccessCount(0);
        setError(null);

        // 0. Fetch Tenant ID manually
        let myTenantId = null;
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
                myTenantId = profile?.tenant_id;
            }
        } catch (e) {
            console.error("Error fetching tenant", e);
        }

        if (!myTenantId) {
            setError("Error Crítico: No se pudo identificar tu Negocio. Recarga la página.");
            setUploading(false);
            return;
        }

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const total = results.data.length;
                let processed = 0;
                let succeeded = 0;
                let lastError = null;
                const batchSize = 10;

                const clientsToInsert = [];

                // 1. Prepare Data
                for (const row of results.data) {
                    const name = normalizeKey(row, 'nombre') || normalizeKey(row, 'name');
                    if (!name) continue;

                    clientsToInsert.push({
                        name: name.trim(),
                        phone: normalizeKey(row, 'telefono') || normalizeKey(row, 'celular') || normalizeKey(row, 'phone') || '',
                        // address: NOT IN DB SCHEMA (removed to fix error)
                        zone: normalizeKey(row, 'zona') || normalizeKey(row, 'zone') || 'Sin Zona',
                        notes: (normalizeKey(row, 'direccion') || normalizeKey(row, 'address') || '') + ' - Importado', // Backup address into notes
                        tenant_id: myTenantId
                    });
                }

                if (clientsToInsert.length === 0) {
                    setError("No se encontraron clientes válidos en el archivo. Verifica las columnas.");
                    setUploading(false);
                    return;
                }

                // 2. Insert in Batches
                for (let i = 0; i < clientsToInsert.length; i += batchSize) {
                    const batch = clientsToInsert.slice(i, i + batchSize);

                    try {
                        const { error } = await supabase.from('customers').insert(batch);
                        if (!error) {
                            succeeded += batch.length;
                        } else {
                            console.error("Batch error", error);
                            lastError = error.message || JSON.stringify(error);
                        }
                    } catch (e) {
                        console.error("Network error", e);
                        lastError = e.message;
                    }

                    processed += batch.length;
                    setProgress(Math.round((processed / total) * 100));
                }

                setUploading(false);

                if (succeeded === 0 && lastError) {
                    setError("Falló la importación: " + lastError);
                } else if (succeeded > 0) {
                    // Si hubo algunos errores pero otros pasaron
                    setSuccessCount(succeeded);
                    if (lastError) {
                        alert(`Se importaron ${succeeded} clientes, pero hubo errores en algunos grupos: ${lastError}`);
                    }

                    setTimeout(() => {
                        onImportComplete();
                        onClose();
                    }, 2500);
                } else {
                    setError("No se importó ningún cliente. Error desconocido.");
                }
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-brand-cream/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <FileSpreadsheet size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Importar Clientes</h2>
                    </div>
                    {!uploading && (
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto">

                    {!file && !uploading ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-brand-gold hover:bg-yellow-50/20 transition-all cursor-pointer group"
                        >
                            <Upload className="mx-auto text-gray-400 group-hover:text-brand-gold mb-3 transition-colors" size={40} />
                            <p className="font-bold text-gray-700">Haz clic para subir tu CSV</p>
                            <p className="text-sm text-gray-500 mt-1">Formato: Nombre, Telefono, Direccion, Zona</p>
                            <input
                                type="file"
                                accept=".csv"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {uploading ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <h3 className="text-lg font-bold text-gray-900">Importando...</h3>
                                    <p className="text-gray-500">{progress}% Completado</p>
                                    <div className="w-full bg-gray-100 rounded-full h-2 mt-4 overflow-hidden">
                                        <div className="bg-brand-gold h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                            ) : successCount > 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4">
                                        <CheckCircle size={40} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">¡Importación Exitosa!</h3>
                                    <p className="text-gray-500">Se han importado {successCount} clientes correctamente.</p>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm font-bold text-gray-500 uppercase">Archivo Seleccionado:</span>
                                        <button onClick={() => setFile(null)} className="text-xs text-red-500 hover:underline">Cambiar archivo</button>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3 mb-4 border border-gray-200">
                                        <FileSpreadsheet className="text-green-600" />
                                        <span className="font-medium text-gray-700 truncate">{file.name}</span>
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2 mb-4">
                                            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                                            {error}
                                        </div>
                                    )}

                                    {preview.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="text-sm font-bold text-gray-900 mb-2">Vista Previa (5 primeros)</h4>
                                            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                                <table className="w-full text-left text-xs">
                                                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase">
                                                        <tr>
                                                            <th className="p-2 border-b">Nombre</th>
                                                            <th className="p-2 border-b">Teléfono</th>
                                                            <th className="p-2 border-b">Zona</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {preview.map((row, idx) => (
                                                            <tr key={idx}>
                                                                <td className="p-2">{normalizeKey(row, 'nombre') || normalizeKey(row, 'name') || '-'}</td>
                                                                <td className="p-2 text-gray-500">{normalizeKey(row, 'telefono') || normalizeKey(row, 'phone') || '-'}</td>
                                                                <td className="p-2 text-gray-500">{normalizeKey(row, 'zona') || normalizeKey(row, 'zone') || '-'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {file && !uploading && successCount === 0 && (
                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={processImport}
                            disabled={!!error}
                            className={`px-6 py-2 rounded-xl font-bold text-brand-coffee shadow-lg transition-all
                                ${error
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-brand-gold hover:bg-yellow-500 active:scale-95'
                                }`}
                        >
                            Importar Clientes
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImportClientsModal;
