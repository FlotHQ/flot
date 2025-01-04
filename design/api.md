### API

#### Templates

```
GET /templates
PATCH /templates/:id
POST /templates
DELETE /templates/:id
```

#### Workflows

```
GET /workflows
    Query:
        tag: string
        query: string
POST /workflows
DELETE /workflows/:id
PUT /workflows/:id
PATCH /workflows/:id/manifest application/json-patch+json
```

#### Workflow Executions

```
GET /workflows/:id/executions
GET /workflows/:id/executions/:executionId
```

#### Templates

```
GET /templates
    Query:
        type: string eg. "web" or "email, web"
        category: string eg. "web" or "email, web"
        query: string
GET /templates/:id
```
