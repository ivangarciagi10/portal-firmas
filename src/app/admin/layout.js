import AdminLayout from "./AdminLayout";
import { Providers } from "../providers";

export const metadata = {
  title: "Panel de Administración | Portal Firmas GI",
};

export default function AdminRootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-gray-100 antialiased">
        <Providers>
          <AdminLayout>{children}</AdminLayout>
        </Providers>
      </body>
    </html>
  );
} 