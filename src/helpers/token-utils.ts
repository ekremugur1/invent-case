import { EntitySchema } from "typeorm";

export const getRepositoryToken = (entity: Function | EntitySchema): string => {
  return (entity as unknown as Function).name;
};
