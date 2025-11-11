# Nexus CRM Backend

FastAPI service que sustentara o motor multi-tenant/low-code do Nexus CRM.

## Como comecar

1. Crie um ambiente virtual:
   ```powershell
   python -m venv .venv
   .\\.venv\\Scripts\\Activate.ps1
   ```
2. Instale as dependencias:
   ```powershell
   pip install -r requirements.txt
   ```
3. Copie .env.example para .env e ajuste as variaveis.
4. Rode o servidor:
   ```powershell
   uvicorn app.main:app --reload
   ```

## Proximos passos
- Adicionar camada de autenticacao (JWT) e extracao de tenant_id a cada requisicao.
- Implementar camada de metadados (meta_objetos) no schema tenant_admin.
- Criar comandos/migrations que provisionem novos schemas por tenant.
