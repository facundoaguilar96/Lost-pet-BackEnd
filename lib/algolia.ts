import algoliasearch from "algoliasearch";

const client = algoliasearch(process.env.AG_U, process.env.AG_P);
export const index = client.initIndex("pets");
