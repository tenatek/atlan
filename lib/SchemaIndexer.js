const { JSONPath } = require('acamani');

class SchemaIndexer {

  static checkDescriptor(descriptor, schemaPath, indexingResult) {
    if (descriptor.type === 'ref') {
      let result = {
        path: schemaPath.slice(),
        ref: descriptor.ref
      };
      indexingResult.push(result);
    }
    if (descriptor.type === 'array') {
      // if this is an array descriptor, check the descriptor of the array items
      let itemsSchemaPath = schemaPath.slice();
      itemsSchemaPath.push('*');

      SchemaIndexer.checkDescriptor(
        descriptor.items,
        itemsSchemaPath,
        indexingResult
      );
    }
    if (descriptor.type === 'object') {
      // if this is an object descriptor, check the descriptors of the object properties
      for (let property in descriptor.properties) {
        let propertySchemaPath = schemaPath.slice();
        propertySchemaPath.push(property);

        SchemaIndexer.checkDescriptor(
          descriptor.properties[property],
          propertySchemaPath,
          indexingResult
        );
      }
    }
  }

  static indexSchema(schema) {
    let schemaPath = new JSONPath();
    let indexingResult = [];
    SchemaIndexer.checkDescriptor(schema, schemaPath, indexingResult);
    return indexingResult;
  }

}

module.exports = SchemaIndexer;
