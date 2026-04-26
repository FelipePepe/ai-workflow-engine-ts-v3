# AI Workflow Engine TS V3 — JSON Edition

V3 del starter kit, manteniendo JSON como formato principal.

Inspirado en prácticas modernas de herramientas agentic coding:

- Plan Mode antes de implementar
- varios agentes paralelos en workspaces aislados
- búsqueda por glob/grep antes que RAG obligatorio
- review patterns automatizables
- permisos y sandbox
- gates de seguridad y calidad
- JSON config editable por humanos

## Instalación

```bash
npm install
cp .env.example .env
npm run dev
```

## Configuración

```txt
config/project.json
config/ai.config.json
config/permissions.json
config/review-patterns.json
```

## Endpoints

```txt
POST /discovery/analyze
POST /plan/create
POST /tasks/run
GET  /memory
GET  /metrics
GET  /config
WS   /ws/runs/:runId
```

## Ejecutar una tarea

```bash
curl -X POST http://127.0.0.1:3000/tasks/run \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Crear login",
    "description": "Crear endpoint de login con usuario y password",
    "constraints": ["Debe incluir tests", "No exponer secretos"],
    "priority": "medium"
  }'
```

## Crear solo el plan

```bash
curl -X POST http://127.0.0.1:3000/plan/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Crear login",
    "description": "Crear endpoint de login con usuario y password",
    "constraints": ["Debe incluir tests"],
    "priority": "medium"
  }'
```

## Filosofía V3

```txt
Discovery → Plan Mode → Workspaces paralelos → Implementación → QA → Security → Review → Memory → Improve
```

La IA no toca `main`, producción, secretos ni despliegues críticos sin revisión humana.
