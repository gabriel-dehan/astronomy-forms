Tools = Tools || {};
Tools.Record = {
  toDoc: function(record, model) {
    let fields = model.getFields();
    let relations = model.getRelations();
    let docField = R.map(function(field) {
      let obj = {};
      if (!_.isUndefined(record[field])) {
        obj[field] = record[field];
      }
      return obj;
    });

    let docRelation = R.map(function(relationName) {
      var obj = {};
      var relation = record.getRelated(relationName);

      // Is has many
      if (relation && relation.hasOwnProperty('collection')) {
        let relations = relation.fetch();
        _.each(relations, function(relationRecord, index) {
          let baseName = `${relationName}.${index}`;
          let fields   = R.keys(relationRecord._original);
          _.each(fields, function(fieldName) {
            obj[`${baseName}.${fieldName}`] = relationRecord[fieldName];
          });
        });
      // Is has one or belongs to
      } else if (relation) {
        let fields = R.keys(relation._original);
        _.each(fields, function(fieldName) {
          obj[`${relationName}.${fieldName}`] = relation[fieldName];
        });
      }

      return obj;
    });

    let populateDocWithFields    =  R.compose(R.mergeAll, docField, R.keys);
    let populateDocWithRelations =  R.compose(R.mergeAll, docRelation, R.keys);
    debugger;
    return R.merge(populateDocWithFields(fields), populateDocWithRelations(relations))
  }
};
