export default function AdminAuditoria() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Registro de Auditoría</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow border border-gray-100">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-2 px-4 text-left">Fecha</th>
              <th className="py-2 px-4 text-left">Usuario</th>
              <th className="py-2 px-4 text-left">Acción</th>
              <th className="py-2 px-4 text-left">Detalles</th>
            </tr>
          </thead>
          <tbody>
            {/* Aquí se listarán los logs */}
            <tr>
              <td className="py-2 px-4">--</td>
              <td className="py-2 px-4">--</td>
              <td className="py-2 px-4">--</td>
              <td className="py-2 px-4">--</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
} 