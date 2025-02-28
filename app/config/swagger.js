import YAML from "yamljs";

// Load the YAML files
const mainSwaggerDoc = YAML.load("swagger.yaml");
const modelsSwaggerDoc = YAML.load("swagger-models.yaml");
const extensionsSwaggerDoc = YAML.load("swagger-extensions.yaml");

// Merge the schemas from all files
if (modelsSwaggerDoc.components && modelsSwaggerDoc.components.schemas) {
  mainSwaggerDoc.components = mainSwaggerDoc.components || {};
  mainSwaggerDoc.components.schemas = {
    ...mainSwaggerDoc.components.schemas,
    ...modelsSwaggerDoc.components.schemas,
  };
}

// Merge the examples and additional schemas from extensions
if (extensionsSwaggerDoc.components) {
  if (extensionsSwaggerDoc.components.schemas) {
    mainSwaggerDoc.components.schemas = {
      ...mainSwaggerDoc.components.schemas,
      ...extensionsSwaggerDoc.components.schemas,
    };
  }

  if (extensionsSwaggerDoc.components.examples) {
    mainSwaggerDoc.components.examples = {
      ...(mainSwaggerDoc.components.examples || {}),
      ...extensionsSwaggerDoc.components.examples,
    };
  }
}

// Enhanced path descriptions from extensions
if (extensionsSwaggerDoc.paths) {
  for (const [path, pathData] of Object.entries(extensionsSwaggerDoc.paths)) {
    if (mainSwaggerDoc.paths[path]) {
      for (const [method, methodData] of Object.entries(pathData)) {
        if (mainSwaggerDoc.paths[path][method]) {
          // Merge method data
          mainSwaggerDoc.paths[path][method] = {
            ...mainSwaggerDoc.paths[path][method],
            ...methodData,
          };
        }
      }
    }
  }
}

export default mainSwaggerDoc;
