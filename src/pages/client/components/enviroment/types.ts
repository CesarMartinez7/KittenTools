export interface EnviromentLayout {
  id: string;
  name: string;
  values: Value[];
  _postman_variable_scope: string;
  _postman_exported_at: string;
  _postman_exported_using: string;
}

export interface Value {
  key: string;
  value: string;
  type: string;
  enabled: boolean;
}
