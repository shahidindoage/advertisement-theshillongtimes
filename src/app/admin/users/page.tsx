import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Users as UsersIcon } from "lucide-react";

export default async function AdminUsersPage() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_session");
  
  if (!isAdmin) {
    redirect("/admin/login");
  }

  const users = await prisma.user.findMany({
    orderBy: { email: "asc" },
  });

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-[#249cff] rounded-xl flex items-center justify-center text-white shadow-lg">
          <UsersIcon size={24} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Registered Users</h1>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Email</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">User ID</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6 text-sm font-bold text-slate-900">{user.email}</td>
                <td className="px-8 py-6 text-xs text-slate-500 font-mono">{user.id}</td>
                <td className="px-8 py-6">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {user.role || "USER"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
