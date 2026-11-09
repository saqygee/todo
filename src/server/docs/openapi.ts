import { z } from 'zod';
import type { OpenAPIV3 } from 'openapi-types';
import {
  createTodoSchema, updateTodoSchema, completionSchema, idSchema,
  listQuerySchema, todoSchema, todoResponseSchema, listResponseSchema,
} from '../../shared/schemas/todo.schema.js';
import { TITLE_MAX, DESCRIPTION_MAX } from '../../shared/constants/todo.js';
import type { Todo } from '../../shared/types/todo.js';

/** Convert only the JSON Schema vocabulary used by our shared schemas. Fail on
 * unsupported keywords rather than weakening documentation with a type assertion. */
function convert(source: z.core.JSONSchema.BaseSchema): OpenAPIV3.SchemaObject {
  const allowed = new Set(['type', 'properties', 'required', 'additionalProperties', 'items', 'anyOf', 'allOf', 'oneOf', 'enum', 'nullable', 'format', 'pattern', 'minimum', 'maximum', 'minLength', 'maxLength', 'minItems', 'maxItems', 'minProperties', 'maxProperties', 'description', 'default', 'readOnly', 'title']);
  for (const key of Object.keys(source)) {
    if (!allowed.has(key)) throw new Error(`Unsupported documentation schema keyword: ${key}`);
  }
  const common: OpenAPIV3.NonArraySchemaObject = {};
  for (const key of ['format', 'pattern', 'description', 'title'] as const) {
    if (source[key] !== undefined) common[key] = source[key];
  }
  for (const key of ['minimum', 'maximum', 'minLength', 'maxLength', 'minItems', 'maxItems', 'minProperties', 'maxProperties'] as const) {
    if (source[key] !== undefined) common[key] = source[key];
  }
  if (source.nullable !== undefined) common.nullable = source.nullable;
  if (source.readOnly !== undefined) common.readOnly = source.readOnly;
  if (source.enum) common.enum = source.enum;
  if (source.required) common.required = source.required;
  if ('default' in source) common.default = source.default;
  if (source.properties) {
    common.properties = Object.fromEntries(Object.entries(source.properties).map(([name, value]) => {
      if (typeof value === 'boolean') throw new Error('Unexpected boolean property schema');
      return [name, convert(value)];
    }));
  }
  if (source.additionalProperties !== undefined) {
    common.additionalProperties = typeof source.additionalProperties === 'boolean'
      ? source.additionalProperties : convert(source.additionalProperties);
  }
  for (const key of ['anyOf', 'allOf', 'oneOf'] as const) {
    if (source[key]) common[key] = source[key].map(convert);
  }
  if (source.type === 'array') {
    if (!source.items || typeof source.items === 'boolean' || Array.isArray(source.items)) throw new Error('Expected homogeneous array schema');
    return { ...common, type: 'array', items: convert(source.items) };
  }
  if (source.type !== undefined) {
    if (Array.isArray(source.type) || source.type === 'null') throw new Error('Expected OpenAPI 3.0 schema type');
    common.type = source.type;
  }
  return common;
}

const fromZod = (schema: z.ZodType) => convert(z.toJSONSchema(schema, { io: 'input', target: 'openapi-3.0' }));
const ref = (name: string): OpenAPIV3.ReferenceObject => ({ $ref: `#/components/schemas/${name}` });
function property(schema: OpenAPIV3.SchemaObject, name: string): OpenAPIV3.SchemaObject {
  const value = schema.properties?.[name];
  if (!value || '$ref' in value) throw new Error(`Expected inline documentation property: ${name}`);
  return value;
}

function contentRequest(schema: z.ZodType, update: boolean): OpenAPIV3.SchemaObject {
  const result = fromZod(schema);
  // These limits follow trim() at runtime: raw input length would misdescribe
  // padded valid strings. Retain the shared limits in the field descriptions.
  for (const name of ['title', 'description']) {
    const field = property(result, name);
    delete field.minLength;
    delete field.maxLength;
  }
  property(result, 'title').description = `Title is required on create; if supplied, must contain 1–${TITLE_MAX} characters after trimming. Whitespace-only and null titles are invalid.`;
  property(result, 'description').description = `Optional text, at most ${DESCRIPTION_MAX} characters after trimming. Blank text becomes null. ${update ? 'Omission preserves the value; null clears it.' : 'Omission defaults to null.'}`;
  property(result, 'dueAt').description = 'ISO 8601 with Z or a numeric timezone offset, normalized to UTC. ' + (update
    ? 'Omission preserves the stored value; null clears it. A different instant must be strictly future at the write boundary; the exact stored instant may be retained, including an unchanged overdue date.'
    : 'Omission defaults to null; null means absent. A supplied instant must be strictly future at the write boundary.');
  result.description = 'Only the listed fields are accepted. Length rules apply after trimming; structural schemas do not replace runtime semantic validation.';
  if (update) result.minProperties = 1;
  else {
    property(result, 'description').default = null;
    property(result, 'dueAt').default = null;
  }
  return result;
}

const todo = fromZod(todoSchema);
for (const name of ['id', 'ordinal', 'completed', 'deleted', 'createdAt', 'updatedAt']) property(todo, name).readOnly = true;
property(todo, 'ordinal').description = 'Immutable, unique, never-reused task order value.';
property(todo, 'completed').description = 'Changed only through the completion operation.';
for (const name of ['dueAt', 'createdAt', 'updatedAt']) {
  property(todo, name).description = 'UTC ISO 8601 string ending in Z; historical instants are valid.';
  property(todo, name).pattern = 'Z$';
}
const single = fromZod(todoResponseSchema);
single.properties = { data: ref('Todo') };
const list = fromZod(listResponseSchema);
list.properties = { data: { type: 'array', items: ref('Todo') } };
const query = fromZod(listQuerySchema);
property(query, 'includeCompleted').default = 'false';
property(query, 'includeCompleted').description = 'Literal true includes both states; false or omission excludes completed tasks. Unknown and repeated query parameters are rejected.';

const schemas: Record<string, OpenAPIV3.SchemaObject> = {
  CreateTodo: contentRequest(createTodoSchema, false),
  UpdateTodo: contentRequest(updateTodoSchema, true),
  Completion: fromZod(completionSchema),
  TodoId: fromZod(idSchema),
  ListQuery: query,
  Todo: todo,
  TodoResponse: single,
  TodoListResponse: list,
  Error: {
    type: 'object', required: ['error'], properties: {
      error: {
        type: 'object', required: ['code', 'message'], properties: {
          code: { type: 'string' }, message: { type: 'string' },
          fields: { type: 'object', description: 'Optional field-to-message arrays. Root-level validation can produce an empty map; malformed JSON omits it.', additionalProperties: { type: 'array', items: { type: 'string' } } },
        },
      },
    },
  },
};

const sample: Todo = {
  id: 'f5f24d2f-7a55-4aeb-b101-5b28d2040b82', title: 'Prepare demo', description: null,
  dueAt: null, ordinal: 0, completed: false, deleted: false,
  createdAt: '2026-11-09T12:00:00.000Z', updatedAt: '2026-11-09T12:00:00.000Z',
};
const createExample: z.input<typeof createTodoSchema> = { title: 'Prepare demo', description: null, dueAt: null };
function errorResponse(code: string, message: string, description: string): OpenAPIV3.ResponseObject {
  return { description, content: { 'application/json': { schema: ref('Error'), example: { error: { code, message } } } } };
}
const responses: Record<string, OpenAPIV3.ResponseObject> = {
  ValidationError: {
    description: 'Invalid body, UUID, query or temporal value. Unknown fields and empty content updates are rejected.',
    content: { 'application/json': { schema: ref('Error'), examples: {
      field: { value: { error: { code: 'VALIDATION_ERROR', message: 'Please correct the highlighted fields.', fields: { title: ['Enter a title.'] } } } },
      dueAt: { value: { error: { code: 'VALIDATION_ERROR', message: 'Please correct the highlighted fields.', fields: { dueAt: ['Choose a future due date and time.'] } } } },
      root: { value: { error: { code: 'VALIDATION_ERROR', message: 'Please correct the highlighted fields.', fields: {} } } },
      malformedJson: { value: { error: { code: 'VALIDATION_ERROR', message: 'Request must contain valid JSON.' } } },
    } } },
  },
  TodoNotFound: errorResponse('TODO_NOT_FOUND', 'This task is no longer available.', 'Missing or soft-deleted task; repeated deletion also returns 404.'),
  RouteNotFound: errorResponse('ROUTE_NOT_FOUND', 'This endpoint does not exist.', 'Unknown API path or unmatched method; no dedicated 405 response.'),
  OrdinalExhausted: errorResponse('ORDINAL_EXHAUSTED', 'No further task order values are available.', 'No representable next ordinal; create only.'),
  PayloadTooLarge: errorResponse('PAYLOAD_TOO_LARGE', 'Request is too large.', 'JSON body exceeds 32 KB.'),
  UnsupportedMediaType: errorResponse('UNSUPPORTED_MEDIA_TYPE', 'Use application/json.', 'POST/PATCH requires application/json.'),
  StorageBusy: { ...errorResponse('STORAGE_BUSY', 'Storage is busy. Please try again.', 'Known storage contention exhausted bounded retries (create/content update only).'), headers: { 'Retry-After': { description: 'Retry delay in seconds.', schema: { type: 'string', enum: ['1'] } } } },
  InternalError: errorResponse('INTERNAL_ERROR', 'Something went wrong. Please try again.', 'Unexpected failure; no internal details are exposed. Storage failures outside the retry wrapper also use this response.'),
};
const responseRef = (name: string): OpenAPIV3.ReferenceObject => ({ $ref: `#/components/responses/${name}` });
const errors = (write = false, item = false, retry = false): OpenAPIV3.ResponsesObject => ({
  '400': responseRef('ValidationError'), '500': responseRef('InternalError'),
  ...(item && { '404': responseRef('TodoNotFound') }),
  ...(write && { '413': responseRef('PayloadTooLarge'), '415': responseRef('UnsupportedMediaType') }),
  ...(retry && { '503': responseRef('StorageBusy') }),
});
const success = (array = false): OpenAPIV3.ResponseObject => ({
  description: array ? 'Matching non-deleted tasks in descending ordinal order.' : 'Current non-deleted task.',
  content: { 'application/json': { schema: ref(array ? 'TodoListResponse' : 'TodoResponse'), example: { data: array ? [sample] : sample } } },
});
const body = (name: string): OpenAPIV3.RequestBodyObject => ({ required: true, content: { 'application/json': { schema: ref(name), ...(name === 'CreateTodo' && { example: createExample }), ...(name === 'Completion' && { example: { completed: true } }), ...(name === 'UpdateTodo' && { example: { description: null } }) } } });
const idParameter: OpenAPIV3.ParameterObject = { name: 'id', in: 'path', required: true, description: 'Task UUID.', schema: ref('TodoId') };

export const openapiDocument: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'Everyday Todo API', version: '1.0.0',
    description: 'Local single-user task API. No authentication, authorisation roles or per-user isolation. Swagger UI is browse-only. Unknown API paths/methods return 404 ROUTE_NOT_FOUND. The shared JSON parser can return 400 for malformed JSON or 413 above 32 KB on any API request with JSON content; POST/PATCH also require application/json (415). All failures use the Error envelope. Content saves are last-successful-save wins; there are no version tokens. Do not automatically retry a mutation after an ambiguous network failure: it may already have committed. Documentation schemas describe structural input; field descriptions specify trimming and write-time semantic rules.',
  },
  servers: [{ url: '/', description: 'Same origin (backend or Vite proxy).' }],
  security: [], tags: [{ name: 'Todos', description: 'Task content, completion and soft deletion.' }],
  paths: {
    '/api/todos': {
      get: {
        tags: ['Todos'], operationId: 'listTodos', summary: 'List tasks',
        description: 'Always excludes deleted tasks. Defaults to incomplete tasks; true includes both states. Uses descending ordinal order without pagination. Unknown or repeated query parameters are invalid.',
        parameters: [{ name: 'includeCompleted', in: 'query', required: false, schema: property(query, 'includeCompleted') }],
        responses: { '200': success(true), ...errors() },
      },
      post: {
        tags: ['Todos'], operationId: 'createTodo', summary: 'Create a task', requestBody: body('CreateTodo'),
        responses: { '201': { ...success(), description: 'Task created.', headers: { Location: { description: 'Relative path to the created task.', schema: { type: 'string' }, example: '/api/todos/' + sample.id } } }, ...errors(true, false, true), '409': responseRef('OrdinalExhausted') },
      },
    },
    '/api/todos/{id}': {
      parameters: [idParameter],
      get: { tags: ['Todos'], operationId: 'getTodo', summary: 'Get a task', responses: { '200': success(), ...errors(false, true) } },
      patch: { tags: ['Todos'], operationId: 'updateTodo', summary: 'Update task content', description: 'Nonempty subset of title, description and dueAt. Omission preserves values; null clears nullable fields. Completion and system-managed fields are not accepted.', requestBody: body('UpdateTodo'), responses: { '200': success(), ...errors(true, true, true) } },
      delete: { tags: ['Todos'], operationId: 'deleteTodo', summary: 'Soft-delete a task', description: 'Retains the stored record; subsequent reads, edits, completion changes and repeated deletion return 404. No restore or reorder operation.', responses: { '204': { description: 'Task soft-deleted. No response body.' }, ...errors(false, true) } },
    },
    '/api/todos/{id}/completion': {
      parameters: [idParameter],
      patch: { tags: ['Todos'], operationId: 'setTodoCompletion', summary: 'Set completion state', description: 'Requires exactly one boolean completed property; sets an explicit state rather than toggling. Existing overdue dates remain valid.', requestBody: body('Completion'), responses: { '200': success(), ...errors(true, true) } },
    },
  },
  components: { schemas, responses },
};
