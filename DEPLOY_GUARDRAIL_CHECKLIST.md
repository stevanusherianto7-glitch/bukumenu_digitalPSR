# Deploy Guardrail Checklist

Jalankan checklist ini sebelum `git push` untuk mencegah deploy gagal:

- [ ] Jalankan `npm run guardrail:deploy` dari root repo.
- [ ] Pastikan langkah **dependency resolution** lulus (tidak ada `ERESOLVE` peer conflict).
- [ ] Pastikan langkah **API routing contract** lulus (rewrite `/api` + mount route backend konsisten).
- [ ] (Opsional) aktifkan **live smoke test**:
  - Windows PowerShell: `$env:GUARDRAIL_API_URL="https://your-domain.vercel.app/api"; npm run guardrail:deploy`
  - Bash: `GUARDRAIL_API_URL="https://your-domain.vercel.app/api" npm run guardrail:deploy`
- [ ] Jika gagal, perbaiki dulu dependency/backend route sebelum push lagi.

## Command

```bash
npm run guardrail:deploy
```
