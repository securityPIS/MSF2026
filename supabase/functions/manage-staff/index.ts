// Edge Function: admin menambah, mengubah, dan menghapus akun petugas/admin.
// Butuh service role key (otomatis tersedia di Edge Function Supabase), jadi tidak bisa dari browser.
// Deploy: supabase functions deploy manage-staff
import { createClient } from 'npm:@supabase/supabase-js@2.45.4'

const ROLES = ['admin', 'officer', 'inactive']
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const reply = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
const fail = (status: number, error: string) => reply(status, { error })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return fail(405, 'Metode tidak didukung')

  const url = Deno.env.get('SUPABASE_URL')!
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // Pastikan pemanggil adalah admin aktif
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
  const { data: who } = await admin.auth.getUser(token)
  if (!who?.user) return fail(401, 'Sesi tidak valid, silakan masuk ulang')
  const { data: me } = await admin.from('profiles').select('role').eq('id', who.user.id).maybeSingle()
  if (me?.role !== 'admin') return fail(403, 'Hanya admin yang boleh mengelola petugas')

  let body: Record<string, string | undefined>
  try {
    body = await req.json()
  } catch {
    return fail(400, 'Data tidak valid')
  }
  const { action, id } = body
  const full_name = body.full_name?.trim()
  const email = body.email?.trim().toLowerCase()
  const password = body.password ?? ''
  const role = body.role
  // Role akses khusus hanya untuk petugas; admin dan nonaktif tidak memakai role_id
  const role_id = role === 'officer' ? body.role_id || null : null

  if (role !== undefined && !ROLES.includes(role)) return fail(400, 'Peran tidak dikenal')
  if (role_id) {
    const { data: r } = await admin.from('roles').select('id').eq('id', role_id).maybeSingle()
    if (!r) return fail(400, 'Role akses tidak ditemukan')
  }
  if (password && password.length < 8) return fail(400, 'Kata sandi minimal 8 karakter')
  if ((action === 'update' || action === 'delete') && id === who.user.id && (action === 'delete' || (role !== undefined && role !== 'admin'))) {
    return fail(400, 'Anda tidak bisa menghapus atau menurunkan peran akun sendiri')
  }

  if (action === 'create') {
    if (!full_name || !email || !password) return fail(400, 'Nama, email, dan kata sandi wajib diisi')
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    })
    if (error) return fail(400, friendly(error.message))
    // Profil dibuat oleh trigger handle_new_user; lengkapi nama dan peran
    const { error: pe } = await admin.from('profiles').update({ full_name, role: role ?? 'officer', role_id }).eq('id', data.user.id)
    if (pe) return fail(500, pe.message)
    return reply(200, { id: data.user.id })
  }

  if (action === 'update') {
    if (!id) return fail(400, 'Akun tidak ditemukan')
    if (!full_name || !email) return fail(400, 'Nama dan email wajib diisi')
    const changes: Record<string, unknown> = { email, user_metadata: { full_name } }
    if (password) changes.password = password
    const { error } = await admin.auth.admin.updateUserById(id, changes)
    if (error) return fail(400, friendly(error.message))
    const patch: Record<string, string | null> = { full_name, email }
    if (role) Object.assign(patch, { role, role_id })
    const { error: pe } = await admin.from('profiles').update(patch).eq('id', id)
    if (pe) return fail(500, pe.message)
    return reply(200, { id })
  }

  if (action === 'delete') {
    if (!id) return fail(400, 'Akun tidak ditemukan')
    // Profil ikut terhapus (on delete cascade); riwayat check-in tetap ada dengan petugas kosong
    const { error } = await admin.auth.admin.deleteUser(id)
    if (error) return fail(400, friendly(error.message))
    return reply(200, { id })
  }

  return fail(400, 'Aksi tidak dikenal')
})

function friendly(msg: string) {
  if (/already (been )?registered|already exists/i.test(msg)) return 'Email sudah dipakai akun lain'
  if (/invalid email/i.test(msg)) return 'Format email tidak valid'
  return msg
}
