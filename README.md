# Nexus CRM

Monorepo inicial do CRM multi-tenant/low-code Nexus. Ele contem:

- Backend/: API FastAPI pronta para receber o motor de multi-tenancy e metadados.
- Frontend/: Interface Next.js para visualizar objetos dinamicos e operar o playground SQL.
- docs/visao-mapeamento.md: transcricao completa da conversa estrategica que guia o MVP.

## Como rodar

### Backend (FastAPI)
```powershell
cd Backend
python -m venv .venv
.\\.venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend (Next.js)
```powershell
cd Frontend
npm install
npm run dev
```

## Proximos marcos
1. Provisionamento de schemas + camada JWT vinculada ao tenant_id.
2. Executor SQL seguro (SELECT only) com catalogo meta_objetos.
3. Integracao interface-backend exibindo tabelas e salvando novos visores.
