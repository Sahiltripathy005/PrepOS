export const INDEX_CONVENTIONS = {
  naming: {
    standard: "idx_<tableName>_<columnName>",
    composite: "idx_<tableName>_<col1>_<col2>",
    unique: "uq_<tableName>_<columnName>",
    foreignKey: "fk_<tableName>_<referencedTable>_<columnName>"
  },
  guidelines: [
    "Always create an index on foreign key columns used in database relationships.",
    "Use composite indexes when queries filter on multiple fields concurrently.",
    "Place the column with the highest cardinality first in composite index declarations.",
    "Avoid indexing fields with low cardinality (such as boolean flags) unless part of a composite index.",
    "Monitor index sizes and drop unused indexes to optimize write operations."
  ]
};

export class IndexStrategy {
  public static getConventions() {
    return INDEX_CONVENTIONS;
  }
}
